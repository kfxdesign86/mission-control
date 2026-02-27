import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// Database schema initialization
export async function initializeDatabase() {
  try {
    // Create assets table
    await sql`
      CREATE TABLE IF NOT EXISTS assets (
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
        updated_at TIMESTAMP DEFAULT NOW(),
        -- Category-specific fields
        bank_name TEXT,
        account_type TEXT,
        recipient_bank TEXT,
        property_type TEXT,
        purchase_price DECIMAL(20,2),
        initial_payment DECIMAL(20,2),
        adm_tax_fee DECIMAL(20,2),
        notes TEXT,
        -- JSON fields for complex data
        history JSONB DEFAULT '[]',
        payments JSONB DEFAULT '[]'
      );
    `;

    // Create banks table
    await sql`
      CREATE TABLE IF NOT EXISTS banks (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        source_bank TEXT,
        recipient_bank TEXT,
        value DECIMAL(20,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_banks_name ON banks(name);`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}