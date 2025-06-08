# Stripe Configuration - Luciq Customizations

## Overview
Custom Stripe pricing and product IDs configured specifically for Luciq brand and pricing structure.

## Backend Configuration Files

### 1. Main Configuration
**File**: `backend/utils/config.py`
- **Line ~40-90**: All Stripe tier price IDs (PROD and STAGING)
- **Line ~150-155**: Stripe product IDs (PROD and STAGING)
- **Line ~175-180**: Environment-based Stripe product ID selection

### 2. Billing Service Configuration  
**File**: `backend/services/billing.py`
- **Line ~25-35**: SUBSCRIPTION_TIERS mapping with Luciq price IDs
- **Line ~130-140**: Price ID validation against Luciq product IDs

## Frontend Configuration Files

### 3. Frontend Config
**File**: `frontend/src/lib/config.ts`
- **Line ~35-105**: PROD_TIERS and STAGING_TIERS with Luciq price IDs

### 4. Homepage Pricing
**File**: `frontend/src/lib/home.tsx`
- **Line ~110-180**: cloudPricingItems with Luciq Stripe price IDs

### 5. Pricing Component
**File**: `frontend/src/components/home/sections/pricing-section.tsx`
- Uses price IDs from siteConfig.cloudPricingItems

## Luciq-Specific Price IDs (Production)

```
FREE: 'price_1RMZYBCQSpuIbcUBKkOp4qfZ'
TIER_2_20: 'price_1RMZYBCQSpuIbcUBEsEwW6cO' 
TIER_6_50: 'price_1RMZYBCQSpuIbcUBoLIdk8yv'
TIER_12_100: 'price_1RMZYBCQSpuIbcUB4xpnBWn2'
TIER_25_200: 'price_1RMZYBCQSpuIbcUBrVEJblS7'
TIER_50_400: 'price_1RMZYBCQSpuIbcUBXR5gNWHO'
TIER_125_800: 'price_1RMZYBCQSpuIbcUBF4PsfCG9'
TIER_200_1000: 'price_1RMZYBCQSpuIbcUBlv69Sl4i'
```

## Luciq Product IDs
```
PRODUCTION: 'prod_SH7nxrLxYVFTgM'
STAGING: 'prod_SH7nxrLxYVFTgM' (same as production)
```

## Environment Variables Required
- `STRIPE_SECRET_KEY`: Luciq Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Luciq webhook secret
- Custom price IDs are hardcoded in config files

## Restoration Priority
🟡 **HIGH** - Essential for billing functionality but can be applied after core sync is working.

## Notes
- All staging tiers use same price IDs as production
- Price IDs are hardcoded rather than environment variables
- Product validation ensures only Luciq product subscriptions are processed 