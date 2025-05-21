import stripe
import os
from dotenv import load_dotenv
from utils.config import config

# Load environment variables
load_dotenv()

# Initialize Stripe with the config key
stripe.api_key = config.STRIPE_SECRET_KEY

def check_price_product():
    """Check if all price IDs belong to the correct product."""
    try:
        print("\nChecking Price IDs and their Products...")

        # Get all prices from your config
        price_ids = [
            config.STRIPE_FREE_TIER_ID,  # Free tier
            config.STRIPE_TIER_2_20_ID,  # Tier 2
            config.STRIPE_TIER_6_50_ID,  # Tier 6
            config.STRIPE_TIER_12_100_ID,  # Tier 12
            config.STRIPE_TIER_25_200_ID,  # Tier 25
            config.STRIPE_TIER_50_400_ID,  # Tier 50
            config.STRIPE_TIER_125_800_ID,  # Tier 125
            config.STRIPE_TIER_200_1000_ID  # Tier 200
        ]

        expected_product_id = config.STRIPE_PRODUCT_ID

        print(f"\nEnvironment Mode: {config.ENV_MODE.value}")
        print(f"Expected Product ID: {expected_product_id}")
        print(f"Using Stripe API Key: {stripe.api_key[:8]}...")  # Show first 8 chars for verification

        print("\nChecking each price ID:")
        for price_id in price_ids:
            try:
                price = stripe.Price.retrieve(price_id, expand=['product'])
                product_id = price['product']['id']
                product_name = price['product']['name']

                print(f"\nPrice ID: {price_id}")
                print(f"  → Product ID: {product_id}")
                print(f"  → Product Name: {product_name}")
                print(f"  → Amount: ${price['unit_amount']/100 if price.get('unit_amount') else 0}")
                print(f"  → Currency: {price.get('currency', 'usd')}")
                print(f"  → Active: {price.get('active', True)}")

                if product_id != expected_product_id:
                    print(f"  ❌ WARNING: This price belongs to a different product!")

            except stripe.error.InvalidRequestError:
                print(f"\n❌ Invalid Price ID: {price_id}")
            except Exception as e:
                print(f"\n❌ Error checking price {price_id}: {str(e)}")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    check_price_product()