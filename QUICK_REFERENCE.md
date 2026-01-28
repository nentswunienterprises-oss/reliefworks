# ⚡ Quick Deployment Reference

## Your Supabase Project
```
URL:     https://pzqhneluoquohtskfwkr.supabase.co
DB:      postgresql://postgres:Rapismylife20@db.pzqhneluoquohtskfwkr.supabase.co:5432/postgres
Service: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cWhuZWx1b3F1b2h0c2tmd2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYwOTUzOCwiZXhwIjoyMDg1MTg1NTM4fQ.0O70N8dP08Vxlf7YUqkEWQ5BYMJQJd230Thl_5B2y5Q
```

## Build Status ✅
- TypeScript: **PASS**
- Frontend: **546KB** ✓
- Backend: **956KB** ✓
- Ready: **NOW**

## Railway Deployment (Backend)

**Environment Variables to Add:**
```
DATABASE_URL=postgresql://postgres:Rapismylife20@db.pzqhneluoquohtskfwkr.supabase.co:5432/postgres
SUPABASE_URL=https://pzqhneluoquohtskfwkr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cWhuZWx1b3F1b2h0c2tmd2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYwOTUzOCwiZXhwIjoyMDg1MTg1NTM4fQ.0O70N8dP08Vxlf7YUqkEWQ5BYMJQJd230Thl_5B2y5Q
NODE_ENV=production
PORT=5000
```

**Build Config:**
- Build: `npm run build`
- Start: `node dist/index.cjs`
- Port: `5000`

**After deploy, note your URL:** `https://your-app.up.railway.app`

---

## Vercel Deployment (Frontend)

**Environment Variable:**
```
VITE_API_URL=https://your-railway-url.up.railway.app
```
(Use the URL you got from Railway)

**Build Config:**
- Build: `npm run build`
- Output: `dist/public`
- Framework: Vite

---

## Testing After Deploy

1. Visit your Vercel frontend
2. Fill diagnosis form → Submit
3. Check Supabase for new record in `inquiries` table

**API Test:**
```bash
curl https://your-railway-url.up.railway.app
# Should return 200
```

---

## Files Created for You

- `railway.toml` - Railway config (all creds filled)
- `vercel.json` - Vercel config
- `deploy-railway.sh` - Deployment script (bash)
- `deploy-railway.ps1` - Deployment script (PowerShell)
- `.env` - Local dev config (already set)
- `/dist` - Built files ready to deploy

---

## That's it! 🎉

Your code is production-ready. Just:
1. Push to GitHub
2. Connect Railway → Deploy
3. Connect Vercel → Deploy
4. Test the form

Done!
