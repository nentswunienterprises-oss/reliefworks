#!/bin/bash
# Railway Deployment Setup Script for Relief Works

echo "🚀 Relief Works - Railway Deployment Setup"
echo ""

# Set Supabase credentials
export SUPABASE_URL=https://pzqhneluoquohtskfwkr.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cWhuZWx1b3F1b2h0c2tmd2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYwOTUzOCwiZXhwIjoyMDg1MTg1NTM4fQ.0O70N8dP08Vxlf7YUqkEWQ5BYMJQJd230Thl_5B2y5Q
export DATABASE_URL=postgresql://postgres:Rapismylife20@db.pzqhneluoquohtskfwkr.supabase.co:5432/postgres
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
