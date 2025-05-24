import redis.asyncio as redis
import os
from dotenv import load_dotenv
import asyncio
from utils.logger import logger
from typing import List, Any

# Redis client
client = None
_initialized = False
_init_lock = asyncio.Lock()

# Constants
REDIS_KEY_TTL = 3600 * 24  # 24 hour TTL as safety mechanism


def initialize():
    """Initialize Redis connection using environment variables."""
    global client

    # Load environment variables if not already loaded
    load_dotenv()

    # Get Redis configuration
    redis_host = os.getenv('REDIS_HOST', 'redis')
    redis_port = int(os.getenv('REDIS_PORT', 6379))
    redis_password = os.getenv('REDIS_PASSWORD', '')
    # Convert string 'True'/'False' to boolean
    redis_ssl_str = os.getenv('REDIS_SSL', 'False')
    redis_ssl = redis_ssl_str.lower() == 'true'

    logger.info(f"Initializing Redis connection to {redis_host}:{redis_port}")

    # Create Redis client with basic configuration
    client = redis.Redis(
        host=redis_host,
        port=redis_port,
        password=redis_password,
        ssl=redis_ssl,
        decode_responses=True,
        socket_timeout=5.0,
        socket_connect_timeout=5.0,
        retry_on_timeout=True,
        health_check_interval=30
    )

    return client


async def initialize_async():
    """Initialize Redis connection asynchronously."""
    global client, _initialized

    async with _init_lock:
        if not _initialized:
            logger.info("Initializing Redis connection")
            initialize()

            try:
                await client.ping()
                logger.info("Successfully connected to Redis")
                _initialized = True
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                client = None
                raise

    return client


async def close():
    """Close Redis connection."""
    global client, _initialized
    if client:
        logger.info("Closing Redis connection")
        await client.aclose()
        client = None
        _initialized = False
        logger.info("Redis connection closed")


async def get_client():
    """Get the Redis client, initializing if necessary."""
    global client, _initialized
    if client is None or not _initialized:
        await initialize_async()
    return client


# Basic Redis operations
async def set(key: str, value: str, ex: int = None):
    """Set a Redis key."""
    # DEBUG: Log type and value of ex parameter to catch type issues
    if ex is not None:
        logger.debug(f"Redis SET debug - key: {key}, ex type: {type(ex)}, ex value: {ex}")
        if not isinstance(ex, int):
            logger.error(f"REDIS TYPE ERROR: set() ex parameter is not an integer! key={key}, ex type={type(ex)}, ex value={ex}")
    
    redis_client = await get_client()
    return await redis_client.set(key, value, ex=ex)


async def get(key: str, default: str = None):
    """Get a Redis key."""
    redis_client = await get_client()
    result = await redis_client.get(key)
    return result if result is not None else default


async def delete(key: str):
    """Delete a Redis key."""
    redis_client = await get_client()
    return await redis_client.delete(key)


async def publish(channel: str, message: str):
    """Publish a message to a Redis channel."""
    redis_client = await get_client()
    return await redis_client.publish(channel, message)


async def create_pubsub():
    """Create a Redis pubsub object."""
    redis_client = await get_client()
    return redis_client.pubsub()


async def create_streaming_pubsub():
    """Create a Redis pubsub object optimized for long-running streams."""
    # Get Redis configuration
    redis_host = os.getenv('REDIS_HOST', 'redis')
    redis_port = int(os.getenv('REDIS_PORT', 6379))
    redis_password = os.getenv('REDIS_PASSWORD', '')
    redis_ssl_str = os.getenv('REDIS_SSL', 'False')
    redis_ssl = redis_ssl_str.lower() == 'true'

    # Create a dedicated Redis client for streaming with longer timeouts
    streaming_client = redis.Redis(
        host=redis_host,
        port=redis_port,
        password=redis_password,
        ssl=redis_ssl,
        decode_responses=True,
        socket_timeout=300.0,  # 5 minutes timeout instead of 5 seconds
        socket_connect_timeout=10.0,  # 10 seconds to connect
        socket_keepalive=True,  # Enable TCP keepalive
        socket_keepalive_options={
            'TCP_KEEPINTVL': 1,  # Interval between keepalive probes
            'TCP_KEEPCNT': 3,    # Number of keepalive probes before timeout
            'TCP_KEEPIDLE': 1    # Seconds before sending keepalive probes
        },
        retry_on_timeout=True,
        health_check_interval=30
    )
    
    return streaming_client.pubsub()


# List operations
async def rpush(key: str, *values: Any):
    """Append one or more values to a list."""
    redis_client = await get_client()
    return await redis_client.rpush(key, *values)


async def lrange(key: str, start: int, end: int) -> List[str]:
    """Get a range of elements from a list."""
    # DEBUG: Log type and value of start/end parameters to catch type issues
    logger.debug(f"Redis LRANGE debug - key: {key}, start type: {type(start)}, start value: {start}, end type: {type(end)}, end value: {end}")
    if not isinstance(start, int):
        logger.error(f"REDIS TYPE ERROR: lrange() start parameter is not an integer! key={key}, start type={type(start)}, start value={start}")
    if not isinstance(end, int):
        logger.error(f"REDIS TYPE ERROR: lrange() end parameter is not an integer! key={key}, end type={type(end)}, end value={end}")
    
    redis_client = await get_client()
    return await redis_client.lrange(key, start, end)


async def llen(key: str) -> int:
    """Get the length of a list."""
    redis_client = await get_client()
    return await redis_client.llen(key)


# Key management
async def expire(key: str, time: int):
    """Set a key's time to live in seconds."""
    # DEBUG: Log type and value of time parameter to catch type issues
    logger.debug(f"Redis EXPIRE debug - key: {key}, time type: {type(time)}, time value: {time}")
    if not isinstance(time, int):
        logger.error(f"REDIS TYPE ERROR: expire() time parameter is not an integer! key={key}, time type={type(time)}, time value={time}")
    
    redis_client = await get_client()
    return await redis_client.expire(key, time)


async def keys(pattern: str) -> List[str]:
    """Get keys matching a pattern."""
    redis_client = await get_client()
    return await redis_client.keys(pattern)