-- Add ring tone to phone_audio_config table
INSERT INTO phone_audio_config (config_key, audio_url, display_name, description) VALUES
  ('ring_tone', 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/phone-ring.mp3', 'Phone Ring Tone', 'Plays when phone rings after recording is complete (loops until answered)')
ON CONFLICT (config_key) DO NOTHING;
