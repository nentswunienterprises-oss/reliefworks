# Railway Deployment Setup Script for Relief Works (Windows PowerShell)

Write-Host "🚀 Relief Works - Railway Deployment Setup" -ForegroundColor Green
Write-Host ""

# Set Supabase credentials
$env:SUPABASE_URL = "https://pzqhneluoquohtskfwkr.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cWhuZWx1b3F1b2h0c2tmd2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYwOTUzOCwiZXhwIjoyMDg1MTg1NTM4fQ.0O70N8dP08Vxlf7YUqkEWQ5BYMJQJd230Thl_5B2y5Q"
$env:DATABASE_URL = "postgresql://postgres:Rapismylife20@db.pzqhneluoquohtskfwkr.supabase.co:5432/postgres"
$env:NODE_ENV = "production"
$env:PORT = "5000"

Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Add these to your Railway project settings:" -ForegroundColor Cyan
Write-Host "   SUPABASE_URL=https://pzqhneluoquohtskfwkr.supabase.co"
Write-Host "   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M..."
Write-Host "   DATABASE_URL=postgresql://postgres:Rapismylife20@db.pzqhneluoquohtskfwkr.supabase.co:5432/postgres"
Write-Host "   NODE_ENV=production"
Write-Host "   PORT=5000"
Write-Host ""
Write-Host "🏗️  Configure build & deployment:" -ForegroundColor Cyan
Write-Host "   Root Directory: /"
Write-Host "   Build Command: npm run build"
Write-Host "   Start Command: node dist/index.cjs"
Write-Host "   Port: 5000"
Write-Host ""
Write-Host "✨ Ready for Railway deployment!" -ForegroundColor Green
