#!/usr/bin/env python3
"""
Debug script to check admin configuration and user access.
"""

import os
import sys
sys.path.append('.')

from dotenv import load_dotenv
from utils.config import config

def debug_admin_access():
    """Debug admin access configuration."""
    
    print("=== Admin Access Debug ===")
    
    # Load environment variables
    load_dotenv()
    
    # Check if .env file exists
    env_file = ".env"
    if os.path.exists(env_file):
        print(f"✅ .env file found at: {os.path.abspath(env_file)}")
    else:
        print(f"❌ .env file NOT found at: {os.path.abspath(env_file)}")
        print("You need to create a .env file in the backend directory")
    
    # Check ADMIN_USER_IDS environment variable
    admin_user_ids_env = os.getenv("ADMIN_USER_IDS")
    print(f"\nADMIN_USER_IDS from env: {admin_user_ids_env}")
    
    # Check config object
    print(f"Config ADMIN_USER_IDS: {config.ADMIN_USER_IDS}")
    print(f"Config ADMIN_USER_LIST: {config.ADMIN_USER_LIST}")
    
    # Test a user ID
    test_user_id = input("\nEnter your Supabase user ID to test: ").strip()
    if test_user_id:
        is_admin = test_user_id in config.ADMIN_USER_LIST
        print(f"\nIs '{test_user_id}' an admin? {is_admin}")
        
        if not is_admin and config.ADMIN_USER_LIST:
            print(f"Admin list contains: {config.ADMIN_USER_LIST}")
            print("Make sure your user ID exactly matches what's in the list")
    
    print("\n=== Environment Info ===")
    print(f"ENV_MODE: {config.ENV_MODE}")
    print(f"Working directory: {os.getcwd()}")

if __name__ == "__main__":
    debug_admin_access() 