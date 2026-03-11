-- Black Country Run Series — Initial Schema
-- Run this in Supabase SQL Editor to set up all tables

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  email text NOT NULL,
  club text,
  races_interested text[] DEFAULT '{}',
  gdpr_consent boolean DEFAULT false,
  priority_code_sent boolean DEFAULT false,
  priority_code_sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

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

-- Insert default settings row
INSERT INTO entry_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_priority_sent ON registrations(priority_code_sent);
CREATE INDEX IF NOT EXISTS idx_entries_payment_status ON entries(payment_status);
CREATE INDEX IF NOT EXISTS idx_entries_email ON entries(email);
CREATE INDEX IF NOT EXISTS idx_priority_codes_code ON priority_codes(code);
CREATE INDEX IF NOT EXISTS idx_priority_codes_registration ON priority_codes(registration_id);
CREATE INDEX IF NOT EXISTS idx_results_race_name ON results(race_name);

-- ============================================================
-- RACE NUMBER ASSIGNMENT FUNCTION
-- Uses advisory lock to prevent duplicate numbers under concurrency
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
-- AGE GROUP HELPER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION get_age_group(dob date, gender char)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  age integer;
BEGIN
  age := date_part('year', age(dob));
  IF gender = 'M' THEN
    IF age < 40 THEN RETURN 'MS';
    ELSIF age < 45 THEN RETURN 'MV40';
    ELSIF age < 50 THEN RETURN 'MV45';
    ELSIF age < 55 THEN RETURN 'MV50';
    ELSIF age < 60 THEN RETURN 'MV55';
    ELSIF age < 65 THEN RETURN 'MV60';
    ELSE RETURN 'MV65+';
    END IF;
  ELSE
    IF age < 40 THEN RETURN 'FS';
    ELSIF age < 45 THEN RETURN 'FV40';
    ELSIF age < 50 THEN RETURN 'FV45';
    ELSIF age < 55 THEN RETURN 'FV50';
    ELSIF age < 60 THEN RETURN 'FV55';
    ELSIF age < 65 THEN RETURN 'FV60';
    ELSE RETURN 'FV65+';
    END IF;
  END IF;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_settings ENABLE ROW LEVEL SECURITY;

-- Public: insert registrations (sign-up form)
CREATE POLICY "anon_insert_registrations" ON registrations
  FOR INSERT TO anon WITH CHECK (true);

-- Public: read results
CREATE POLICY "anon_read_results" ON results
  FOR SELECT TO anon USING (true);

-- Public: read entry_settings (to know if entries are open)
CREATE POLICY "anon_read_entry_settings" ON entry_settings
  FOR SELECT TO anon USING (true);

-- Public: read paid entries count only
CREATE POLICY "anon_read_paid_entries" ON entries
  FOR SELECT TO anon USING (payment_status = 'paid');

-- Admin: full access to all tables
CREATE POLICY "admin_all_registrations" ON registrations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_entries" ON entries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_results" ON results
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_priority_codes" ON priority_codes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_entry_settings" ON entry_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
