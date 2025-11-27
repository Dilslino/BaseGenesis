-- Supabase Schema for BaseGenesis
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  username TEXT,
  pfp_url TEXT,
  fid INTEGER,
  rank TEXT NOT NULL,
  days_since_joined INTEGER NOT NULL,
  first_tx_date TIMESTAMPTZ NOT NULL,
  first_tx_hash TEXT NOT NULL,
  block_number TEXT NOT NULL,
  tx_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_users_days ON users(days_since_joined DESC);
CREATE INDEX IF NOT EXISTS idx_users_rank ON users(rank);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read
CREATE POLICY "Allow public read" ON users
  FOR SELECT USING (true);

-- Create policy to allow insert/update from authenticated or anon
CREATE POLICY "Allow public insert" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON users
  FOR UPDATE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
