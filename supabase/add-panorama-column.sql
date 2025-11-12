-- Add panorama column to stories table to store crankie sequences

ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS panorama JSONB;

-- Add index for querying stories with panoramas
CREATE INDEX IF NOT EXISTS idx_stories_panorama 
ON stories USING GIN (panorama) 
WHERE panorama IS NOT NULL;

-- Add comment
COMMENT ON COLUMN stories.panorama IS 'Crankie panorama data with scenes array for scrolling shadow puppet theater';
