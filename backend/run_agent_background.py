import sentry
import asyncio
import json
import traceback
from datetime import datetime, timezone
from typing import Optional
from services import redis
from agent.run import run_agent
from utils.logger import logger
import dramatiq
import uuid
from agentpress.thread_manager import ThreadManager
from services.supabase import DBConnection
from services import redis
from dramatiq.brokers.rabbitmq import RabbitmqBroker
import os
from services.langfuse import langfuse

# Use RabbitMQ broker for dramatiq - exactly as in upstream
rabbitmq_host = os.getenv('RABBITMQ_HOST', 'rabbitmq')
rabbitmq_port = int(os.getenv('RABBITMQ_PORT', 5672))
rabbitmq_broker = RabbitmqBroker(host=rabbitmq_host, port=rabbitmq_port, middleware=[dramatiq.middleware.AsyncIO()])
dramatiq.set_broker(rabbitmq_broker)

_initialized = False
db = DBConnection()
instance_id = "single"

async def initialize():
    """Initialize the agent API with resources from the main API."""
    global db, instance_id, _initialized
    if _initialized:
        return

    # Use provided instance_id or generate a new one
    if not instance_id:
        # Generate instance ID
        instance_id = str(uuid.uuid4())[:8]
    await redis.initialize_async()
    await db.initialize()

    _initialized = True
    logger.info(f"Initialized agent API with instance ID: {instance_id}")


@dramatiq.actor
async def run_agent_background(
    agent_run_id: str,
    thread_id: str,
    instance_id: str,
    project_id: str,
    model_name: str,
    enable_thinking: Optional[bool],
    reasoning_effort: Optional[str],
    stream: bool,
    enable_context_manager: bool,
    agent_config: Optional[dict] = None
):
    """Run the agent in the background using Redis for state."""
    await initialize()

    sentry.sentry.set_tag("thread_id", thread_id)

    logger.info(f"Starting background agent run: {agent_run_id} for thread: {thread_id} (Instance: {instance_id})")
    logger.info(f"🚀 Using model: {model_name} (thinking: {enable_thinking}, reasoning_effort: {reasoning_effort})")
    if agent_config:
        logger.info(f"Using custom agent: {agent_config.get('name', 'Unknown')}")

    client = await db.client
    start_time = datetime.now(timezone.utc)
    total_responses = 0
    pubsub = None
    stop_checker = None
    stop_signal_received = False

    # Define Redis keys and channels
    response_list_key = f"agent_run:{agent_run_id}:responses"
    response_channel = f"agent_run:{agent_run_id}:new_response"
    instance_control_channel = f"agent_run:{agent_run_id}:control:{instance_id}"
    global_control_channel = f"agent_run:{agent_run_id}:control"
    instance_active_key = f"active_run:{instance_id}:{agent_run_id}"

    async def check_for_stop_signal():
        nonlocal stop_signal_received
        if not pubsub: return
        try:
            while not stop_signal_received:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=0.5)
                if message and message.get("type") == "message":
                    data = message.get("data")
                    if isinstance(data, bytes): data = data.decode('utf-8')
                    if data == "STOP":
                        logger.info(f"Received STOP signal for agent run {agent_run_id} (Instance: {instance_id})")
                        stop_signal_received = True
                        break
                # Periodically refresh the active run key TTL
                if total_responses % 50 == 0: # Refresh every 50 responses or so
                    try: await redis.expire(instance_active_key, redis.REDIS_KEY_TTL)
                    except Exception as ttl_err: logger.warning(f"Failed to refresh TTL for {instance_active_key}: {ttl_err}")
                await asyncio.sleep(0.1) # Short sleep to prevent tight loop
        except asyncio.CancelledError:
            logger.info(f"Stop signal checker cancelled for {agent_run_id} (Instance: {instance_id})")
        except Exception as e:
            logger.error(f"Error in stop signal checker for {agent_run_id}: {e}", exc_info=True)
            stop_signal_received = True # Stop the run if the checker fails

    trace = langfuse.trace(name="agent_run", id=agent_run_id, session_id=thread_id, metadata={"project_id": project_id, "instance_id": instance_id})
    try:
        # Setup Pub/Sub listener for control signals
        pubsub = await redis.create_pubsub()
        await pubsub.subscribe(instance_control_channel, global_control_channel)
        logger.debug(f"Subscribed to control channels: {instance_control_channel}, {global_control_channel}")
        stop_checker = asyncio.create_task(check_for_stop_signal())

        # Ensure active run key exists and has TTL
        await redis.set(instance_active_key, "running", ex=redis.REDIS_KEY_TTL)


        # Initialize agent generator
        agent_gen = run_agent(
            thread_id=thread_id, project_id=project_id, stream=stream,
            model_name=model_name,
            enable_thinking=enable_thinking, reasoning_effort=reasoning_effort,
            enable_context_manager=enable_context_manager,
            agent_config=agent_config,
            trace=trace
        )

        final_status = "running"
        error_message = None

        async for response in agent_gen:
            if stop_signal_received:
                logger.info(f"Agent run {agent_run_id} stopped by signal.")
                final_status = "stopped"
                trace.span(name="agent_run_stopped").end(status_message="agent_run_stopped", level="WARNING")
                break

            # Store response in Redis list and publish notification
            response_json = json.dumps(response)
            asyncio.create_task(redis.rpush(response_list_key, response_json))
            asyncio.create_task(redis.publish(response_channel, "new"))
            total_responses += 1

            # Check for agent-signaled completion or error
            if response.get('type') == 'status':
                 status_val = response.get('status')
                 if status_val in ['completed', 'failed', 'stopped']:
                     logger.info(f"Agent run {agent_run_id} finished via status message: {status_val}")
                     final_status = status_val
                     if status_val == 'failed' or status_val == 'stopped':
                         error_message = response.get('message', f"Run ended with status: {status_val}")
                     break

        # If loop finished without explicit completion/error/stop signal, mark as completed
        if final_status == "running":
             final_status = "completed"
             duration = (datetime.now(timezone.utc) - start_time).total_seconds()
             logger.info(f"Agent run {agent_run_id} completed normally (duration: {duration:.2f}s, responses: {total_responses})")
             completion_message = {"type": "status", "status": "completed", "message": "Agent run completed successfully"}
             trace.span(name="agent_run_completed").end(status_message="agent_run_completed")
             await redis.rpush(response_list_key, json.dumps(completion_message))
             await redis.publish(response_channel, "new") # Notify about the completion message

        # Fetch final responses from Redis for DB update
        all_responses_json = await redis.lrange(response_list_key, 0, -1)
        all_responses = [json.loads(r) for r in all_responses_json]

        # Update DB status
        await update_agent_run_status(client, agent_run_id, final_status, error=error_message, responses=all_responses)

        # Publish final control signal (END_STREAM or ERROR)
        control_signal = "END_STREAM" if final_status == "completed" else "ERROR" if final_status == "failed" else "STOP"
        try:
            await redis.publish(global_control_channel, control_signal)
            # No need to publish to instance channel as the run is ending on this instance
            logger.debug(f"Published final control signal '{control_signal}' to {global_control_channel}")
        except Exception as e:
            logger.warning(f"Failed to publish final control signal {control_signal}: {str(e)}")

    except Exception as e:
        error_message = str(e)
        traceback_str = traceback.format_exc()
        duration = (datetime.now(timezone.utc) - start_time).total_seconds()
        logger.error(f"Error in agent run {agent_run_id} after {duration:.2f}s: {error_message}\n{traceback_str} (Instance: {instance_id})")
        final_status = "failed"
        trace.span(name="agent_run_failed").end(status_message=error_message, level="ERROR")

        # Push error message to Redis list
        error_response = {"type": "status", "status": "error", "message": error_message}
        try:
            await redis.rpush(response_list_key, json.dumps(error_response))
            await redis.publish(response_channel, "new")
        except Exception as redis_err:
             logger.error(f"Failed to push error response to Redis for {agent_run_id}: {redis_err}")

        # Fetch final responses (including the error)
        all_responses = []
        try:
             all_responses_json = await redis.lrange(response_list_key, 0, -1)
             all_responses = [json.loads(r) for r in all_responses_json]
        except Exception as redis_fetch_err:
             logger.error(f"Failed to fetch responses from Redis for DB update: {redis_fetch_err}")

        # Update DB with error status
        await update_agent_run_status(client, agent_run_id, final_status, error=error_message, responses=all_responses)

        # Publish error control signal
        try:
            await redis.publish(global_control_channel, "ERROR")
            logger.debug(f"Published ERROR control signal to {global_control_channel}")
        except Exception as pub_err:
            logger.warning(f"Failed to publish ERROR signal: {str(pub_err)}")

    finally:
        # Cleanup stop checker task
        if stop_checker and not stop_checker.done():
            stop_checker.cancel()
            try: await stop_checker
            except asyncio.CancelledError: pass
            except Exception as e: logger.warning(f"Error during stop_checker cancellation: {e}")

        # Close pubsub connection
        if pubsub:
            try:
                await pubsub.unsubscribe()
                await pubsub.close()
                logger.debug(f"Closed pubsub connection for {agent_run_id}")
            except Exception as e:
                logger.warning(f"Error closing pubsub for {agent_run_id}: {str(e)}")

        # Set TTL on the response list in Redis
        await _cleanup_redis_response_list(agent_run_id)

        # Remove the instance-specific active run key
        await _cleanup_redis_instance_key(agent_run_id)

        # End trace
        trace.update(output={"final_status": final_status})


async def _cleanup_redis_instance_key(agent_run_id: str):
    """Remove the instance-specific active run key from Redis."""
    instance_active_key = f"active_run:{instance_id}:{agent_run_id}"
    try:
        await redis.delete(instance_active_key)
        logger.debug(f"Deleted active run key: {instance_active_key}")
    except Exception as e:
        logger.warning(f"Failed to delete active run key {instance_active_key}: {str(e)}")


async def _cleanup_redis_response_list(agent_run_id: str):
    """Set TTL on the response list in Redis to clean up later."""
    response_list_key = f"agent_run:{agent_run_id}:responses"
    try:
        await redis.expire(response_list_key, redis.REDIS_KEY_TTL)
        logger.debug(f"Set TTL on response list: {response_list_key}")
    except Exception as e:
        logger.warning(f"Failed to set TTL on response list {response_list_key}: {str(e)}")


async def update_agent_run_status(
    client,
    agent_run_id: str,
    status: str,
    error: Optional[str] = None,
    responses: Optional[list[any]] = None # Expects parsed list of dicts
) -> bool:
    """Update the status of an agent run in the database."""
    try:
        update_data = {
            "status": status,
            "ended_at": datetime.now(timezone.utc).isoformat()
        }

        if error:
            update_data["error"] = error

        if responses:
            update_data["responses"] = responses

        response = await client.table("agent_runs")\
            .update(update_data)\
            .eq("id", agent_run_id)\
            .execute()

        if response.data:
            logger.info(f"Updated agent run {agent_run_id} status to '{status}'")
            return True
        else:
            logger.warning(f"Failed to update agent run {agent_run_id} status in database")
            return False
    except Exception as e:
        logger.error(f"Error updating agent run {agent_run_id} status: {e}", exc_info=True)
        return False


# Backwards compatibility alias
run_agent_background_sync = run_agent_background
