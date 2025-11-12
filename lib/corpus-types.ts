/**
 * Type definitions for Narrative Visual System
 */

export interface CorpusStory {
  id: string;
  source: 'storycorps' | 'moth' | 'reddit' | 'modernloss' | 'submission';
  raw_text: string;
  cleaned_text: string | null;
  word_count: number | null;
  collected_at: string;
  metadata: Record<string, any>;
  processed: boolean;
}

export interface Theme {
  name: string;
  confidence: number;
  keywords: string[];
}

export interface Metaphor {
  source_domain: string; // e.g., "journey"
  target_domain: string; // e.g., "life"
  examples: string[]; // phrases from text
}

export interface EmotionalArc {
  overall_sentiment: number; // -1 to 1
  trajectory: 'declining' | 'rising' | 'stable' | 'complex';
  key_moments: Array<{
    position: number; // 0 to 1 (percentage through story)
    sentiment: number;
    intensity: number;
  }>;
}

export interface ObjectMention {
  object: string;
  category: string; // 'person', 'place', 'thing', 'abstract'
  frequency: number;
  context: string[]; // surrounding words
}

export interface TemporalMarker {
  type: 'duration' | 'frequency' | 'sequence' | 'moment';
  marker: string; // e.g., "every morning", "still", "never"
  tense: 'past' | 'present' | 'future';
}

export interface StoryAnalysis {
  id: string;
  story_id: string;
  themes: Theme[];
  metaphors: Metaphor[];
  emotional_arc: EmotionalArc;
  objects_mentioned: ObjectMention[];
  temporal_markers: TemporalMarker[];
  sentiment_score: number | null;
  raw_analysis: Record<string, any> | null;
  analyzed_at: string;
}

export interface LearnedPattern {
  id: string;
  pattern_type: 'theme' | 'metaphor' | 'composition' | 'emotional';
  pattern_name: string;
  pattern_data: Record<string, any>;
  occurrence_count: number;
  frequency: number;
  confidence: number;
  example_story_ids: string[];
  discovered_at: string;
  last_updated: string;
}

export interface VisualSymbol {
  id: string;
  symbol_name: string;
  category: 'figure' | 'flora' | 'frame' | 'object' | 'creature' | 'pattern';
  occurrence_count: number;
  priority_score: number;
  co_occurrences: Record<string, number>;
  svg_variants: SVGVariant[];
  trigger_keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface SVGVariant {
  id: string;
  viewBox: string;
  paths: string;
  cutouts: string;
  layer: number;
  detail_level: 'simple' | 'medium' | 'ornate';
}

export interface CompositionRule {
  id: string;
  theme_name: string;
  frame_style: string | null;
  primary_position: string | null;
  object_placement: string | null;
  negative_space: string | null;
  symmetry: boolean | null;
  depth_emphasis: string | null;
  movement_style: string | null;
  tempo_modifier: number;
  confidence_threshold: number;
  examples: number;
  created_at: string;
}

export interface VisualComposition {
  frame: SVGVariant | null;
  background: SVGVariant[];
  midground: SVGVariant[];
  foreground: SVGVariant[];
  layout: LayoutParameters;
  timeline: TimelineEvent[];
}

export interface LayoutParameters {
  symmetry: boolean;
  primary_position: { x: number; y: number };
  negative_space_emphasis: 'left' | 'right' | 'top' | 'bottom' | 'center';
  depth_layers: number;
}

export interface TimelineEvent {
  start_time: number; // seconds
  duration: number;
  element_id: string;
  animation_type: 'fade_in' | 'emerge' | 'materialize' | 'dissolve' | 'linger' | 'peak_intensity';
  easing: string;
}

export interface GeneratedVisual {
  id: string;
  story_id: string;
  generation_method: 'pattern_match' | 'procedural' | 'ai_generated';
  composition: VisualComposition;
  svg_cache: string | null;
  matched_patterns: string[];
  symbols_used: string[];
  generation_time_ms: number | null;
  generated_at: string;
}
