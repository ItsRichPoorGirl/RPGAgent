#!/usr/bin/env python3
"""
Debug admin functionality - simple endpoint to test admin configuration
"""

import os
from fastapi import APIRouter

router = APIRouter()

@router.get("/debug-admin-status")
async def debug_admin_status():
    """Debug endpoint to check admin configuration without authentication."""
    
    # Get environment variables
    admin_user_ids_raw = os.getenv("ADMIN_USER_IDS", "")
    
    # Parse admin user list
    admin_user_list = []
    if admin_user_ids_raw:
        admin_user_list = [uid.strip() for uid in admin_user_ids_raw.split(',') if uid.strip()]
    
    # Test user ID
    test_user_id = "42b78f2d-abc6-45ed-bea1-1b58553bb713"
    is_admin = test_user_id in admin_user_list
    
    return {
        "admin_user_ids_env": admin_user_ids_raw,
        "admin_user_list": admin_user_list,
        "test_user_id": test_user_id,
        "is_admin": is_admin,
        "admin_count": len(admin_user_list),
        "env_vars_with_admin": {k: v for k, v in os.environ.items() if 'ADMIN' in k.upper()}
    } 