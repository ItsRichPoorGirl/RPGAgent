import stripe
import os
from dotenv import load_dotenv
from utils.config import config

# Load environment variables
load_dotenv()

# Initialize Stripe
stripe.api_key = config.STRIPE_SECRET_KEY

def check_stripe_products():
    """Check the relationship between price IDs and their products."""
    try:
        print("\nChecking Stripe Products and Prices...")

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

        print("\nEnvironment Mode:", config.ENV_MODE.value)
        print("Current configuration:")
        print(f"Configured Product ID: {config.STRIPE_PRODUCT_ID}")

        print("\nChecking each price ID:")
        product_ids = set()
        for price_id in price_ids:
            try:
                price = stripe.Price.retrieve(price_id, expand=['product'])
                product_id = price['product']['id']
                product_name = price['product']['name']
                product_ids.add(product_id)

                print(f"\nPrice ID: {price_id}")
                print(f"  → Product ID: {product_id}")
                print(f"  → Product Name: {product_name}")
                print(f"  → Amount: ${price['unit_amount']/100 if price.get('unit_amount') else 0}")
                print(f"  → Currency: {price.get('currency', 'usd')}")
                print(f"  → Active: {price.get('active', True)}")

            except stripe.error.InvalidRequestError:
                print(f"\n❌ Invalid Price ID: {price_id}")
            except Exception as e:
                print(f"\n❌ Error checking price {price_id}: {str(e)}")

        # Check if all prices belong to the same product
        if len(product_ids) > 1:
            print("\n⚠️ WARNING: Prices belong to different products!")
            print("Product IDs found:", product_ids)
        else:
            print("\n✅ All prices belong to the same product")
            if product_ids:
                print(f"Product ID: {list(product_ids)[0]}")
                configured_id = config.STRIPE_PRODUCT_ID
                if configured_id and list(product_ids)[0] != configured_id:
                    print("\n⚠️ WARNING: This product ID doesn't match your configuration!")
                    print(f"Configured: {configured_id}")
                    print(f"Actual: {list(product_ids)[0]}")
                    print("\nYou should update your STRIPE_PRODUCT_ID to match the actual product ID.")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    check_stripe_products()