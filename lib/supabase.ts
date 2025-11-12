import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role for admin operations
export function getServiceSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Type definitions
export type Story = {
  id: string;
  created_at: string;
  source: 'interior' | 'exterior' | 'preload' | 'upload';
  duration_s: number | null;
  audio_url: string;
  transcript: string | null;
  keywords: string[] | null;
  visual_url: string | null;
  panorama: any | null; // CrankiePanorama with scenes array
  consent: boolean;
  play_count: number;
  last_played_at: string | null;
};
