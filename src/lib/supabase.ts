import { createClient } from '@supabase/supabase-js';

// These are safe to expose in the frontend — they are "anon" (public) keys
// Row Level Security in Supabase protects your data
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase credentials not found. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file. The site will work but form submissions will be simulated.'
  );
}

// Use a placeholder URL if not configured to prevent createClient from crashing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// --- Types ---

export interface Registration {
  id?: string;
  first_name: string;
  email: string;
  club?: string;
  races_interested: string[];
  gdpr_consent: boolean;
  created_at?: string;
}

export interface Entry {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  club?: string;
  entry_type: 'series' | 'individual';
  races: string[];
  race_number?: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_id?: string;
  emergency_contact: string;
  emergency_phone: string;
  medical_info?: string;
  t_shirt_size?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RaceResult {
  id?: string;
  entry_id: string;
  race_name: string;
  finish_time?: string;
  chip_time?: string;
  position?: number;
  gender_position?: number;
  category?: string;
  category_position?: number;
  created_at?: string;
  // Joined fields
  entry?: Entry;
}

// --- API Functions ---

export async function submitRegistration(data: Omit<Registration, 'id' | 'created_at'>) {
  if (!isConfigured) {
    // Simulate success when Supabase isn't configured
    console.log('📧 Registration (simulated):', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...data, id: 'demo-' + Date.now() };
  }

  const { error } = await supabase
    .from('registrations')
    .insert([data]);

  if (error) throw error;

  // Send confirmation email in the background (don't block registration)
  try {
    await supabase.functions.invoke('send-registration-email', {
      body: { record: data },
    });
    console.log('📧 Confirmation email sent');
  } catch (emailError) {
    // Email failure shouldn't prevent registration success
    console.warn('⚠️ Confirmation email failed:', emailError);
  }

  return { ...data, id: 'submitted' };
}

export async function submitEntry(data: Omit<Entry, 'id' | 'created_at' | 'updated_at' | 'race_number' | 'payment_status'>) {
  if (!isConfigured) {
    console.log('🏃 Entry (simulated):', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...data, id: 'demo-' + Date.now(), payment_status: 'pending' };
  }

  const { error } = await supabase
    .from('entries')
    .insert([{ ...data, payment_status: 'pending' }]);

  if (error) throw error;
  return { ...data, id: 'submitted', payment_status: 'pending' as const };
}

export async function getResults(raceName?: string) {
  if (!isConfigured) {
    return [];
  }

  let query = supabase
    .from('results')
    .select(`
      *,
      entry:entries(first_name, last_name, club, gender, date_of_birth, race_number)
    `)
    .order('position', { ascending: true });

  if (raceName) {
    query = query.eq('race_name', raceName);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

