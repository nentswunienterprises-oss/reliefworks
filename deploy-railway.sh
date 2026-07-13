#!/bin/bash
# Railway Deployment Setup Script for Relief Works

echo "🚀 Relief Works - Railway Deployment Setup"
echo ""

# Set Supabase credentials
export SUPABASE_URL=https://qwtrkqolpsclidiqpoff.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
export DATABASE_URL=postgresql://postgres:your_url_encoded_password@db.qwtrkqolpsclidiqpoff.supabase.co:5432/postgres
export NODE_ENV=production
export PORT=5000

echo "✅ Environment variables set"
echo ""
echo "📝 Add these to your Railway project:"
echo "   SUPABASE_URL=$SUPABASE_URL"
echo "   SUPABASE_SERVICE_ROLE_KEY=****"
echo "   DATABASE_URL=****"
echo "   NODE_ENV=production"
echo "   PORT=5000"
echo ""
echo "🏗️  Build & deployment commands:"
echo "   Build: npm run build"
echo "   Start: node dist/index.cjs"
echo ""
echo "✨ Ready for Railway deployment!"
