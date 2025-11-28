-- Migration: Real-time Wallets Scanned Counter
-- Run this in your Supabase SQL Editor AFTER the initial schema

-- ============================================
-- 1. Create scans table to track all scans
-- ============================================
CREATE TABLE IF NOT EXISTS scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_scans_wallet ON scans(wallet_address);
CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at DESC);

-- ============================================
-- 2. Create global_stats table for counters
-- ============================================
CREATE TABLE IF NOT EXISTS global_stats (
  id TEXT PRIMARY KEY DEFAULT 'main',
  total_scans INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial row if not exists
INSERT INTO global_stats (id, total_scans) 
VALUES ('main', 0) 
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. Create trigger function to increment count
-- ============================================
CREATE OR REPLACE FUNCTION increment_scan_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE global_stats 
  SET total_scans = total_scans + 1,
      updated_at = NOW()
  WHERE id = 'main';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on scans table
DROP TRIGGER IF EXISTS on_scan_insert ON scans;
CREATE TRIGGER on_scan_insert
  AFTER INSERT ON scans
  FOR EACH ROW
  EXECUTE FUNCTION increment_scan_count();

-- ============================================
-- 4. Enable Row Level Security
-- ============================================
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read on global_stats
CREATE POLICY "Allow public read global_stats" ON global_stats
  FOR SELECT USING (true);

-- Allow public insert on scans
CREATE POLICY "Allow public insert scans" ON scans
  FOR INSERT WITH CHECK (true);

-- Allow public read on scans (optional, for debugging)
CREATE POLICY "Allow public read scans" ON scans
  FOR SELECT USING (true);

-- ============================================
-- 5. Enable Realtime for global_stats
-- ============================================
-- Run this in Supabase Dashboard > Database > Replication
-- Or use this command:
ALTER PUBLICATION supabase_realtime ADD TABLE global_stats;

-- ============================================
-- 6. Sync existing users count to global_stats
-- ============================================
UPDATE global_stats 
SET total_scans = (SELECT COUNT(*) FROM users)
WHERE id = 'main';
