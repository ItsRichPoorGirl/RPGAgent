#!/bin/bash

echo "🎯 Starting comprehensive Luciq stack monitoring..."
echo "📊 This will open multiple terminal tabs to monitor all services"

# Railway API logs
echo "🚂 Opening Railway API logs..."
osascript -e 'tell app "Terminal" to do script "cd /Users/user/Desktop/Luciq-AI-Agent && railway logs --service=Luciq-AI-Agent --environment=preview --follow"'

sleep 1

# Railway Worker logs  
echo "⚙️ Opening Railway Worker logs..."
osascript -e 'tell app "Terminal" to do script "cd /Users/user/Desktop/Luciq-AI-Agent && railway logs --service=luciq-worker --environment=preview --follow"'

sleep 1

# Vercel Frontend logs
echo "▲ Opening Vercel Frontend logs..."
osascript -e 'tell app "Terminal" to do script "cd /Users/user/Desktop/Luciq-AI-Agent && vercel logs --follow"'

sleep 1

# Supabase monitoring
echo "🗄️ Opening Supabase monitoring..."
osascript -e 'tell app "Terminal" to do script "cd /Users/user/Desktop/Luciq-AI-Agent && echo \"📊 Supabase Monitoring Setup\" && echo \"🌐 Opening Supabase Dashboard...\" && open \"https://supabase.com/dashboard/project/$(grep SUPABASE_PROJECT_ID .env | cut -d\"=\" -f2)/logs\" && echo \"📋 Manual checks to run:\" && echo \"  • supabase functions list\" && echo \"  • supabase db inspect\" && echo \"  • Check for connection errors in API logs\" && echo \"\" && echo \"⚠️  Database issues to watch for:\" && echo \"  • Connection timeouts\" && echo \"  • Query performance issues\" && echo \"  • Failed transactions\" && echo \"  • Rate limiting\""'

echo ""
echo "✅ All monitoring tabs opened!"
echo "📋 Now monitoring:"
echo "   • Railway API (Luciq-AI-Agent service)"
echo "   • Railway Worker (luciq-worker service)"  
echo "   • Vercel Frontend"
echo "   • Supabase Database & Functions"
echo ""
echo "🚨 WATCH FOR:"
echo "   • MCP import errors"
echo "   • Dramatiq worker failures"
echo "   • API timeout errors"
echo "   • Redis connection issues"
echo "   • Database connection failures"
echo "   • Supabase query timeouts"
echo "   • Frontend build/deployment issues"
echo ""
echo "💡 Keep this window open to restart monitoring if needed"
echo "🌐 Supabase Dashboard: https://supabase.com/dashboard/projects" 