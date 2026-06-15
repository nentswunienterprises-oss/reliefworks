$ErrorActionPreference = "Stop"
$envMap = @{
  "SUPABASE_URL" = "https://pzqhneluoquohtskfwkr.supabase.co"
  "SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cWhuZWx1b3F1b2h0c2tmd2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDk1MzgsImV4cCI6MjA4NTE4NTUzOH0.1OLP9llu3dZyZxjLlIEpkwRzMK4ryp-2YmBrQDVuD00"
  "SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cWhuZWx1b3F1b2h0c2tmd2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYwOTUzOCwiZXhwIjoyMDg1MTg1NTM4fQ.0O70N8dP08Vxlf7YUqkEWQ5BYMJQJd230Thl_5B2y5Q"
  "VITE_SUPABASE_URL" = "https://pzqhneluoquohtskfwkr.supabase.co"
  "PAYFAST_MERCHANT_ID" = "35726149"
  "PAYFAST_MERCHANT_KEY" = "wtbkrow2clp2b"
  "PAYFAST_SANDBOX" = "true"
  "PAYFAST_RETURN_URL" = "https://relief-works-website.vercel.app/payments/success"
  "PAYFAST_CANCEL_URL" = "https://relief-works-website.vercel.app/payments/cancelled"
  "PAYFAST_NOTIFY_URL" = "https://relief-works-website.vercel.app/api/payfast/itn"
  "PAYFAST_SANDBOX_MERCHANT_ID" = "35726149"
  "PAYFAST_SANDBOX_MERCHANT_KEY" = "wtbkrow2clp2b"
  "PAYFAST_SANDBOX_RETURN_URL" = "https://relief-works-website.vercel.app/payments/success"
  "PAYFAST_SANDBOX_CANCEL_URL" = "https://relief-works-website.vercel.app/payments/cancelled"
  "PAYFAST_SANDBOX_NOTIFY_URL" = "https://relief-works-website.vercel.app/api/payfast/itn"
}

foreach ($name in $envMap.Keys) {
  foreach ($target in @("production", "preview")) {
    try { vercel env rm $name $target --yes | Out-Null } catch {}
    $tmp = New-TemporaryFile
    Set-Content -Path $tmp -Value $envMap[$name] -NoNewline
    Get-Content $tmp | vercel env add $name $target | Out-Null
    Remove-Item $tmp -Force
    Write-Output "SET $name ($target)"
  }
}

vercel env pull .env.vercel.production --environment=production --yes | Out-Null
vercel env pull .env.vercel.preview --environment=preview --yes | Out-Null
Write-Output "DONE"