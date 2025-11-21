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

const BEAT_ANALYZER_PROMPT = `You are an expert at analyzing personal narratives and identifying key visual moments for shadow theater.

Analyze this story about loss and identify 5-7 KEY VISUAL MOMENTS that would work as scenes in a scrolling shadow puppet panorama (crankie theater).

For each moment, provide:
1. **sequence**: The order (1-7)
2. **moment**: Brief description of what happens in this beat
3. **visual_description**: Detailed description for a shadow puppet artist - what would be shown in this scene
4. **mood**: Single word emotional tone (melancholic, peaceful, tense, etc.)
5. **timestamp_percent**: Where in the story this occurs (0.0 = beginning, 1.0 = end)

Requirements:
- Start with an establishing scene (setting, atmosphere)
- Include 3-5 middle beats (key actions, objects, moments)
- End with a resolution or lingering image
- Each scene should be visually DISTINCT and CLEAR
- Think about paper-cut silhouettes - simple but evocative
- Focus on OBJECTS, GESTURES, and NEGATIVE SPACE (not faces)

Return ONLY valid JSON:
{
  "beats": [
    {
      "sequence": 1,
      "moment": "brief description",
      "visual_description": "detailed shadow puppet scene description",
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
 */
export function beatToSDPrompt(beat: NarrativeBeat): string {
  return `Simple black silhouette shadow puppet cutout scene,
${beat.visual_description},
${beat.mood} atmosphere,
flat solid black shapes only,
white background pure #FFFFFF,
hard edges with slight hand-cut irregularities,
no interior detail or linework,
no ornate patterns or filigree,
minimal surrounding characters and elements,
instantly recognizable shapes readable from a distance,
simple handcrafted paper cutout aesthetic,
layered flat shapes,
horizontal panoramic composition suitable for crankie theater,
no text, no realistic faces, pure exterior silhouettes only,
high contrast black #000000 on white #FFFFFF`;
}
