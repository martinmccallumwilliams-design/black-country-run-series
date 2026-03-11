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
  priority_code_sent?: boolean;
  priority_code_sent_at?: string;
}

export interface Entry {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  nationality?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  club?: string;
  uka_number?: string;
  entry_type: 'series' | 'individual';
  races: string[];
  race_number?: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_id?: string;
  priority_code?: string;
  stripe_session_id?: string;
  stripe_payment_intent?: string;
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

export interface PriorityCode {
  id?: string;
  registration_id?: string;
  code: string;
  email: string;
  first_name: string;
  used: boolean;
  used_at?: string;
  entry_id?: string;
  created_at?: string;
  expires_at: string;
}

export interface EntrySettings {
  id: number;
  priority_window_open: boolean;
  priority_window_start?: string;
  priority_window_end?: string;
  general_entries_open: boolean;
  max_series_entries: number;
  series_price_gbp: number;
  individual_price_gbp: number;
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

// --- Priority Entry Functions ---

export async function validatePriorityCode(code: string): Promise<{ valid: boolean; error?: string; data?: PriorityCode }> {
  if (!isConfigured) {
    // Simulate for dev
    if (code === 'BCR-TEST-CODE') {
      return {
        valid: true,
        data: {
          code: 'BCR-TEST-CODE',
          email: 'test@example.com',
          first_name: 'Test',
          used: false,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        },
      };
    }
    return { valid: false, error: 'Invalid code' };
  }

  const { data, error } = await supabase
    .from('priority_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid priority code. Please check and try again.' };
  }

  if (data.used) {
    return { valid: false, error: 'This priority code has already been used.' };
  }

  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'This priority code has expired.' };
  }

  return { valid: true, data };
}

export async function getEntrySettings(): Promise<EntrySettings | null> {
  if (!isConfigured) {
    return {
      id: 1,
      priority_window_open: true,
      general_entries_open: false,
      max_series_entries: 350,
      series_price_gbp: 3500,
      individual_price_gbp: 1500,
    };
  }

  const { data, error } = await supabase
    .from('entry_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    console.error('Error fetching entry settings:', error);
    return null;
  }

  return data;
}

export async function getPaidEntriesCount(): Promise<number> {
  if (!isConfigured) return 0;

  const { count, error } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .eq('entry_type', 'series')
    .in('payment_status', ['paid']);

  if (error) {
    console.error('Error counting entries:', error);
    return 0;
  }

  return count || 0;
}

export async function createCheckoutSession(entryData: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  nationality?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  club?: string;
  uka_number?: string;
  entry_type: 'series' | 'individual';
  races: string[];
  emergency_contact: string;
  emergency_phone: string;
  medical_info?: string;
  t_shirt_size?: string;
  priority_code?: string;
}): Promise<{ checkoutUrl: string; sessionId: string }> {
  if (!isConfigured) {
    console.log('💳 Checkout (simulated):', entryData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { checkoutUrl: '/enter/success?session_id=demo', sessionId: 'demo' };
  }

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: entryData,
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return { checkoutUrl: data.checkoutUrl, sessionId: data.sessionId };
}

// --- Admin Functions ---

export async function sendPriorityCodes(priorityHours: number = 48): Promise<{
  generated: number;
  sent: number;
  failed: number;
  expiresAt: string;
}> {
  const { data, error } = await supabase.functions.invoke('send-priority-codes', {
    body: { action: 'generate', priorityHours },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}

export async function resendPriorityCode(registrationId: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('send-priority-codes', {
    body: { action: 'resend', registrationId },
  });

  if (error) throw error;
  return data?.success || false;
}

export async function sendFollowUpEmails(): Promise<{
  sent: number;
  failed: number;
}> {
  const { data, error } = await supabase.functions.invoke('send-priority-codes', {
    body: { action: 'followup' },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return { sent: data.sent || 0, failed: data.failed || 0 };
}
