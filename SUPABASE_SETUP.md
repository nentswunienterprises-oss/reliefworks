# SUPABASE_SETUP.md

## Setting Up Supabase for Relief Works

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project
4. Save your credentials:
   - **Project URL**: `SUPABASE_URL`
   - **Anon Key**: `SUPABASE_ANON_KEY`
   - **Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Get Database Connection String

1. Go to Project Settings → Database
2. Copy the "Connection string" (PostgreSQL)
3. This is your `DATABASE_URL` for the backend

### Step 3: Set Environment Variables

**For Local Development:**

Create `.env` file in project root:
```bash
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=development
PORT=5000
VITE_API_URL=http://localhost:5000
```

**For Railway Production:**

Set these in Railway project:
```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=production
PORT=5000
```

**For Vercel Frontend:**

Set in Vercel project settings:
```
VITE_API_URL=https://your-railway-url.up.railway.app
```

### Step 4: Create Database Tables

The project uses Drizzle ORM with this schema (from `shared/schema.ts`):

```typescript
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  role: text("role"),
  pressureType: varchar("pressure_type", { length: 50 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

Run migrations:
```bash
npm run db:push
```

This will create the `inquiries` table in Supabase.

### Step 5: Enable Realtime (Optional)

In Supabase Dashboard:
1. Go to Realtime → Tables
2. Enable it for the `inquiries` table if you want real-time updates

### Step 6: Set Up RLS Policies (Optional)

For security, consider adding Row Level Security (RLS) policies:

1. Go to Authentication → Policies
2. Create policies to restrict who can insert/read inquiries
3. For now, you can leave it open for form submissions

### Troubleshooting

- **Connection refused**: Check DATABASE_URL format and ensure Supabase project is active
- **Schema mismatch**: Run `npm run db:push` again
- **Auth errors**: Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

### Backup Strategy

Supabase automatically backs up daily. Enable additional backups in:
Project Settings → Backups
