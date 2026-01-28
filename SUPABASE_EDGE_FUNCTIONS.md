# 🎯 Relief Works - Supabase Edge Functions + Vercel Deployment

**Updated**: January 28, 2026  
**Status**: ✅ **Simplified to Supabase + Vercel only (no Railway needed)**

---

## Architecture

```
┌──────────────────────────┐
│   Vercel (Frontend)      │
│   Static Vite Build      │
└────────┬─────────────────┘
         │ HTTPS Calls
         ↓
┌──────────────────────────────────────┐
│        Supabase (Everything)         │
│  ├─ Edge Functions (Backend API)     │
│  ├─ PostgreSQL Database              │
│  └─ Authentication (optional)        │
└──────────────────────────────────────┘
```

**No separate server needed.** Everything runs in Supabase.

---

## Why This Architecture?

| Aspect | Benefit |
|--------|---------|
| **Simpler** | One vendor, no server to manage |
| **Cheaper** | Edge functions cost ~$0 for your traffic |
| **Faster** | No cold starts like traditional serverless |
| **Secure** | Server-side validation in Edge Functions |
| **Scalable** | Handles 1 request/month or 1M requests/month |

---

## 📋 Deployment Checklist

### Phase 1: Set Up Supabase Edge Functions

#### 1.1 Create Edge Function in Supabase Dashboard

1. Go to [supabase.com](https://supabase.com) → Your Project
2. Navigate to **Edge Functions** (left sidebar)
3. Click **Create New Function**
4. Name: `create-inquiry`
5. Copy this code:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://esm.sh/zod@3.24.2";

const insertInquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  company: z.string().optional(),
  role: z.string().optional(),
  pressureType: z.enum(["Friction", "Limitation", "Incoherence", "Other"]),
  message: z.string().min(1, "Message is required"),
});

export async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const body = await req.json();
    const data = insertInquirySchema.parse(body);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: inquiry, error } = await supabase
      .from("inquiries")
      .insert([
        {
          name: data.name,
          email: data.email,
          company: data.company || null,
          role: data.role || null,
          pressure_type: data.pressureType,
          message: data.message,
        },
      ])
      .select();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({
          message: "Failed to save inquiry",
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response(JSON.stringify(inquiry[0]), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          message: error.errors[0].message,
          field: error.errors[0].path.join("."),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.error("Error:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
```

6. **Save** and wait for deployment (~30 seconds)
7. You'll see: `https://your-project-id.supabase.co/functions/v1/create-inquiry`

#### 1.2 Create inquiries Table

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Paste:

```sql
CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  pressure_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Enable RLS for security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Allow reading own submissions (optional)
CREATE POLICY "Allow viewing all" ON inquiries
  FOR SELECT USING (true);
```

4. Click **Execute**

✅ **Track**: Table created and Edge Function deployed

---

### Phase 2: Deploy Frontend to Vercel

#### 2.1 Prerequisites
- [ ] GitHub repository pushed with updated code
- [ ] Vercel account created

#### 2.2 Vercel Deployment Steps

1. Go to [vercel.com](https://vercel.com) → "Add New" → "Project"
2. **Import your GitHub repository**
3. **Configure:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Root Directory: `.`

4. **Environment Variables:**
   ```
   VITE_SUPABASE_URL=https://pzqhneluoquohtskfwkr.supabase.co
   ```

5. Click **Deploy**
6. Wait for build (2-3 minutes)
7. Note your Vercel URL (e.g., `https://relief-works.vercel.app`)

✅ **Track**: Frontend deployed and linked to Supabase

---

## ✅ Testing

### 1. Test Edge Function Directly

```bash
curl -X POST https://pzqhneluoquohtskfwkr.supabase.co/functions/v1/create-inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "pressureType": "Friction",
    "message": "Test message"
  }'
```

Should return `201` with inquiry data.

### 2. Test Frontend

1. Visit your Vercel URL
2. Fill out the diagnosis form
3. Click Submit
4. Should see success message
5. Check Supabase **Tables** → **inquiries** → See your submission ✓

### 3. Verify in Supabase

1. Supabase Dashboard → **Tables** → **inquiries**
2. View all submissions
3. See timestamps, emails, pressure types

---

## 🔧 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup

Your `.env` is already configured:
```
SUPABASE_URL=https://pzqhneluoquohtskfwkr.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=https://pzqhneluoquohtskfwkr.supabase.co
```

### 3. Run Locally
```bash
npm run dev
```

Visit `http://localhost:5173` (Vite default)

### 4. Test Form

Fill the form → Submit → Check Supabase directly

---

## 📊 Costs

| Service | Cost |
|---------|------|
| Supabase (Edge Functions + Database) | Free tier: $0<br>Paid: $25/month includes 2M req |
| Vercel (Frontend) | Free tier: $0<br>Paid: $20/month |
| **Total** | **$0/month** (free tier) |

For Relief Works' traffic, **you'll never exceed free tier limits**.

---

## 🛠️ File Structure

```
Relief-Works-Website/
├── supabase/
│   └── functions/
│       └── create-inquiry/
│           └── index.ts          ← Edge Function
├── client/
│   └── src/
│       └── hooks/
│           └── use-inquiries.ts  ← Updated to call Edge Function
├── .env                          ← Configured
├── vercel.json                   ← Configured
└── SUPABASE_EDGE_FUNCTIONS.md    ← This file
```

---

## 🚀 Next Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Switch from Railway to Supabase Edge Functions"
   git push
   ```

2. **Create Supabase Edge Function** (5 min)
   - Copy function code above
   - Create table
   - Test with curl

3. **Deploy to Vercel** (5 min)
   - Import repo
   - Set env variable
   - Deploy

4. **Test** (2 min)
   - Fill form on your Vercel site
   - Check Supabase for submission

**Total time to production: ~15 minutes**

---

## 📞 Troubleshooting

### Form submissions not saving
- Check Edge Function status in Supabase dashboard
- Verify table exists: **Tables** → **inquiries**
- Check function logs: **Edge Functions** → **create-inquiry** → **Logs**

### CORS errors
- Edge Function already handles CORS (allows `*`)
- Check browser console for actual error

### Edge Function timeout
- Default timeout: 60 seconds
- For simple forms, should be <100ms
- Check Supabase logs for errors

### Table doesn't exist
- Run the SQL in **SQL Editor**
- Refresh page
- Try submission again

---

## 🎯 Benefits of This Setup

✅ **One vendor** - Supabase handles everything  
✅ **No server ops** - No Railway, no managing uptime  
✅ **Automatic scaling** - Handles traffic spikes  
✅ **Near-instant deployments** - Push to GitHub → Auto deploy  
✅ **Built-in database** - Everything in Supabase  
✅ **Edge Functions run globally** - Lower latency  
✅ **Cost efficient** - Free tier for your traffic  

---

**You're ready to deploy!** 🚀
