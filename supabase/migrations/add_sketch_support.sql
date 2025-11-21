-- Add sketch support to stories table
-- Unfinished Endings - Visual Reference Form Processing

-- Add sketch-related columns to stories table
ALTER TABLE stories 
  ADD COLUMN IF NOT EXISTS sketch_original_url TEXT,
  ADD COLUMN IF NOT EXISTS sketch_processed_url TEXT,
  ADD COLUMN IF NOT EXISTS sketch_title TEXT,
  ADD COLUMN IF NOT EXISTS sketch_first_name TEXT,
  ADD COLUMN IF NOT EXISTS sketch_email TEXT,
  ADD COLUMN IF NOT EXISTS has_custom_sketch BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sketch_uploaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS form_metadata JSONB;

-- Index for efficient sketch queries
CREATE INDEX IF NOT EXISTS idx_stories_has_sketch 
  ON stories(has_custom_sketch) 
  WHERE has_custom_sketch = true;

-- Index for sketch upload date
CREATE INDEX IF NOT EXISTS idx_stories_sketch_uploaded 
  ON stories(sketch_uploaded_at DESC);

-- Comment for documentation
COMMENT ON COLUMN stories.sketch_original_url IS 'URL to original scanned form image';
COMMENT ON COLUMN stories.sketch_processed_url IS 'URL to processed silhouette image extracted from form';
COMMENT ON COLUMN stories.sketch_title IS 'Title extracted from form via OCR';
COMMENT ON COLUMN stories.sketch_first_name IS 'First name extracted from form';
COMMENT ON COLUMN stories.sketch_email IS 'Email extracted from form';
COMMENT ON COLUMN stories.has_custom_sketch IS 'Whether this story has an uploaded sketch from intake form';
COMMENT ON COLUMN stories.form_metadata IS 'Additional form data (category, ache level, etc.)';
