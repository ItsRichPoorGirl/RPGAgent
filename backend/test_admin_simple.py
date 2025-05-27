#!/usr/bin/env python3
"""
Simple test to verify admin configuration parsing
"""

import os

def test_admin_parsing():
    """Test admin user ID parsing exactly as done in config.py"""
    
    # Simulate the environment variable
    admin_user_ids_raw = "42b78f2d-abc6-45ed-bea1-1b58553bb713"
    
    # Parse exactly as done in config.py
    admin_user_list = []
    if admin_user_ids_raw:
        admin_user_list = [uid.strip() for uid in admin_user_ids_raw.split(',') if uid.strip()]
    
    test_user_id = "42b78f2d-abc6-45ed-bea1-1b58553bb713"
    is_admin = test_user_id in admin_user_list
    
    print(f"Raw admin IDs: '{admin_user_ids_raw}'")
    print(f"Parsed admin list: {admin_user_list}")
    print(f"Test user ID: '{test_user_id}'")
    print(f"Is admin: {is_admin}")
    print(f"List length: {len(admin_user_list)}")
    
    if admin_user_list:
        print(f"First admin ID: '{admin_user_list[0]}'")
        print(f"First admin ID length: {len(admin_user_list[0])}")
        print(f"Test ID length: {len(test_user_id)}")
        print(f"IDs match exactly: {admin_user_list[0] == test_user_id}")

if __name__ == "__main__":
    test_admin_parsing() 