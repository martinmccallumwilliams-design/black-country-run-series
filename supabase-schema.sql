-- =============================================================
-- Black Country Run Series — Supabase Database Schema
-- Run this SQL in your Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. REGISTRATIONS — Interest signups (email collection)
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  club TEXT,
  races_interested TEXT[] DEFAULT '{}',
  gdpr_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ENTRIES — Paid race entries
CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  club TEXT,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('series', 'individual')),
  races TEXT[] NOT NULL DEFAULT '{}',
  race_number INTEGER UNIQUE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_id TEXT,
  emergency_contact TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  medical_info TEXT,
  t_shirt_size TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RESULTS — Race results
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  race_name TEXT NOT NULL CHECK (race_name IN ('Andy Holden 5K', 'GWR 5K', 'Dudley Zoo 5K')),
  finish_time INTERVAL,
  chip_time INTERVAL,
  position INTEGER,
  gender_position INTEGER,
  category TEXT,
  category_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_entries_email ON entries(email);
CREATE INDEX IF NOT EXISTS idx_entries_race_number ON entries(race_number);
CREATE INDEX IF NOT EXISTS idx_results_race ON results(race_name);
CREATE INDEX IF NOT EXISTS idx_results_entry ON results(entry_id);

-- Auto-update updated_at on entries
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Registrations: anyone can INSERT (public signup form)
CREATE POLICY "Allow public registration inserts"
  ON registrations FOR INSERT
  WITH CHECK (true);

-- Registrations: only authenticated (admin) can read
CREATE POLICY "Allow admin to read registrations"
  ON registrations FOR SELECT
  USING (auth.role() = 'authenticated');

-- Entries: anyone can INSERT (public entry form)
CREATE POLICY "Allow public entry inserts"
  ON entries FOR INSERT
  WITH CHECK (true);

-- Entries: only authenticated (admin) can read/update
CREATE POLICY "Allow admin to read entries"
  ON entries FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin to update entries"
  ON entries FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Results: anyone can read (public results page)
CREATE POLICY "Allow public to read results"
  ON results FOR SELECT
  USING (true);

-- Results: only authenticated (admin) can insert/update
CREATE POLICY "Allow admin to insert results"
  ON results FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin to update results"
  ON results FOR UPDATE
  USING (auth.role() = 'authenticated');
