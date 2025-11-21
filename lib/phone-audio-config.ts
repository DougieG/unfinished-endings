/**
 * Helper functions for fetching phone audio configuration
 */

import { supabase } from './supabase';

export interface PhoneAudioConfig {
  interior_intro: string;
  interior_outro: string;
  exterior_intro: string;
  exterior_outro: string;
  enable_intros?: boolean; // Toggle for testing - skip intro/outro if false
}

let cachedConfig: PhoneAudioConfig | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch phone audio configuration from database
 * Results are cached for 5 minutes to reduce database calls
 */
export async function getPhoneAudioConfig(): Promise<PhoneAudioConfig> {
  // Return cached config if still valid
  const now = Date.now();
  if (cachedConfig && (now - cacheTime) < CACHE_DURATION) {
    return cachedConfig;
  }

  try {
    const { data, error } = await supabase
      .from('phone_audio_config')
      .select('config_key, audio_url');

    if (error) {
      console.error('Error fetching phone audio config:', error);
      // Return defaults if database fails
      return getDefaultConfig();
    }

    if (!data || data.length === 0) {
      return getDefaultConfig();
    }

    // Transform array into object
    const config: PhoneAudioConfig = {
      interior_intro: '',
      interior_outro: '',
      exterior_intro: '',
      exterior_outro: '',
      enable_intros: true, // Default to true
    };

    data.forEach((row) => {
      if (row.config_key === 'interior_intro') config.interior_intro = row.audio_url;
      if (row.config_key === 'interior_outro') config.interior_outro = row.audio_url;
      if (row.config_key === 'exterior_intro') config.exterior_intro = row.audio_url;
      if (row.config_key === 'exterior_outro') config.exterior_outro = row.audio_url;
      if (row.config_key === 'enable_intros') config.enable_intros = row.metadata?.enable_intros !== false;
    });

    // Update cache
    cachedConfig = config;
    cacheTime = now;

    return config;
  } catch (error) {
    console.error('Failed to fetch phone audio config:', error);
    return getDefaultConfig();
  }
}

/**
 * Default configuration as fallback
 */
function getDefaultConfig(): PhoneAudioConfig {
  return {
    interior_intro: 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/int.phone pre-track.mp3',
    interior_outro: 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/int-post recording.mp3',
    exterior_intro: 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/1Listening.mp3',
    exterior_outro: 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/ext-post-story.mp3',
  };
}

/**
 * Clear the cache (useful after uploading new audio)
 */
export function clearAudioConfigCache() {
  cachedConfig = null;
  cacheTime = 0;
}
