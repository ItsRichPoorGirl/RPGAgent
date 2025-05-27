#!/usr/bin/env python3
"""
Railway admin test endpoint - add this to your FastAPI app temporarily
to debug admin functionality in the actual deployment environment.
"""

from fastapi import APIRouter, Depends
from utils.config import config
from api.auth import get_current_user_id_from_jwt
import logging
import os

logger = logging.getLogger(__name__)

# Create a test router
test_router = APIRouter(prefix="/test", tags=["test"])

@test_router.get("/admin-debug")
async def debug_admin_config(current_user_id: str = Depends(get_current_user_id_from_jwt)):
    """
    Debug endpoint to check admin configuration in Railway environment.
    Call this endpoint to see what's happening with admin setup.
    """
    
    # Get all environment variables with ADMIN in the name
    admin_env_vars = {}
    for key, value in os.environ.items():
        if 'ADMIN' in key.upper():
            admin_env_vars[key] = value
    
    # Test the config
    try:
        admin_user_ids_raw = config.ADMIN_USER_IDS
        admin_user_list = config.ADMIN_USER_LIST
        is_current_user_admin = current_user_id in admin_user_list
    except Exception as e:
        return {
            "error": f"Config error: {str(e)}",
            "current_user_id": current_user_id
        }
    
    # Log everything for Railway logs
    logger.info(f"=== ADMIN DEBUG INFO ===")
    logger.info(f"Current user ID: {current_user_id}")
    logger.info(f"Raw ADMIN_USER_IDS: '{admin_user_ids_raw}'")
    logger.info(f"Parsed ADMIN_USER_LIST: {admin_user_list}")
    logger.info(f"Is current user admin: {is_current_user_admin}")
    logger.info(f"Admin env vars: {admin_env_vars}")
    logger.info(f"ENV_MODE: {config.ENV_MODE}")
    
    return {
        "current_user_id": current_user_id,
        "admin_user_ids_raw": admin_user_ids_raw,
        "admin_user_list": admin_user_list,
        "is_current_user_admin": is_current_user_admin,
        "admin_env_vars": admin_env_vars,
        "env_mode": config.ENV_MODE.value,
        "config_loaded": True
    }

@test_router.get("/billing-debug")
async def debug_billing_check(current_user_id: str = Depends(get_current_user_id_from_jwt)):
    """
    Debug endpoint to test the actual billing check with admin bypass.
    """
    from services.billing import check_billing_status
    from database.connection import DBConnection
    
    try:
        # Get database connection
        db = DBConnection()
        client = await db.client
        
        # Test the billing check
        can_run, message, subscription = await check_billing_status(client, current_user_id)
        
        # Log the result
        logger.info(f"=== BILLING DEBUG INFO ===")
        logger.info(f"User ID: {current_user_id}")
        logger.info(f"Can run: {can_run}")
        logger.info(f"Message: {message}")
        logger.info(f"Subscription: {subscription}")
        
        return {
            "user_id": current_user_id,
            "can_run": can_run,
            "message": message,
            "subscription": subscription,
            "admin_check_passed": "admin_unlimited" in str(subscription) if subscription else False
        }
        
    except Exception as e:
        logger.error(f"Billing debug error: {str(e)}")
        return {
            "error": str(e),
            "user_id": current_user_id
        }

# Instructions for adding to main app:
"""
To use this debug endpoint:

1. Add this to your main FastAPI app (api.py):
   
   from test_railway_admin import test_router
   app.include_router(test_router)

2. Deploy to Railway

3. Call these endpoints:
   - GET /test/admin-debug
   - GET /test/billing-debug

4. Check Railway logs for the detailed debug info

5. Remove this router after debugging
""" 