-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id text PRIMARY KEY,
  name text NOT NULL,
  symbol text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  price numeric DEFAULT NULL,
  qty numeric DEFAULT NULL,
  change24h numeric NOT NULL DEFAULT 0,
  changePercent numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  history jsonb DEFAULT '[]',
  createdAt text NOT NULL,
  bankName text DEFAULT NULL,
  accountType text DEFAULT NULL,
  notes text DEFAULT NULL,
  propertyType text DEFAULT NULL,
  purchasePrice numeric DEFAULT NULL,
  admTaxFee numeric DEFAULT NULL,
  payments jsonb DEFAULT NULL
);

-- Create banks table
CREATE TABLE IF NOT EXISTS banks (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  createdAt text NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY,
  type text NOT NULL,
  category text NOT NULL,
  sourceBank text DEFAULT NULL,
  recipientBank text DEFAULT NULL,
  value numeric NOT NULL DEFAULT 0,
  notes text DEFAULT NULL,
  createdAt text NOT NULL
);