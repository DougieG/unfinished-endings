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

const BEAT_ANALYZER_PROMPT = `You are an expert at analyzing personal narratives and identifying key visual moments for ULTRA-MINIMAL children's shadow puppet theater.

Analyze this story about loss and identify 5-7 KEY VISUAL MOMENTS that would work as scenes in a scrolling shadow puppet panorama (crankie theater).

CRITICAL AESTHETIC CONSTRAINTS:
- Think like a 5-10 year old cutting shapes from black cardboard with safety scissors
- EXTREMELY SIMPLE: chunky limbs, blocky heads, rounded or triangular bodies
- Only 2-4 shapes per scene maximum (tree, person, moon, house)
- NO interior details, NO decorative elements, NO ornate designs
- NO filigree, NO texturing, NO lacework, NO complex costumes
- Simple geometry only: circles, triangles, rectangles, basic curves
- Props must be iconic silhouettes: one tree, one moon, one hill
- Hand-cut, imperfect feeling - NOT professional illustration quality

For each moment, provide:
1. **sequence**: The order (1-7)
2. **moment**: Brief description of what happens in this beat
3. **visual_description**: ULTRA-SIMPLE description - describe 2-4 basic BLACK SHAPES ONLY (e.g., "chunky figure standing by round moon", "blocky house with triangular roof", "simple tree with rounded crown next to square figure")
4. **mood**: Single word emotional tone (melancholic, peaceful, tense, etc.)
5. **timestamp_percent**: Where in the story this occurs (0.0 = beginning, 1.0 = end)

Requirements:
- Start with an establishing scene (setting, atmosphere)
- Include 3-5 middle beats (key actions, objects, moments)
- End with a resolution or lingering image
- Each scene = 2-4 CHUNKY BLACK SHAPES, spaced clearly
- Focus on BASIC SILHOUETTES: head shapes, body shapes, simple props
- Think cardboard cutouts taped to chopsticks, NOT professional shadow puppets

Return ONLY valid JSON:
{
  "beats": [
    {
      "sequence": 1,
      "moment": "brief description",
      "visual_description": "ultra-simple shadow puppet scene with 2-4 basic shapes",
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
  
  return `Ultra-minimal handmade shadow puppets on a backlit paper screen. 
All characters and objects are solid black silhouettes with no internal details,
as if cut roughly from cardboard by a child. Thick, simple, blocky shapes.
Imperfect hand-cut edges. Figures on thin stick rods. 

Showing: ${simplifiedDescription}
Mood: ${beat.mood}

The scene should look like a small DIY puppet theater: 
a softly glowing white parchment backdrop, subtle falloff, no gradients, 
no textures, no shading, no complexity. 
Only 2–4 silhouettes per scene, spaced clearly, extremely simple. 
Props and scenery must be basic silhouettes: a round moon, a single tree,
a hill, a house shape, a simple animal. 
No decorative elements. No ornate puppet styles. 
Everything must read as basic paper cutouts placed in front of light.`;
}
