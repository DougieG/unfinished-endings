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
  // Override any ornate descriptions with simple silhouette style
  const simplifiedDescription = beat.visual_description
    .replace(/ornate|intricate|detailed|elaborate|decorative|filigree/gi, 'simple')
    .replace(/pattern|texture|shading/gi, 'flat');
  
  return `SIMPLE BLACK SILHOUETTE CUTOUT ONLY, paper shadow puppet style,
showing: ${simplifiedDescription},
mood: ${beat.mood},
STYLE REQUIREMENTS (MANDATORY):
- SOLID BLACK SHAPES ONLY, completely flat, zero interior detail
- PURE WHITE BACKGROUND #FFFFFF, stark high contrast
- hard edges, hand-cut paper aesthetic
- ABSOLUTELY NO: interior linework, decorative patterns, filigree, ornate details
- minimal composition, 2-4 elements maximum
- clear instantly recognizable silhouette shapes
- simple handcrafted cutout paper style, like Chinese shadow puppets or Kara Walker
- layered flat black shapes on white
- horizontal panoramic theatrical composition
- no text, no faces with features, pure black exterior silhouettes only
- EXTREME HIGH CONTRAST black #000000 on white #FFFFFF
- like a stencil, logo, or rubber stamp, completely flat minimalist design`;
}
