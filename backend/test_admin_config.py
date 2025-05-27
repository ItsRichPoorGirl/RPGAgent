#!/usr/bin/env python3
"""
Test script to debug admin configuration issues.
This will help us understand exactly what's happening with the admin setup.
"""

import os
import sys
from dotenv import load_dotenv

# Add the backend directory to the path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_admin_config():
    """Test admin configuration loading and functionality."""
    
    print("=== ADMIN CONFIGURATION DEBUG TEST ===\n")
    
    # 1. Test environment variable loading
    print("1. Testing environment variable loading:")
    load_dotenv()
    
    admin_user_ids_raw = os.getenv("ADMIN_USER_IDS")
    print(f"   Raw ADMIN_USER_IDS from env: '{admin_user_ids_raw}'")
    print(f"   Type: {type(admin_user_ids_raw)}")
    print(f"   Length: {len(admin_user_ids_raw) if admin_user_ids_raw else 0}")
    
    if admin_user_ids_raw:
        print(f"   Repr: {repr(admin_user_ids_raw)}")
        admin_list_manual = [uid.strip() for uid in admin_user_ids_raw.split(',') if uid.strip()]
        print(f"   Manual parsing result: {admin_list_manual}")
    else:
        print("   ❌ ADMIN_USER_IDS is not set in environment!")
    
    print()
    
    # 2. Test config module loading
    print("2. Testing config module loading:")
    try:
        from utils.config import config
        print(f"   ✅ Config module loaded successfully")
        print(f"   ENV_MODE: {config.ENV_MODE}")
        print(f"   Config ADMIN_USER_IDS: '{config.ADMIN_USER_IDS}'")
        print(f"   Config ADMIN_USER_LIST: {config.ADMIN_USER_LIST}")
        print(f"   ADMIN_USER_LIST length: {len(config.ADMIN_USER_LIST)}")
    except Exception as e:
        print(f"   ❌ Error loading config: {e}")
        return
    
    print()
    
    # 3. Test with a sample user ID
    print("3. Testing admin check with sample user ID:")
    test_user_id = input("Enter a test user ID (or press Enter to skip): ").strip()
    
    if test_user_id:
        is_admin = test_user_id in config.ADMIN_USER_LIST
        print(f"   Test user ID: '{test_user_id}'")
        print(f"   Is admin: {is_admin}")
        
        if not is_admin and config.ADMIN_USER_LIST:
            print(f"   Available admin IDs: {config.ADMIN_USER_LIST}")
            print("   Checking for exact matches:")
            for admin_id in config.ADMIN_USER_LIST:
                print(f"     '{admin_id}' == '{test_user_id}': {admin_id == test_user_id}")
                print(f"     Length comparison: {len(admin_id)} vs {len(test_user_id)}")
                print(f"     Repr comparison: {repr(admin_id)} vs {repr(test_user_id)}")
    
    print()
    
    # 4. Test billing service import
    print("4. Testing billing service import:")
    try:
        from services.billing import check_billing_status
        print("   ✅ Billing service imported successfully")
    except Exception as e:
        print(f"   ❌ Error importing billing service: {e}")
        return
    
    print()
    
    # 5. Test all environment variables
    print("5. All environment variables containing 'ADMIN':")
    for key, value in os.environ.items():
        if 'ADMIN' in key.upper():
            print(f"   {key}: '{value}'")
    
    print()
    
    # 6. Test .env file content
    print("6. Checking .env file content:")
    env_files = ['.env', '../.env', '../../.env']
    for env_file in env_files:
        if os.path.exists(env_file):
            print(f"   Found {env_file}:")
            with open(env_file, 'r') as f:
                content = f.read()
                if 'ADMIN_USER_IDS' in content:
                    lines = content.split('\n')
                    for line in lines:
                        if 'ADMIN_USER_IDS' in line:
                            print(f"     {line}")
                else:
                    print(f"     No ADMIN_USER_IDS found in {env_file}")
        else:
            print(f"   {env_file} not found")
    
    print("\n=== END DEBUG TEST ===")

if __name__ == "__main__":
    test_admin_config() 