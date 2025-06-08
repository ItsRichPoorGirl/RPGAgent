# Admin Bypass Functionality - Locations and Implementation

## Overview
Admin bypass functionality allows specified user IDs to have unlimited access to billing features, model access, and bypass subscription limits.

## Configuration Files

### 1. Backend Configuration
**File**: `backend/utils/config.py`
- **Line ~160**: `ADMIN_USER_IDS: Optional[str] = None` - Environment variable for comma-separated admin user IDs
- **Line ~180-190**: `get_admin_user_ids` property method that parses the comma-separated string into a list

## Implementation Files

### 2. Billing Service 
**File**: `backend/services/billing.py`
- **Line ~275-290**: Admin bypass in `check_billing_status()` function
- **Line ~930-950**: Admin bypass in `get_available_models()` function 
- **Line ~235-250**: Admin bypass in `can_use_model()` function

## Key Implementation Pattern

```python
# Admin bypass - check if user is admin
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
```

## Environment Variables Required
- `ADMIN_USER_IDS`: Comma-separated list of user IDs (e.g., "user-id-1,user-id-2,user-id-3")

## Features Bypassed for Admin Users
1. **Billing Limits**: Unlimited usage regardless of subscription tier
2. **Model Access**: Access to ALL models in the system 
3. **Time Restrictions**: No 60-minute limits or monthly caps
4. **Subscription Requirements**: No need for paid subscriptions

## Restoration Priority
🔴 **CRITICAL** - This functionality is essential for administrative operations and should be restored first after any upstream sync. 