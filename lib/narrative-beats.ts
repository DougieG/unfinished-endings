/**
 * Narrative Beat Analyzer - Extract visual moments from stories
 */

import OpenAI from 'openai';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

export interface NarrativeBeat {
  sequence: number;
  moment: string;
  visual_description: string;
  mood: string;
  timestamp_percent: number; // 0.0 to 1.0 (where in story this occurs)
}

const BEAT_ANALYZER_PROMPT = `You are an expert at analyzing personal narratives and identifying key visual moments for MINIMAL shadow puppet theater that tells a clear story.

Analyze this story about loss and identify 5-7 KEY VISUAL MOMENTS that would work as scenes in a scrolling shadow puppet panorama (crankie theater).

CRITICAL: Each scene must CLEARLY REPRESENT THE STORY while using simple shapes.

For each moment, provide:
1. **sequence**: The order (1-7)
2. **moment**: Brief description of what happens in this beat
3. **visual_description**: Describe 2-4 simple BLACK SILHOUETTE SHAPES that CLEARLY SHOW THIS SPECIFIC STORY MOMENT
   - Be SPECIFIC to the story content (actual objects, people, actions from THIS narrative)
   - Use simple geometric descriptions BUT make them story-relevant
   - Examples: 
     * "Figure holding coffee cup at window, morning light behind"
     * "Empty wheelchair beside bed, walking cane leaning against wall"
     * "Two hands reaching toward each other, small gap between"
     * "Person kneeling by garden with single flower growing"

4. **mood**: Single word emotional tone (melancholic, peaceful, tense, etc.)
5. **timestamp_percent**: Where in the story this occurs (0.0 = beginning, 1.0 = end)

AESTHETIC CONSTRAINTS (apply to description):
- Simple chunky silhouette shapes (no fine details)
- 2-4 main shapes per scene maximum
- Props should be recognizable but simple (chair, cup, window, tree, etc.)
- Think cardboard cutouts - but STORY-SPECIFIC cardboard cutouts

Requirements:
- Start with an establishing scene (WHERE and WHAT)
- Include 3-5 middle beats (KEY OBJECTS, ACTIONS, RELATIONSHIPS from the story)
- End with a resolution image
- Each scene must be INSTANTLY RECOGNIZABLE as depicting THIS SPECIFIC STORY
- Balance simplicity with narrative clarity

Return ONLY valid JSON:
{
  "beats": [
    {
      "sequence": 1,
      "moment": "brief description of story event",
      "visual_description": "2-4 simple shapes that show this specific moment",
      "mood": "word",
      "timestamp_percent": 0.0
    }
  ]
}`;

export async function extractNarrativeBeats(storyText: string): Promise<NarrativeBeat[]> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: BEAT_ANALYZER_PROMPT },
        { role: 'user', content: `Analyze this story:\n\n${storyText}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    
    return parsed.beats || [];
    
  } catch (error) {
    console.error('Beat extraction failed:', error);
    return [];
  }
}

/**
 * Generate Stable Diffusion prompts from narrative beats
 * Updated with production-ready shadow puppet specifications
 */
export function beatToSDPrompt(beat: NarrativeBeat): string {
  // Simplify description to eliminate any complex/ornate language
  const simplifiedDescription = beat.visual_description
    .replace(/ornate|intricate|detailed|elaborate|decorative|filigree/gi, 'simple')
    .replace(/pattern|texture|shading/gi, 'flat')
    .replace(/complex|rich|delicate/gi, 'basic');
  
  return `Shadow puppet scene showing: ${simplifiedDescription}

STORY MOOD: ${beat.mood}

VISUAL STYLE (apply to above scene):
Simple black cardboard cutout silhouettes on backlit white screen.
Hand-cut paper puppet aesthetic - chunky blocky shapes like a child's craft project.
2-4 solid black shapes, clearly recognizable, storytelling through simple forms.
Imperfect hand-cut edges, figures on thin rods visible.
White glowing backdrop, high contrast, no internal details or decorative patterns.
Focus: Clear visual storytelling with minimal geometric shapes that convey the narrative moment.`;
}
