# Railway Deployment Setup Script for Relief Works (Windows PowerShell)

Write-Host "🚀 Relief Works - Railway Deployment Setup" -ForegroundColor Green
Write-Host ""

# Set Supabase credentials
$env:SUPABASE_URL = "https://qwtrkqolpsclidiqpoff.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "your_supabase_service_role_key"
$env:DATABASE_URL = "postgresql://postgres:your_url_encoded_password@db.qwtrkqolpsclidiqpoff.supabase.co:5432/postgres"
$env:NODE_ENV = "production"
$env:PORT = "5000"

Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Add these to your Railway project settings:" -ForegroundColor Cyan
Write-Host "   SUPABASE_URL=https://qwtrkqolpsclidiqpoff.supabase.co"
Write-Host "   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
Write-Host "   DATABASE_URL=postgresql://postgres:your_url_encoded_password@db.qwtrkqolpsclidiqpoff.supabase.co:5432/postgres"
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
