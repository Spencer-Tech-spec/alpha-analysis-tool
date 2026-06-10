import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase URL or Service Role Key is missing. Check your .env.local file.');
}

// Service role client bypasses RLS. Only use this in server-side API routes!
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
