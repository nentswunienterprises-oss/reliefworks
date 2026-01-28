# ⚡ Quick Migration: Railway → Supabase Edge Functions

**You don't need Railway anymore.** Here's what changed:

---

## What Was Removed

- ❌ `railway.toml` - Not needed
- ❌ `deploy-railway.sh` - Not needed
- ❌ `deploy-railway.ps1` - Not needed
- ❌ `RAILWAY_DEPLOYMENT.md` - Not needed
- ❌ `server/db.ts` with PostgreSQL - Not needed
- ❌ `server/supabase.ts` - Not needed
- ❌ Express server - Not needed

---

## What Was Added

- ✅ `supabase/functions/create-inquiry/index.ts` - Your backend
- ✅ `SUPABASE_EDGE_FUNCTIONS.md` - Deployment guide

---

## What Changed in Code

### Frontend: `client/src/hooks/use-inquiries.ts`

**Before:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const res = await fetch(`${API_URL}${api.inquiries.create.path}`, ...);
```

**After:**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://pzqhneluoquohtskfwkr.supabase.co";
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-inquiry`;
const res = await fetch(EDGE_FUNCTION_URL, ...);
```

### Environment Variables

**Before:**
```
VITE_API_URL=http://localhost:5000
DATABASE_URL=postgresql://...
NODE_ENV=development
PORT=5000
```

**After:**
```
VITE_SUPABASE_URL=https://pzqhneluoquohtskfwkr.supabase.co
```

Much simpler! 🎉

---

## Deployment Steps (15 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Migrate to Supabase Edge Functions"
git push
```

### 2. Create Edge Function in Supabase (5 min)

1. Supabase Dashboard → **Edge Functions** → **Create New**
2. Name: `create-inquiry`
3. Paste code from `supabase/functions/create-inquiry/index.ts`
4. Save

### 3. Create Table in Supabase (2 min)

1. Supabase Dashboard → **SQL Editor** → **New Query**
2. Paste table creation SQL (from `SUPABASE_EDGE_FUNCTIONS.md`)
3. Execute

### 4. Deploy to Vercel (5 min)

1. Vercel Dashboard → Import GitHub repo
2. Set `VITE_SUPABASE_URL=https://pzqhneluoquohtskfwkr.supabase.co`
3. Deploy

### 5. Test (1 min)

1. Visit your Vercel site
2. Fill form → Submit
3. Check Supabase for the record ✓

---

## Architecture Comparison

### Old Way (Railway)
```
Vercel Frontend
    ↓ API
Railway Backend
    ↓ DB
Supabase Database
```
**Cost**: $10-15/month  
**Complexity**: 3 services

### New Way (Edge Functions)
```
Vercel Frontend
    ↓ API Call
Supabase (Edge Function + Database)
```
**Cost**: $0/month (free tier)  
**Complexity**: 2 services

---

## Why This Is Better

| Aspect | Railway | Edge Functions |
|--------|---------|---|
| **Cost** | $10/month | $0/month |
| **Services** | 2 (Railway + DB) | 1 (Supabase) |
| **Deploy** | Manual | Auto |
| **Scaling** | Instant | Instant |
| **Latency** | 50-100ms | 10-50ms |
| **Complexity** | More | Less |

---

## Files You Should Now Follow

1. **SUPABASE_EDGE_FUNCTIONS.md** - Main deployment guide
2. **VERCEL_DEPLOYMENT.md** - Frontend deployment
3. **SUPABASE_SETUP.md** - Database setup

You can ignore:
- RAILWAY_DEPLOYMENT.md
- DEPLOYMENT_GUIDE.md (has Railway architecture)

---

## Questions?

See **SUPABASE_EDGE_FUNCTIONS.md** for:
- Detailed setup steps
- How to test
- Troubleshooting
- Cost breakdown

---

**That's it!** Much simpler now. 🚀
