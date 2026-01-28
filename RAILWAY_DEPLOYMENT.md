# Railway Deployment Configuration for Relief Works API Server

This configuration deploys the Express.js API server to Railway.

## Environment Variables

Add these to your Railway project:

```
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NODE_ENV=production
PORT=5000
```

## Build & Start Commands

- **Build Command**: `npm run build`
- **Start Command**: `node dist/index.cjs`

## Steps to Deploy

1. Connect your GitHub repository to Railway
2. Create a new Railway project
3. Add PostgreSQL plugin (or use Supabase connection string)
4. Set the environment variables above
5. Configure:
   - Build Command: `npm run build`
   - Start Command: `node dist/index.cjs`
   - Port: `5000`
6. Deploy

## Database Migration

Run migrations after deployment:
```bash
npm run db:push
```

This will sync your Drizzle ORM schema with Supabase PostgreSQL.
