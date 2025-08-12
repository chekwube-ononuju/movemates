import { createClient } from '@supabase/supabase-js';

/*
 * Initialize and export a Supabase client.
 *
 * The Supabase URL and Anon Key should be provided via environment variables.
 * When deploying to Vercel, define `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
 * in your project settings. For local development, create a `.env.local` file
 * with these variables.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);