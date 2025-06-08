#!/bin/bash

# Master Luciq Customization Restoration Script
# Applies all Luciq customizations to fresh upstream code in correct order

set -e  # Exit on any error

echo "🚀 Starting Luciq Customization Restoration..."
echo "=================================================="

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to check if we're in the correct directory
check_directory() {
    if [ ! -f "backend/utils/config.py" ] || [ ! -f "frontend/src/app/layout.tsx" ]; then
        echo "❌ Error: Please run this script from the root of the Luciq-AI-Agent repository"
        exit 1
    fi
}

# Function to backup original files
backup_files() {
    echo "📁 Creating backup of original files..."
    mkdir -p backups/upstream_original
    
    # Backup key files that will be modified
    cp backend/utils/config.py backups/upstream_original/config.py.backup 2>/dev/null || true
    cp backend/services/billing.py backups/upstream_original/billing.py.backup 2>/dev/null || true
    cp frontend/src/lib/config.ts backups/upstream_original/config.ts.backup 2>/dev/null || true
    cp frontend/src/app/layout.tsx backups/upstream_original/layout.tsx.backup 2>/dev/null || true
    
    echo "✅ Backup created in backups/upstream_original/"
}

# Function to apply customizations in order
apply_customizations() {
    echo ""
    echo "🔧 Applying customizations in priority order..."
    echo "=============================================="
    
    # 1. Admin Bypass (CRITICAL - must be first)
    echo ""
    echo "1️⃣ Applying Admin Bypass (CRITICAL)..."
    if [ -f "$SCRIPT_DIR/admin_bypass/apply_admin_bypass.sh" ]; then
        cd "$SCRIPT_DIR/admin_bypass" && ./apply_admin_bypass.sh
        cd - > /dev/null
    else
        echo "⚠️  Admin bypass script not found, skipping..."
    fi
    
    # 2. Stripe Configuration (HIGH - essential for billing)  
    echo ""
    echo "2️⃣ Applying Stripe Configuration (HIGH)..."
    if [ -f "$SCRIPT_DIR/stripe_config/apply_stripe.sh" ]; then
        cd "$SCRIPT_DIR/stripe_config" && ./apply_stripe.sh  
        cd - > /dev/null
    else
        echo "⚠️  Stripe config script not found, skipping..."
    fi
    
    # 3. Branding (MEDIUM - can be applied last)
    echo ""
    echo "3️⃣ Applying Luciq Branding (MEDIUM)..."
    if [ -f "$SCRIPT_DIR/branding/apply_branding.sh" ]; then
        cd "$SCRIPT_DIR/branding" && ./apply_branding.sh
        cd - > /dev/null  
    else
        echo "⚠️  Branding script not found, creating manual instructions..."
        echo "📝 Manual branding steps required - see customizations/branding/branding_locations.md"
    fi
}

# Function to verify installation
verify_installation() {
    echo ""
    echo "🔍 Verifying installation..."
    echo "============================="
    
    # Check if admin bypass was applied
    if grep -q "get_admin_user_ids" backend/utils/config.py; then
        echo "✅ Admin bypass configuration found"
    else
        echo "❌ Admin bypass configuration missing"
    fi
    
    # Check if Stripe config was applied  
    if grep -q "price_1RMZYBCQSpuIbcUBKkOp4qfZ" backend/utils/config.py; then
        echo "✅ Luciq Stripe configuration found"
    else
        echo "❌ Luciq Stripe configuration missing"
    fi
    
    # Check if key files exist
    if [ -f "frontend/public/luciq-logo.png" ]; then
        echo "✅ Luciq logo assets found"
    else
        echo "⚠️  Luciq logo assets need to be copied manually"
    fi
}

# Function to display next steps
show_next_steps() {
    echo ""
    echo "🎯 Next Steps"
    echo "============="
    echo "1. Set environment variables:"
    echo "   - ADMIN_USER_IDS=user-id-1,user-id-2"
    echo "   - STRIPE_SECRET_KEY=sk_live_..."
    echo "   - STRIPE_WEBHOOK_SECRET=whsec_..."
    echo ""
    echo "2. Copy Luciq brand assets to frontend/public/:"
    echo "   - luciq-logo.png"
    echo "   - favicon.png" 
    echo "   - banner.png"
    echo "   - og-image.png"
    echo ""
    echo "3. Test the application:"
    echo "   - Admin functionality (billing bypass)"
    echo "   - Stripe payment flows"
    echo "   - Branding consistency"
    echo ""
    echo "4. Deploy to staging for testing"
    echo ""
    echo "✨ Luciq customization restoration complete!"
}

# Main execution
main() {
    echo "🔍 Checking directory structure..."
    check_directory
    
    echo "📋 Creating file backups..."
    backup_files
    
    apply_customizations
    
    verify_installation
    
    show_next_steps
}

# Run the main function
main "$@" 