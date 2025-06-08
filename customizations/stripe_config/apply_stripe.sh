#!/bin/bash

# Stripe Configuration Restoration Script
# Applies Luciq-specific Stripe pricing and product IDs to fresh upstream code

echo "💳 Applying Luciq Stripe Configuration..."

# 1. Update backend configuration with Luciq Stripe IDs
echo "📝 Adding Luciq Stripe configuration to backend/utils/config.py..."

# Replace upstream Stripe configuration with Luciq configuration
cat > temp_stripe_config.py << 'EOF'
    # Subscription tier IDs - Production
    STRIPE_FREE_TIER_ID_PROD: str = 'price_1RMZYBCQSpuIbcUBKkOp4qfZ'  # Free tier
    STRIPE_TIER_2_20_ID_PROD: str = 'price_1RMZYBCQSpuIbcUBEsEwW6cO'  # Tier 2
    STRIPE_TIER_6_50_ID_PROD: str = 'price_1RMZYBCQSpuIbcUBoLIdk8yv'  # Tier 6
    STRIPE_TIER_12_100_ID_PROD: str = 'price_1RMZYBCQSpuIbcUB4xpnBWn2'  # Tier 12
    STRIPE_TIER_25_200_ID_PROD: str = 'price_1RMZYBCQSpuIbcUBrVEJblS7'  # Tier 25
    STRIPE_TIER_50_400_ID_PROD: str = 'price_1RMZYBCQSpuIbcUBXR5gNWHO'  # Tier 50
    STRIPE_TIER_125_800_ID_PROD: str = 'price_1RMZYBCQSpuIbcUBF4PsfCG9'  # Tier 125
    STRIPE_TIER_200_1000_ID_PROD: str = 'price_1RMZYBCQSpuIbcUBlv69Sl4i'  # Tier 200
    
    # Subscription tier IDs - Staging (using same IDs as production since we only use live products)
    STRIPE_FREE_TIER_ID_STAGING: str = 'price_1RMZYBCQSpuIbcUBKkOp4qfZ'  # Free tier
    STRIPE_TIER_2_20_ID_STAGING: str = 'price_1RMZYBCQSpuIbcUBEsEwW6cO'  # Tier 2
    STRIPE_TIER_6_50_ID_STAGING: str = 'price_1RMZYBCQSpuIbcUBoLIdk8yv'  # Tier 6
    STRIPE_TIER_12_100_ID_STAGING: str = 'price_1RMZYBCQSpuIbcUB4xpnBWn2'  # Tier 12
    STRIPE_TIER_25_200_ID_STAGING: str = 'price_1RMZYBCQSpuIbcUBrVEJblS7'  # Tier 25
    STRIPE_TIER_50_400_ID_STAGING: str = 'price_1RMZYBCQSpuIbcUBXR5gNWHO'  # Tier 50
    STRIPE_TIER_125_800_ID_STAGING: str = 'price_1RMZYBCQSpuIbcUBF4PsfCG9'  # Tier 125
    STRIPE_TIER_200_1000_ID_STAGING: str = 'price_1RMZYBCQSpuIbcUBlv69Sl4i'  # Tier 200
    
    # Computed subscription tier IDs based on environment
    @property
    def STRIPE_FREE_TIER_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_FREE_TIER_ID_STAGING
        return self.STRIPE_FREE_TIER_ID_PROD
    
    @property
    def STRIPE_TIER_2_20_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_2_20_ID_STAGING
        return self.STRIPE_TIER_2_20_ID_PROD
    
    @property
    def STRIPE_TIER_6_50_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_6_50_ID_STAGING
        return self.STRIPE_TIER_6_50_ID_PROD
    
    @property
    def STRIPE_TIER_12_100_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_12_100_ID_STAGING
        return self.STRIPE_TIER_12_100_ID_PROD
    
    @property
    def STRIPE_TIER_25_200_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_25_200_ID_STAGING
        return self.STRIPE_TIER_25_200_ID_PROD
    
    @property
    def STRIPE_TIER_50_400_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_50_400_ID_STAGING
        return self.STRIPE_TIER_50_400_ID_PROD
    
    @property
    def STRIPE_TIER_125_800_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_125_800_ID_STAGING
        return self.STRIPE_TIER_125_800_ID_PROD
    
    @property
    def STRIPE_TIER_200_1000_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_TIER_200_1000_ID_STAGING
        return self.STRIPE_TIER_200_1000_ID_PROD
EOF

# Add Luciq product IDs
cat >> temp_stripe_config.py << 'EOF'

    # Stripe Product IDs
    STRIPE_PRODUCT_ID_PROD: str = 'prod_SH7nxrLxYVFTgM'  # Production product ID
    STRIPE_PRODUCT_ID_STAGING: str = 'prod_SH7nxrLxYVFTgM'  # Staging product ID (using same as production)

    @property
    def STRIPE_PRODUCT_ID(self) -> str:
        if self.ENV_MODE == EnvMode.STAGING:
            return self.STRIPE_PRODUCT_ID_STAGING
        return self.STRIPE_PRODUCT_ID_PROD
EOF

# Insert Luciq Stripe configuration after ENV_MODE definition
sed -i '/ENV_MODE: EnvMode = EnvMode.LOCAL/r temp_stripe_config.py' backend/utils/config.py

# 2. Update frontend configuration
echo "🎨 Adding Luciq Stripe configuration to frontend..."

# Update frontend config.ts with Luciq price IDs
cat > frontend/src/lib/config_luciq.ts << 'EOF'
// Luciq-specific Stripe configuration

// Production tier IDs
const PROD_TIERS = {
  FREE: {
    priceId: 'price_1RMZYBCQSpuIbcUBKkOp4qfZ',
    name: 'Free',
  },
  TIER_2_20: {
    priceId: 'price_1RMZYBCQSpuIbcUBEsEwW6cO',
    name: '2h/$20',
  },
  TIER_6_50: {
    priceId: 'price_1RMZYBCQSpuIbcUBoLIdk8yv',
    name: '6h/$50',
  },
  TIER_12_100: {
    priceId: 'price_1RMZYBCQSpuIbcUB4xpnBWn2',
    name: '12h/$100',
  },
  TIER_25_200: {
    priceId: 'price_1RMZYBCQSpuIbcUBrVEJblS7',
    name: '25h/$200',
  },
  TIER_50_400: {
    priceId: 'price_1RMZYBCQSpuIbcUBXR5gNWHO',
    name: '50h/$400',
  },
  TIER_125_800: {
    priceId: 'price_1RMZYBCQSpuIbcUBF4PsfCG9',
    name: '125h/$800',
  },
  TIER_200_1000: {
    priceId: 'price_1RMZYBCQSpuIbcUBlv69Sl4i',
    name: '200h/$1000',
  },
} as const;

// Staging tier IDs (using same IDs as production since we only use live products)
const STAGING_TIERS = PROD_TIERS;

// Export the appropriate tier based on environment
export const SUBSCRIPTION_TIERS = process.env.NODE_ENV === 'production' ? PROD_TIERS : STAGING_TIERS;
EOF

# Replace the existing config.ts with Luciq configuration
if [ -f "frontend/src/lib/config.ts" ]; then
    cp frontend/src/lib/config.ts frontend/src/lib/config_backup.ts
    cp frontend/src/lib/config_luciq.ts frontend/src/lib/config.ts
fi

# Clean up temporary files  
rm -f temp_stripe_config.py frontend/src/lib/config_luciq.ts

echo "✅ Luciq Stripe configuration applied successfully!"
echo "🔧 Ensure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set for Luciq account"
echo "📋 All pricing tiers use Luciq-specific price IDs" 