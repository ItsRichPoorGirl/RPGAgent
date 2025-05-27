from fastapi import APIRouter
import os
from utils.config import config

router = APIRouter()

@router.get("/admin-test")
async def admin_test():
    """Test endpoint to verify admin functionality is working."""
    
    test_user_id = "42b78f2d-abc6-45ed-bea1-1b58553bb713"
    
    # Get raw environment variable
    admin_ids_raw = os.getenv("ADMIN_USER_IDS", "NOT_SET")
    
    # Get parsed admin list from config
    admin_list = config.ADMIN_USER_LIST
    
    # Test if user is admin
    is_admin = test_user_id in admin_list
    
    return {
        "test_user_id": test_user_id,
        "admin_ids_env_raw": admin_ids_raw,
        "admin_list_parsed": admin_list,
        "is_admin": is_admin,
        "env_mode": config.ENV_MODE.value,
        "admin_functionality_loaded": True
    } 