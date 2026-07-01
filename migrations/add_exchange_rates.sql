-- SQL Migrations for Exchange Rates Feature

-- 1. Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  currency_from VARCHAR(3) NOT NULL DEFAULT 'USD',
  currency_to VARCHAR(3) NOT NULL DEFAULT 'ARS',
  rate DECIMAL(10, 2) NOT NULL,
  source VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(date, currency_from, currency_to)
);

-- 2. Add exchange_rate column to transactions table if it doesn't exist
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 2);

-- 3. Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(date);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(currency_from, currency_to);

-- 4. Set up RLS policies for exchange_rates (if using Supabase)
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exchange rates" ON exchange_rates
FOR SELECT USING (true);

-- Optional: Allow authenticated users to insert exchange rates
CREATE POLICY "Authenticated users can insert exchange rates" ON exchange_rates
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- To run these migrations in Supabase:
-- 1. Go to the SQL Editor in the Supabase dashboard
-- 2. Create a new query
-- 3. Copy and paste the SQL above
-- 4. Execute the query
