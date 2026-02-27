# Database Setup for Mission Control

This application uses **Neon Postgres** (the successor to Vercel Postgres) for data persistence.

## Vercel Setup Steps

### 1. Add Database to Vercel Project

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `mission-control` project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Neon** (Postgres)
6. Choose a name (e.g., `mission-control-db`)
7. Select region closest to your users
8. Click **Create**

### 2. Environment Variables

Vercel will automatically add these environment variables to your project:
- `DATABASE_URL` - Connection string for your database

The app will use this automatically once deployed.

### 3. Initial Data Migration

After the first deployment completes:

1. Visit your deployed app (e.g., `https://mission-control-lake-psi.vercel.app`)
2. Navigate to: `/api/seed` (POST request to seed the database)
3. Or use curl:
   ```bash
   curl -X POST https://mission-control-lake-psi.vercel.app/api/seed
   ```

This will:
- Create the database tables (assets, banks, transactions)
- Migrate existing data from `data/assets.json`, `data/banks.json`, `data/transactions.json`
- Return confirmation with counts of migrated records

### 4. Verify Setup

Visit your app and:
- ✅ Check that existing Bitcoin (24 BTC) and other assets appear
- ✅ Test adding a new transaction 
- ✅ Verify data persists after page refresh
- ✅ Test bank management and transfers

## Database Schema

The app creates these tables automatically:

### Assets Table
```sql
CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT,
  value DECIMAL(20,2) NOT NULL,
  price DECIMAL(20,8),
  qty DECIMAL(20,8),
  change_24h DECIMAL(20,2) DEFAULT 0,
  change_percent DECIMAL(10,4) DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Category-specific fields
  bank_name TEXT,
  account_type TEXT,
  property_type TEXT,
  notes TEXT,
  -- JSON fields for complex data  
  history JSONB DEFAULT '[]',
  payments JSONB DEFAULT '[]'
);
```

### Banks Table
```sql
CREATE TABLE banks (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  source_bank TEXT,
  recipient_bank TEXT,
  value DECIMAL(20,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

- `GET /api/assets` - Fetch all assets
- `POST /api/assets` - Bulk save assets array
- `GET /api/banks` - Fetch bank names  
- `POST /api/banks` - Add bank or save banks array
- `GET /api/transactions` - Fetch transaction history
- `POST /api/transactions` - Add transaction
- `POST /api/seed` - Initialize database and migrate data
- `DELETE /api/seed` - Clear all data (dev only)

## Benefits vs localStorage

✅ **Real persistence** - Data survives deployments and browser clearing  
✅ **Multi-device sync** - Access your data from anywhere  
✅ **Performance** - Database queries vs client-side JSON parsing  
✅ **Reliability** - ACID transactions and data integrity  
✅ **Scalability** - Handles large datasets efficiently  

## Troubleshooting

**"DATABASE_URL is not set" error:**
- Ensure Neon database is connected in Vercel Storage tab
- Redeploy the project to pull in environment variables

**Database initialization fails:**
- Check Vercel function logs in dashboard
- Ensure DATABASE_URL is accessible from serverless functions

**No data after seeding:**
- Verify `/api/seed` returns success response
- Check that `data/*.json` files exist with valid JSON

**CoinGecko API still works:**
- Price fetching happens client-side (no changes needed)
- Database stores the cached prices and transaction history