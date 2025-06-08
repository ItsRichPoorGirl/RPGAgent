#!/bin/bash

# Admin Bypass Restoration Script
# Applies admin bypass functionality to fresh upstream code

echo "🔐 Applying Admin Bypass Functionality..."

# 1. Update backend configuration to include admin user IDs
echo "📝 Adding admin configuration to backend/utils/config.py..."

# Add ADMIN_USER_IDS to Configuration class
cat >> temp_config_addition.py << 'EOF'

    # Admin configuration - comma-separated list of admin user IDs
    ADMIN_USER_IDS: Optional[str] = None

    @property
    def get_admin_user_ids(self) -> list[str]:
        """Parse comma-separated admin user IDs into a list."""
        if not self.ADMIN_USER_IDS:
            return []
        return [user_id.strip() for user_id in self.ADMIN_USER_IDS.split(',') if user_id.strip()]
EOF

# Insert admin config before the __init__ method in config.py
sed -i '/def __init__(self):/i\    # Admin configuration - comma-separated list of admin user IDs\
    ADMIN_USER_IDS: Optional[str] = None\
\
    @property\
    def get_admin_user_ids(self) -> list[str]:\
        """Parse comma-separated admin user IDs into a list."""\
        if not self.ADMIN_USER_IDS:\
            return []\
        return [user_id.strip() for user_id in self.ADMIN_USER_IDS.split(",") if user_id.strip()]\
' backend/utils/config.py

# 2. Add admin bypass to billing service
echo "💳 Adding admin bypass to billing service..."

# Create admin bypass code snippet
cat > temp_admin_bypass.py << 'EOF'
    # Admin bypass - check if user is admin (following existing pattern)
    try:
        admin_user_ids = config.get_admin_user_ids
        logger.info(f"DEBUG: admin_user_ids={admin_user_ids}, user_id={user_id}")
        if user_id in admin_user_ids:
            logger.info(f"Admin billing bypass activated for user ID: {user_id}")
            return True, "Admin access - billing bypassed", {
                "price_id": "admin_unlimited",
                "plan_name": "Admin Unlimited", 
                "minutes_limit": "unlimited"
            }
        else:
            logger.info(f"DEBUG: User {user_id} not in admin list {admin_user_ids}")
    except Exception as e:
        logger.warning(f"Error checking admin status for user {user_id}: {str(e)}")
EOF

# Insert admin bypass into check_billing_status function
sed -i '/if config.ENV_MODE == EnvMode.LOCAL:/r temp_admin_bypass.py' backend/services/billing.py

# 3. Add admin bypass to model access function
cat > temp_model_admin_bypass.py << 'EOF'
        # Admin bypass - check if user is admin (following existing pattern)
        try:
            admin_user_ids = config.get_admin_user_ids
            logger.info(f"DEBUG: admin_user_ids={admin_user_ids}, user_id={user_id}")
            if user_id in admin_user_ids:
                logger.info(f"Admin model access bypass activated for user ID: {user_id}")
                return True, "Admin access - all models available", ["all_models"]
            else:
                logger.info(f"DEBUG: User {user_id} not in admin list {admin_user_ids}")
        except Exception as e:
            logger.warning(f"Error checking admin status for model access for user {user_id}: {str(e)}")
EOF

# Insert admin bypass into can_use_model function  
sed -i '/if config.ENV_MODE == EnvMode.LOCAL:/r temp_model_admin_bypass.py' backend/services/billing.py

# 4. Add admin bypass to available models endpoint
cat > temp_models_admin_bypass.py << 'EOF'
        # Admin bypass - check if user is admin (following existing pattern)
        try:
            admin_user_ids = config.get_admin_user_ids
            logger.info(f"DEBUG: admin_user_ids={admin_user_ids}, user_id={current_user_id}")
            if current_user_id in admin_user_ids:
                logger.info(f"Admin model access bypass activated for user ID: {current_user_id}")
                
                # Return ALL models from the system with proper structure
                all_models = set()
                model_aliases = {}
                
                for short_name, full_name in MODEL_NAME_ALIASES.items():
                    all_models.add(full_name)
                    if short_name != full_name and not short_name.startswith("openai/") and not short_name.startswith("anthropic/") and not short_name.startswith("openrouter/") and not short_name.startswith("xai/"):
                        if full_name not in model_aliases:
                            model_aliases[full_name] = short_name
                
                # Create model info for admin with ALL models available
                admin_model_info = []
                for model in all_models:
                    display_name = model_aliases.get(model, model.split('/')[-1] if '/' in model else model)
                    
                    admin_model_info.append({
                        "id": model,
                        "display_name": display_name,
                        "short_name": model_aliases.get(model),
                        "requires_subscription": False,  # Admin gets everything for free
                        "is_available": True  # Admin gets access to everything
                    })
                
                return {
                    "models": admin_model_info,
                    "subscription_tier": "Admin Unlimited",
                    "total_models": len(admin_model_info)
                }
            else:
                logger.info(f"DEBUG: User {current_user_id} not in admin list {admin_user_ids}")
        except Exception as e:
            logger.warning(f"Error checking admin status for model access for user {current_user_id}: {str(e)}")
EOF

# Find the get_available_models function and insert admin bypass
sed -i '/# Get Supabase client - THIS WAS MISSING!/r temp_models_admin_bypass.py' backend/services/billing.py

# Clean up temporary files
rm -f temp_config_addition.py temp_admin_bypass.py temp_model_admin_bypass.py temp_models_admin_bypass.py

echo "✅ Admin bypass functionality applied successfully!"
echo "🔧 Don't forget to set ADMIN_USER_IDS environment variable with comma-separated user IDs"
echo "📋 Example: ADMIN_USER_IDS=user-id-1,user-id-2,user-id-3" 