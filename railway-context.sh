#!/bin/bash

# Railway Context Manager for Luciq AI Services
# Usage: ./railway-context.sh [main|worker|status]

MAIN_CONTEXT="railway-contexts/luciq-ai-agent"
WORKER_CONTEXT="railway-contexts/luciq-worker"

case "$1" in
    "main")
        echo "🚀 Switching to Luciq-AI-Agent context..."
        cd "$MAIN_CONTEXT"
        railway status
        echo "📁 Current directory: $(pwd)"
        exec zsh
        ;;
    "worker")
        echo "⚙️  Switching to luciq-worker context..."
        cd "$WORKER_CONTEXT"
        railway status
        echo "📁 Current directory: $(pwd)"
        exec zsh
        ;;
    "status")
        echo "📊 Railway Context Status:"
        echo ""
        echo "🚀 Main App Context:"
        cd "$MAIN_CONTEXT" && railway status
        echo ""
        echo "⚙️  Worker Context:"
        cd "$WORKER_CONTEXT" && railway status
        ;;
    *)
        echo "Railway Context Manager"
        echo "Usage: $0 [main|worker|status]"
        echo ""
        echo "Commands:"
        echo "  main   - Switch to Luciq-AI-Agent context"
        echo "  worker - Switch to luciq-worker context"
        echo "  status - Show status of both contexts"
        echo ""
        echo "Quick aliases you can add to your .zshrc:"
        echo "  alias rw-main='./railway-context.sh main'"
        echo "  alias rw-worker='./railway-context.sh worker'"
        echo "  alias rw-status='./railway-context.sh status'"
        ;;
esac 