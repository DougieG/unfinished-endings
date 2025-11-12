/**
 * Corpus Analyzer - GPT-4 powered story analysis
 */

import OpenAI from 'openai';
import type { 
  StoryAnalysis, 
  Theme, 
  Metaphor, 
  EmotionalArc, 
  ObjectMention,
  TemporalMarker 
} from './corpus-types';

// Lazy-load OpenAI client to allow env vars to be set first
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

const ANALYST_SYSTEM_PROMPT = `You are an expert analyst of personal narratives about loss and grief. 

Analyze the story and extract:

1. **Themes** (1-3 primary themes): Identify overarching emotional/narrative patterns
   Examples: "incomplete_ritual", "tactile_memory", "threshold_moment", "inherited_behavior", "presence_in_absence"

2. **Metaphors**: Identify symbolic language and conceptual metaphors
   Format: {source_domain, target_domain, examples}
   Examples: 
   - Time as stopped/frozen
   - Loss as threshold/doorway
   - Memory as object/container
   - Connection as thread/fabric

3. **Emotional Arc**: Track sentiment through the narrative
   Provide: overall_sentiment (-1 to 1), trajectory, and 3-5 key emotional moments

4. **Objects Mentioned**: Concrete physical objects that appear in the story
   Categorize as: person, place, thing, abstract
   Note frequency and surrounding context

5. **Temporal Markers**: Language about time, frequency, duration
   Types: duration, frequency, sequence, moment
   Examples: "every morning", "still", "never again", "now too"

Return ONLY valid JSON matching this schema:
{
  "themes": [{"name": string, "confidence": 0-1, "keywords": string[]}],
  "metaphors": [{"source_domain": string, "target_domain": string, "examples": string[]}],
  "emotional_arc": {
    "overall_sentiment": -1 to 1,
    "trajectory": "declining|rising|stable|complex",
    "key_moments": [{"position": 0-1, "sentiment": -1 to 1, "intensity": 0-1}]
  },
  "objects_mentioned": [{"object": string, "category": string, "frequency": number, "context": string[]}],
  "temporal_markers": [{"type": string, "marker": string, "tense": string}]
}

Be precise, analytical, and sensitive to the nuances of grief narratives.`;

export async function analyzeStory(text: string): Promise<Partial<StoryAnalysis>> {
  if (!text || text.trim().length < 50) {
    throw new Error('Story text too short for analysis');
  }

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: ANALYST_SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this story about loss:\n\n${text}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temp for consistent analysis
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    
    // Validate structure
    const analysis = validateAnalysis(parsed);
    
    // Calculate overall sentiment score
    const sentiment_score = calculateSentimentScore(analysis.emotional_arc);

    return {
      themes: analysis.themes,
      metaphors: analysis.metaphors,
      emotional_arc: analysis.emotional_arc,
      objects_mentioned: analysis.objects_mentioned,
      temporal_markers: analysis.temporal_markers,
      sentiment_score,
      raw_analysis: parsed,
      analyzed_at: new Date().toISOString(),
    };

  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

function validateAnalysis(data: any): {
  themes: Theme[];
  metaphors: Metaphor[];
  emotional_arc: EmotionalArc;
  objects_mentioned: ObjectMention[];
  temporal_markers: TemporalMarker[];
} {
  // Basic validation - could be more robust
  return {
    themes: Array.isArray(data.themes) ? data.themes : [],
    metaphors: Array.isArray(data.metaphors) ? data.metaphors : [],
    emotional_arc: data.emotional_arc || { 
      overall_sentiment: 0, 
      trajectory: 'stable', 
      key_moments: [] 
    },
    objects_mentioned: Array.isArray(data.objects_mentioned) ? data.objects_mentioned : [],
    temporal_markers: Array.isArray(data.temporal_markers) ? data.temporal_markers : [],
  };
}

function calculateSentimentScore(arc: EmotionalArc): number {
  if (!arc.key_moments || arc.key_moments.length === 0) {
    return arc.overall_sentiment || 0;
  }
  
  // Weight recent moments more heavily
  const weightedSum = arc.key_moments.reduce((sum, moment, i) => {
    const recencyWeight = (i + 1) / arc.key_moments.length;
    return sum + (moment.sentiment * recencyWeight);
  }, 0);
  
  return weightedSum / arc.key_moments.length;
}

/**
 * Batch analyze multiple stories
 */
export async function batchAnalyze(
  stories: Array<{ id: string; text: string }>,
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, Partial<StoryAnalysis>>> {
  const results = new Map<string, Partial<StoryAnalysis>>();
  
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    
    try {
      const analysis = await analyzeStory(story.text);
      results.set(story.id, analysis);
      
      if (onProgress) {
        onProgress(i + 1, stories.length);
      }
      
      // Rate limiting: ~20 requests/min for GPT-4
      if (i < stories.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.error(`Failed to analyze story ${story.id}:`, error);
      // Continue with other stories
    }
  }
  
  return results;
}
