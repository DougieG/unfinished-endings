-- Create phone_audio_config table for managing intro/outro audio files
CREATE TABLE IF NOT EXISTS phone_audio_config (
  id SERIAL PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  audio_url TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration entries
INSERT INTO phone_audio_config (config_key, audio_url, display_name, description) VALUES
  ('interior_intro', 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/int.phone pre-track.mp3', 'Interior Phone - Intro', 'Plays when user picks up the recording phone, before recording starts'),
  ('interior_outro', 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/int-post recording.mp3', 'Interior Phone - Outro', 'Plays after recording completes, before returning to idle'),
  ('exterior_intro', 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/1Listening.mp3', 'Exterior Phone - Intro (optional)', 'Optional: Plays when user picks up the listening phone'),
  ('exterior_outro', 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/ext-post-story.mp3', 'Exterior Phone - Outro', 'Plays after crankie animation completes')
ON CONFLICT (config_key) DO NOTHING;

-- Add RLS policies
ALTER TABLE phone_audio_config ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read audio config
CREATE POLICY "Allow public read access" ON phone_audio_config
  FOR SELECT USING (true);

-- Only service role can update
CREATE POLICY "Allow service role to update" ON phone_audio_config
  FOR UPDATE USING (true);

-- Create function to auto-update timestamp
CREATE OR REPLACE FUNCTION update_phone_audio_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_phone_audio_config_timestamp
  BEFORE UPDATE ON phone_audio_config
  FOR EACH ROW
  EXECUTE FUNCTION update_phone_audio_config_timestamp();
