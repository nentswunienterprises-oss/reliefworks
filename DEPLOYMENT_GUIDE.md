# Relief Works - Full Stack Deployment Guide

## Architecture Overview

```
┌──────────────────┐
│    Vercel        │
│    (Frontend)    │
│  Static Vite     │
└────────┬─────────┘
         │ HTTPS Calls
         ↓
┌──────────────────────────┐
│      Railway             │
│   Express.js Server      │
│  (server/index.ts)       │
└────────┬─────────────────┘
         │ Queries
         ↓
┌──────────────────┐
│    Supabase      │
│  Auth + Database │
│  (PostgreSQL)    │
└──────────────────┘
```

## Prerequisites

- GitHub repository
- Supabase account
- Railway account
- Vercel account

---

## Step 1: Set Up Supabase

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

**Quick checklist:**
- [ ] Create Supabase project
- [ ] Copy `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`
- [ ] Run `npm run db:push` to create tables

---

## Step 2: Deploy Backend to Railway

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed instructions.

**Quick steps:**

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Configure environment:
   ```
   DATABASE_URL=<your_supabase_connection_string>
   SUPABASE_URL=<your_supabase_url>
   SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
   NODE_ENV=production
   PORT=5000
   ```
5. Set build command: `npm run build`
6. Set start command: `node dist/index.cjs`
7. Deploy and note your Railway URL (e.g., `https://your-app.up.railway.app`)

---

## Step 3: Deploy Frontend to Vercel

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

**Quick steps:**

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `.` (use project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
5. Deploy

---

## Step 4: Update DNS (Optional)

If using custom domains:

### For Frontend (Vercel)
1. In Vercel project settings, add custom domain
2. Update DNS records with values provided by Vercel

### For Backend (Railway)
1. In Railway project settings, configure custom domain
2. Update DNS records with values provided by Railway

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
```bash
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=development
PORT=5000
VITE_API_URL=http://localhost:5000
```

### 3. Run database migrations
```bash
npm run db:push
```

### 4. Start development server
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

---

## Monitoring & Debugging

### Railway
- View logs in Railway dashboard
- Check application status in Deployments tab
- Monitor database connections

### Vercel
- View build logs in Deployments
- Check Function logs in Analytics
- Monitor Core Web Vitals

### Supabase
- Monitor database in Studio
- Check connection pool status
- View backup history

---

## Troubleshooting

### Frontend not connecting to backend
- Check `VITE_API_URL` environment variable in Vercel
- Verify Railway backend is running
- Check CORS settings in Express (should be allowing all origins in development)

### Database connection errors
- Verify `DATABASE_URL` format on Railway
- Check Supabase project is active
- Confirm connection pool limits not exceeded

### Build failures
- Check build logs in Vercel/Railway
- Ensure all dependencies installed: `npm install`
- Verify TypeScript compilation: `npm run check`

---

## Environment Variables Summary

| Variable | Service | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | Railway | PostgreSQL connection to Supabase |
| `SUPABASE_URL` | Railway | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Railway | Supabase authentication key |
| `VITE_API_URL` | Vercel | Backend API endpoint |
| `NODE_ENV` | Railway | Set to `production` |
| `PORT` | Railway | Server port (should be `5000`) |

---

## Next Steps

- [ ] Set up monitoring/alerting
- [ ] Configure backups for Supabase
- [ ] Set up custom email domain for inquiries
- [ ] Add analytics/tracking
- [ ] Configure SSL certificates (automatic on Vercel/Railway)
