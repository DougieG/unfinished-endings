-- Narrative Visual System: Corpus & Pattern Database
-- Run this after main migration.sql

-- Stories corpus (separate from live stories)
CREATE TABLE IF NOT EXISTS stories_corpus (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source text NOT NULL, -- 'storycorps', 'moth', 'reddit', 'modernloss', 'submission'
  raw_text text NOT NULL,
  cleaned_text text,
  word_count int,
  collected_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  processed boolean DEFAULT false
);

CREATE INDEX idx_corpus_source ON stories_corpus(source);
CREATE INDEX idx_corpus_processed ON stories_corpus(processed) WHERE processed = false;

-- Story analysis results
CREATE TABLE IF NOT EXISTS story_analysis (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id uuid REFERENCES stories_corpus(id) ON DELETE CASCADE,
  
  -- Extracted patterns
  themes jsonb NOT NULL DEFAULT '[]',
  metaphors jsonb NOT NULL DEFAULT '[]',
  emotional_arc jsonb NOT NULL DEFAULT '{}',
  objects_mentioned jsonb NOT NULL DEFAULT '[]',
  temporal_markers jsonb NOT NULL DEFAULT '[]',
  sentiment_score float,
  
  -- Full analysis
  raw_analysis jsonb,
  
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(story_id)
);

CREATE INDEX idx_analysis_themes ON story_analysis USING GIN (themes);
CREATE INDEX idx_analysis_objects ON story_analysis USING GIN (objects_mentioned);

-- Learned patterns from corpus
CREATE TABLE IF NOT EXISTS learned_patterns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_type text NOT NULL, -- 'theme', 'metaphor', 'composition', 'emotional'
  pattern_name text NOT NULL,
  pattern_data jsonb NOT NULL,
  
  -- Statistical info
  occurrence_count int DEFAULT 0,
  frequency float, -- 0.0 to 1.0
  confidence float, -- 0.0 to 1.0
  
  -- Example stories exhibiting this pattern
  example_story_ids jsonb DEFAULT '[]',
  
  discovered_at timestamptz NOT NULL DEFAULT now(),
  last_updated timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(pattern_type, pattern_name)
);

CREATE INDEX idx_patterns_type ON learned_patterns(pattern_type);
CREATE INDEX idx_patterns_frequency ON learned_patterns(frequency DESC);

-- Visual symbols vocabulary
CREATE TABLE IF NOT EXISTS visual_symbols (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol_name text NOT NULL UNIQUE,
  category text NOT NULL, -- 'figure', 'flora', 'frame', 'object', 'creature', 'pattern'
  
  -- Corpus statistics
  occurrence_count int DEFAULT 0,
  priority_score float, -- calculated from frequency + importance
  
  -- Co-occurrence data
  co_occurrences jsonb DEFAULT '{}', -- {symbol_name: count}
  
  -- SVG variants
  svg_variants jsonb DEFAULT '[]', -- array of {id, viewBox, paths, cutouts, layer}
  
  -- Keywords that trigger this symbol
  trigger_keywords jsonb DEFAULT '[]',
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_symbols_category ON visual_symbols(category);
CREATE INDEX idx_symbols_priority ON visual_symbols(priority_score DESC);

-- Composition rules (learned from analysis)
CREATE TABLE IF NOT EXISTS composition_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme_name text NOT NULL,
  
  -- Layout parameters
  frame_style text,
  primary_position text,
  object_placement text,
  negative_space text,
  symmetry boolean,
  depth_emphasis text,
  
  -- Animation parameters  
  movement_style text,
  tempo_modifier float DEFAULT 1.0,
  
  -- When to apply this rule
  confidence_threshold float DEFAULT 0.7,
  
  examples int DEFAULT 0, -- number of stories this applies to
  
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(theme_name)
);

CREATE INDEX idx_composition_themes ON composition_rules(theme_name);

-- Generated visuals cache
CREATE TABLE IF NOT EXISTS generated_visuals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  
  -- Generation method
  generation_method text NOT NULL, -- 'pattern_match', 'procedural', 'ai_generated'
  
  -- Composition data
  composition jsonb NOT NULL, -- full scene composition
  svg_cache text, -- rendered SVG for fast loading
  
  -- Metadata
  matched_patterns jsonb DEFAULT '[]',
  symbols_used jsonb DEFAULT '[]',
  generation_time_ms int,
  
  generated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(story_id)
);

CREATE INDEX idx_visuals_method ON generated_visuals(generation_method);
CREATE INDEX idx_visuals_story ON generated_visuals(story_id);

-- Pattern evolution tracking
CREATE TABLE IF NOT EXISTS pattern_evolution (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_date date NOT NULL,
  
  -- Pattern statistics at this date
  total_stories_analyzed int,
  total_patterns_discovered int,
  top_themes jsonb,
  top_metaphors jsonb,
  symbol_frequencies jsonb,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(snapshot_date)
);

-- Enable RLS
ALTER TABLE stories_corpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE learned_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE composition_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_visuals ENABLE ROW LEVEL SECURITY;

-- Public read policies for research/transparency
CREATE POLICY "public_read_patterns" ON learned_patterns FOR SELECT USING (true);
CREATE POLICY "public_read_symbols" ON visual_symbols FOR SELECT USING (true);
CREATE POLICY "public_read_composition" ON composition_rules FOR SELECT USING (true);

-- Corpus is admin-only
CREATE POLICY "admin_all_corpus" ON stories_corpus FOR ALL USING (true);
CREATE POLICY "admin_all_analysis" ON story_analysis FOR ALL USING (true);
CREATE POLICY "admin_all_visuals" ON generated_visuals FOR ALL USING (true);
