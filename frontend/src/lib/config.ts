// Environment mode types
export enum EnvMode {
  LOCAL = 'local',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

// Subscription tier structure
export interface SubscriptionTierData {
  priceId: string;
  name: string;
}

// Subscription tiers structure
export interface SubscriptionTiers {
  FREE: SubscriptionTierData;
  TIER_2_20: SubscriptionTierData;
  TIER_6_50: SubscriptionTierData;
  TIER_12_100: SubscriptionTierData;
  TIER_25_200: SubscriptionTierData;
  TIER_50_400: SubscriptionTierData;
  TIER_125_800: SubscriptionTierData;
  TIER_200_1000: SubscriptionTierData;
}

// Configuration object
interface Config {
  ENV_MODE: EnvMode;
  IS_LOCAL: boolean;
  SUBSCRIPTION_TIERS: SubscriptionTiers;
}

// Production tier IDs
const PROD_TIERS: SubscriptionTiers = {
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
const STAGING_TIERS: SubscriptionTiers = {
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

// Determine the environment mode from environment variables
const getEnvironmentMode = (): EnvMode => {
  // Get the environment mode from the environment variable, if set
  const envMode = process.env.NEXT_PUBLIC_ENV_MODE?.toLowerCase();

  // First check if the environment variable is explicitly set
  if (envMode) {
    if (envMode === EnvMode.LOCAL) {
      console.log('Using explicitly set LOCAL environment mode');
      return EnvMode.LOCAL;
    } else if (envMode === EnvMode.STAGING) {
      console.log('Using explicitly set STAGING environment mode');
      return EnvMode.STAGING;
    } else if (envMode === EnvMode.PRODUCTION) {
      console.log('Using explicitly set PRODUCTION environment mode');
      return EnvMode.PRODUCTION;
    }
  }

  // If no valid environment mode is set, fall back to defaults based on NODE_ENV
  if (process.env.NODE_ENV === 'development') {
    console.log('Defaulting to LOCAL environment mode in development');
    return EnvMode.LOCAL;
  } else {
    console.log('Defaulting to PRODUCTION environment mode');
    return EnvMode.PRODUCTION;
  }
};

// Get the environment mode once to ensure consistency
const currentEnvMode = getEnvironmentMode();

// Create the config object
export const config: Config = {
  ENV_MODE: currentEnvMode,
  IS_LOCAL: currentEnvMode === EnvMode.LOCAL,
  SUBSCRIPTION_TIERS:
    currentEnvMode === EnvMode.STAGING ? STAGING_TIERS : PROD_TIERS,
};

// Helper function to check if we're in local mode (for component conditionals)
export const isLocalMode = (): boolean => {
  return config.IS_LOCAL;
};

// Export subscription tier type for typing elsewhere
export type SubscriptionTier = keyof typeof PROD_TIERS;
