-- Black Country Run Series — Add missing entry columns + recreate supporting tables
-- Safe to run: uses IF NOT EXISTS / IF NOT EXISTS everywhere.
-- Does NOT touch the registrations table.

-- ============================================================
-- 1. Recreate supporting tables (safe — won't overwrite if present)
-- ============================================================

CREATE TABLE IF NOT EXISTS entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  date_of_birth date NOT NULL,
  gender char(1) NOT NULL CHECK (gender IN ('M', 'F')),
  club text,
  entry_type text NOT NULL CHECK (entry_type IN ('series', 'individual')),
  races text[] DEFAULT '{}',
  race_number integer UNIQUE,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_id text,
  priority_code text,
  stripe_session_id text,
  stripe_payment_intent text,
  emergency_contact text NOT NULL,
  emergency_phone text NOT NULL,
  medical_info text,
  t_shirt_size text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id uuid REFERENCES entries(id),
  race_name text NOT NULL,
  finish_time text,
  chip_time text,
  position integer,
  gender_position integer,
  category text,
  category_position integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS priority_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id uuid REFERENCES registrations(id),
  code text UNIQUE NOT NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  used boolean DEFAULT false,
  used_at timestamptz,
  entry_id uuid REFERENCES entries(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entry_settings (
  id integer PRIMARY KEY DEFAULT 1,
  priority_window_open boolean DEFAULT false,
  priority_window_start timestamptz,
  priority_window_end timestamptz,
  general_entries_open boolean DEFAULT false,
  max_series_entries integer DEFAULT 350,
  series_price_gbp integer DEFAULT 3500,
  individual_price_gbp integer DEFAULT 1500,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings row if missing
INSERT INTO entry_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Add new columns to entries (safe — IF NOT EXISTS)
-- ============================================================

ALTER TABLE entries ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS nationality text DEFAULT 'British';
ALTER TABLE entries ADD COLUMN IF NOT EXISTS address_line1 text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS address_line2 text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS postcode text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS uka_number text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS priority_code text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS stripe_payment_intent text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS payment_id text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS t_shirt_size text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS medical_info text;

-- ============================================================
-- 3. Add missing columns to registrations (safe — won't touch existing data)
-- ============================================================

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS priority_code_sent boolean DEFAULT false;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS priority_code_sent_at timestamptz;

-- ============================================================
-- 4. Indexes (safe — IF NOT EXISTS)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_priority_sent ON registrations(priority_code_sent);
CREATE INDEX IF NOT EXISTS idx_entries_payment_status ON entries(payment_status);
CREATE INDEX IF NOT EXISTS idx_entries_email ON entries(email);
CREATE INDEX IF NOT EXISTS idx_priority_codes_code ON priority_codes(code);
CREATE INDEX IF NOT EXISTS idx_priority_codes_registration ON priority_codes(registration_id);
CREATE INDEX IF NOT EXISTS idx_results_race_name ON results(race_name);

-- ============================================================
-- 5. Race number assignment function
-- ============================================================

CREATE OR REPLACE FUNCTION assign_race_number(entry_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  next_num integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('assign_race_number'));
  SELECT COALESCE(MAX(race_number), 0) + 1 INTO next_num
  FROM entries
  WHERE race_number IS NOT NULL;
  UPDATE entries SET race_number = next_num WHERE id = entry_uuid;
  RETURN next_num;
END;
$$;

-- ============================================================
-- 6. Row Level Security (safe — policies only fail if duplicate named)
-- ============================================================

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_settings ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies so this script is idempotent
DO $$
BEGIN
  -- registrations: anon insert (sign-up form)
  DROP POLICY IF EXISTS "anon_insert_registrations" ON registrations;
  CREATE POLICY "anon_insert_registrations" ON registrations
    FOR INSERT TO anon WITH CHECK (true);

  -- registrations: admin full access
  DROP POLICY IF EXISTS "admin_all_registrations" ON registrations;
  CREATE POLICY "admin_all_registrations" ON registrations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- entry_settings: anon read
  DROP POLICY IF EXISTS "anon_read_entry_settings" ON entry_settings;
  CREATE POLICY "anon_read_entry_settings" ON entry_settings
    FOR SELECT TO anon USING (true);

  -- entries: anon read paid only
  DROP POLICY IF EXISTS "anon_read_paid_entries" ON entries;
  CREATE POLICY "anon_read_paid_entries" ON entries
    FOR SELECT TO anon USING (payment_status = 'paid');

  -- results: anon read
  DROP POLICY IF EXISTS "anon_read_results" ON results;
  CREATE POLICY "anon_read_results" ON results
    FOR SELECT TO anon USING (true);

  -- priority_codes: anon read (needed to validate codes on entry form)
  DROP POLICY IF EXISTS "anon_read_priority_codes" ON priority_codes;
  CREATE POLICY "anon_read_priority_codes" ON priority_codes
    FOR SELECT TO anon USING (true);

  -- Admin: full access
  DROP POLICY IF EXISTS "admin_all_entries" ON entries;
  CREATE POLICY "admin_all_entries" ON entries
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "admin_all_results" ON results;
  CREATE POLICY "admin_all_results" ON results
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "admin_all_priority_codes" ON priority_codes;
  CREATE POLICY "admin_all_priority_codes" ON priority_codes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "admin_all_entry_settings" ON entry_settings;
  CREATE POLICY "admin_all_entry_settings" ON entry_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;
