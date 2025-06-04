# Railway Service Management Functions
# Source this file: source railway-functions.sh

# Quick Railway service commands
rw-main() {
    echo "🚀 Executing on Luciq-AI-Agent..."
    (cd railway-contexts/luciq-ai-agent && railway "$@")
}

rw-worker() {
    echo "⚙️  Executing on luciq-worker..."
    (cd railway-contexts/luciq-worker && railway "$@")
}

rw-status() {
    echo "📊 Railway Services Status:"
    echo ""
    echo "🚀 Luciq-AI-Agent:"
    (cd railway-contexts/luciq-ai-agent && railway status)
    echo ""
    echo "⚙️  luciq-worker:"
    (cd railway-contexts/luciq-worker && railway status)
}

rw-logs-main() {
    echo "📋 Logs for Luciq-AI-Agent:"
    (cd railway-contexts/luciq-ai-agent && railway logs "$@")
}

rw-logs-worker() {
    echo "📋 Logs for luciq-worker:"
    (cd railway-contexts/luciq-worker && railway logs "$@")
}

rw-deploy-main() {
    echo "🚀 Deploying Luciq-AI-Agent..."
    (cd railway-contexts/luciq-ai-agent && railway deploy)
}

rw-deploy-worker() {
    echo "⚙️  Deploying luciq-worker..."
    (cd railway-contexts/luciq-worker && railway deploy)
}

rw-vars-main() {
    echo "🔧 Environment variables for Luciq-AI-Agent:"
    (cd railway-contexts/luciq-ai-agent && railway variables "$@")
}

rw-vars-worker() {
    echo "🔧 Environment variables for luciq-worker:"
    (cd railway-contexts/luciq-worker && railway variables "$@")
}

echo "Railway functions loaded! 🎉"
echo ""
echo "Available commands:"
echo "  rw-status          - Show status of both services"
echo "  rw-main [cmd]      - Run railway command on main app"
echo "  rw-worker [cmd]    - Run railway command on worker"
echo "  rw-logs-main       - Show main app logs"
echo "  rw-logs-worker     - Show worker logs"
echo "  rw-deploy-main     - Deploy main app"
echo "  rw-deploy-worker   - Deploy worker"
echo "  rw-vars-main       - Manage main app variables"
echo "  rw-vars-worker     - Manage worker variables" 