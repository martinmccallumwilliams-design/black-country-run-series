-- =============================================================
-- Black Country Run Series — Priority Entry System Migration
-- Run this SQL in your Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. PRIORITY CODES TABLE
-- Each registered user gets a unique priority code
CREATE TABLE IF NOT EXISTS priority_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
  code TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  entry_id UUID REFERENCES entries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_priority_codes_code ON priority_codes(code);
CREATE INDEX IF NOT EXISTS idx_priority_codes_email ON priority_codes(email);
CREATE INDEX IF NOT EXISTS idx_priority_codes_used ON priority_codes(used);

-- 2. ADD NEW COLUMNS TO ENTRIES TABLE
-- Track the priority code used and Stripe session
ALTER TABLE entries ADD COLUMN IF NOT EXISTS priority_code TEXT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;

-- 3. ENTRY SETTINGS TABLE 
-- Controls whether entries are open, max capacity, etc.
CREATE TABLE IF NOT EXISTS entry_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- ensures single row
  priority_window_open BOOLEAN DEFAULT false,
  priority_window_start TIMESTAMPTZ,
  priority_window_end TIMESTAMPTZ,
  general_entries_open BOOLEAN DEFAULT false,
  max_series_entries INTEGER DEFAULT 350,
  series_price_gbp INTEGER DEFAULT 3500, -- in pence for Stripe
  individual_price_gbp INTEGER DEFAULT 1500,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings row
INSERT INTO entry_settings (id, priority_window_open, general_entries_open, max_series_entries, series_price_gbp, individual_price_gbp)
VALUES (1, false, false, 350, 3500, 1500)
ON CONFLICT (id) DO NOTHING;

-- 4. ROW LEVEL SECURITY for new tables

-- Priority Codes: public can validate (read), only admin can create/update
ALTER TABLE priority_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to validate codes"
  ON priority_codes FOR SELECT
  USING (true);

CREATE POLICY "Allow admin to manage codes"
  ON priority_codes FOR ALL
  USING (auth.role() = 'authenticated');

-- Entry Settings: public can read (to check if entries are open), admin can update
ALTER TABLE entry_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read entry settings"
  ON entry_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow admin to update entry settings"
  ON entry_settings FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. UPDATE entries RLS to allow service_role updates (for Stripe webhook)
-- The webhook uses service_role key so it bypasses RLS automatically.
-- No changes needed.

-- 6. Add priority_code_sent tracking to registrations
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS priority_code_sent BOOLEAN DEFAULT false;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS priority_code_sent_at TIMESTAMPTZ;
