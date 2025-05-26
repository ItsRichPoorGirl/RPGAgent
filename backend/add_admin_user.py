#!/usr/bin/env python3
"""
Script to add admin user with unlimited access.
Run this script to add your user ID to the admin list.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def add_admin_user():
    """Add admin user ID to environment configuration."""
    
    # You'll need to replace this with your actual user ID from Supabase auth
    # You can find this in your Supabase dashboard under Authentication > Users
    admin_user_id = input("Enter your Supabase user ID: ").strip()
    
    if not admin_user_id:
        print("No user ID provided. Exiting.")
        return
    
    # Check if .env file exists
    env_file = ".env"
    env_content = ""
    
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            env_content = f.read()
    
    # Check if ADMIN_USER_IDS already exists
    if "ADMIN_USER_IDS=" in env_content:
        print("ADMIN_USER_IDS already exists in .env file.")
        print("Please manually add your user ID to the existing ADMIN_USER_IDS line.")
        print(f"Add this ID: {admin_user_id}")
    else:
        # Add ADMIN_USER_IDS to .env file
        with open(env_file, 'a') as f:
            f.write(f"\n# Admin users with unlimited access\n")
            f.write(f"ADMIN_USER_IDS={admin_user_id}\n")
        
        print(f"Added admin user ID {admin_user_id} to .env file")
        print("Restart your backend server for changes to take effect.")

if __name__ == "__main__":
    add_admin_user() 