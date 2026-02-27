const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupDatabase() {
  console.log('Setting up Supabase database...');

  try {
    console.log('\n⚠️  MANUAL STEP REQUIRED:');
    console.log('Please run the following SQL in your Supabase SQL Editor:\n');
    
    console.log('-- Assets table');
    console.log(`CREATE TABLE IF NOT EXISTS assets (
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
);\n`);

    console.log('-- Banks table');
    console.log(`CREATE TABLE IF NOT EXISTS banks (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);\n`);

    console.log('-- Transactions table');
    console.log(`CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  "sourceBank" TEXT,
  "recipientBank" TEXT,
  value NUMERIC NOT NULL,
  notes TEXT DEFAULT '',
  "createdAt" TIMESTAMPTZ NOT NULL
);\n`);

    console.log('After creating the tables, run this script again to seed the data.\n');

  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

async function seedDatabase() {
  console.log('Seeding database with existing data...');

  try {
    // Load existing JSON data
    const assetsData = JSON.parse(await fs.readFile(path.join(__dirname, '../data/assets.json'), 'utf-8'));
    const banksData = JSON.parse(await fs.readFile(path.join(__dirname, '../data/banks.json'), 'utf-8'));
    const transactionsData = JSON.parse(await fs.readFile(path.join(__dirname, '../data/transactions.json'), 'utf-8'));

    // Seed assets
    if (assetsData.length > 0) {
      console.log(`Seeding ${assetsData.length} assets...`);
      const { error: assetsError } = await supabase
        .from('assets')
        .insert(assetsData);

      if (assetsError) {
        console.error('Error seeding assets:', assetsError);
      } else {
        console.log('✅ Assets seeded successfully');
      }
    }

    // Seed banks
    if (banksData.length > 0) {
      console.log(`Seeding ${banksData.length} banks...`);
      const banksToInsert = banksData.map(name => ({ name }));
      const { error: banksError } = await supabase
        .from('banks')
        .insert(banksToInsert);

      if (banksError) {
        console.error('Error seeding banks:', banksError);
      } else {
        console.log('✅ Banks seeded successfully');
      }
    }

    // Seed transactions
    if (transactionsData.length > 0) {
      console.log(`Seeding ${transactionsData.length} transactions...`);
      const { error: transactionsError } = await supabase
        .from('transactions')
        .insert(transactionsData);

      if (transactionsError) {
        console.error('Error seeding transactions:', transactionsError);
      } else {
        console.log('✅ Transactions seeded successfully');
      }
    }

    console.log('\n🎉 Database setup and seeding completed!');
    
    // Verify the data
    const { data: assets } = await supabase.from('assets').select('*');
    const { data: banks } = await supabase.from('banks').select('*');
    const { data: transactions } = await supabase.from('transactions').select('*');
    
    console.log(`\nVerification:`);
    console.log(`- Assets: ${assets?.length || 0} records`);
    console.log(`- Banks: ${banks?.length || 0} records`);
    console.log(`- Transactions: ${transactions?.length || 0} records`);

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

async function main() {
  const arg = process.argv[2];
  
  if (arg === 'seed') {
    await seedDatabase();
  } else {
    await setupDatabase();
  }
}

main().catch(console.error);