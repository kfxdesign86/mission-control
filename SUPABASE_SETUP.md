# Supabase Migration Setup Guide

This guide will help you migrate from filesystem storage to Supabase database.

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in/up
2. Click "New project"
3. Choose organization and give your project a name (e.g., "mission-control")
4. Set a strong database password
5. Choose the region closest to your users (probably US East for Vercel)
6. Click "Create new project"
7. Wait for the project to initialize (~2 minutes)

## 2. Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy your **Project URL** (starts with `https://`)
3. Copy your **service_role** key (NOT the anon key - we need full access)

## 3. Set Environment Variables Locally

Create/update `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Create Database Tables

Go to your Supabase project dashboard:

1. Navigate to **SQL Editor** in the sidebar
2. Create a new query
3. Copy and paste this SQL to create the tables:

```sql
-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC,
  qty NUMERIC,
  change24h NUMERIC NOT NULL DEFAULT 0,
  changePercent NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  history JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ NOT NULL,
  -- Cash fields
  "bankName" TEXT,
  "accountType" TEXT,
  notes TEXT,
  -- Real Estate fields
  "propertyType" TEXT,
  "purchasePrice" NUMERIC,
  "admTaxFee" NUMERIC,
  payments JSONB
);

-- Banks table
CREATE TABLE IF NOT EXISTS banks (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  "sourceBank" TEXT,
  "recipientBank" TEXT,
  value NUMERIC NOT NULL,
  notes TEXT DEFAULT '',
  "createdAt" TIMESTAMPTZ NOT NULL
);
```

4. Click **Run** to execute the SQL

## 5. Seed Your Database

After creating the tables, run the seeding script:

```bash
npm run db:seed
```

This will populate your Supabase database with the existing data from your JSON files.

## 6. Test the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and verify:
- Assets are loading correctly
- You can add/edit assets
- Banks are working
- Transactions are working

## 7. Test the Build

```bash
npm run build
```

Make sure the build passes without errors.

## 8. Set Vercel Environment Variables

Install Vercel CLI if you haven't:

```bash
npm i -g vercel
```

Set the environment variables on Vercel:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

When prompted:
- Choose **Production**, **Preview**, and **Development**
- Paste the respective values

## 9. Deploy to Vercel

Push your changes to GitHub:

```bash
git add .
git commit -m "Migrate to Supabase database"
git push origin main
```

This will trigger a Vercel deployment with the new database integration.

## 10. Verify Production

1. Check your Vercel deployment logs for any errors
2. Visit your production URL: https://mission-control-lake-psi.vercel.app
3. Verify all functionality works in production

## Troubleshooting

### Build Errors
- Make sure all environment variables are set correctly
- Check that the Supabase service role key has the right permissions

### Database Connection Issues
- Verify your Supabase URL and service role key are correct
- Make sure your Supabase project is active and not paused

### Data Not Loading
- Check the Supabase dashboard **Table Editor** to verify data was seeded
- Look at the browser network tab for API errors
- Check Vercel function logs for errors

## Rollback Plan

If something goes wrong, you can quickly rollback:

1. Restore the original API routes from git history
2. The backup data files are in `data/backups/`
3. Redeploy the previous version

Your data is safe - the original JSON files are backed up and the Supabase data is persistent.