/**
 * Visual Generator - Stable Diffusion powered shadow puppet generation
 */

import Replicate from 'replicate';
import type { StoryAnalysis } from './corpus-types';

// Lazy-load Replicate client
let _replicate: Replicate | null = null;
function getReplicate(): Replicate {
  if (!_replicate) {
    _replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }
  return _replicate;
}

/**
 * Generate a shadow puppet prompt from story analysis
 */
export function constructShadowPuppetPrompt(analysis: Partial<StoryAnalysis>): string {
  const themes = analysis.themes?.slice(0, 2).map(t => t.name.replace(/_/g, ' ')) || [];
  const objects = analysis.objects_mentioned?.slice(0, 3).map(o => o.object) || [];
  const sentiment = analysis.sentiment_score || 0;
  
  // Determine mood descriptor
  let mood = 'contemplative';
  if (sentiment < -0.4) mood = 'melancholic';
  else if (sentiment < -0.2) mood = 'bittersweet';
  else if (sentiment > 0.1) mood = 'peaceful';
  
  // Build prompt
  const objectList = objects.length > 0 ? objects.join(', ') : 'abstract forms';
  const themeContext = themes.length > 0 ? themes.join(' and ') : 'memory';
  
  return `Intricate black paper-cut silhouette shadow puppet in the style of Lotte Reiniger, 
depicting ${objectList}, conveying themes of ${themeContext}, 
${mood} atmosphere, ornate decorative cutout patterns within the silhouette, 
theatrical composition suitable for shadow theater, high contrast black on warm sepia background, 
elegant filigree details, German expressionist aesthetic, professional shadow puppet art, 
no text, no people's faces visible, pure silhouette form`;
}

/**
 * Generate shadow puppet image using Stable Diffusion
 */
export async function generateShadowPuppet(
  analysis: Partial<StoryAnalysis>
): Promise<string | null> {
  try {
    const prompt = constructShadowPuppetPrompt(analysis);
    
    console.log('🎨 Generating shadow puppet...');
    console.log('   Prompt:', prompt.substring(0, 100) + '...');
    
    const output = await getReplicate().run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt,
          negative_prompt: "color, colorful, realistic, photograph, modern, text, words, faces, people, logos, watermark, blurry, low quality",
          width: 1024,
          height: 768,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        }
      }
    );
    
    // Output is an array of URLs
    if (Array.isArray(output) && output.length > 0) {
      console.log('   ✅ Generated:', output[0]);
      return output[0] as string;
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Shadow puppet generation failed:', error);
    return null;
  }
}

/**
 * Generate visuals for multiple stories
 */
export async function batchGenerateVisuals(
  analyses: Array<{ id: string; analysis: Partial<StoryAnalysis> }>,
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  for (let i = 0; i < analyses.length; i++) {
    const { id, analysis } = analyses[i];
    
    console.log(`\n📝 Generating visual ${i + 1}/${analyses.length} (story ${id.substring(0, 8)}...)`);
    
    try {
      const imageUrl = await generateShadowPuppet(analysis);
      
      if (imageUrl) {
        results.set(id, imageUrl);
        console.log(`   ✅ Success`);
      } else {
        console.log(`   ⚠️  No image generated`);
      }
      
      if (onProgress) {
        onProgress(i + 1, analyses.length);
      }
      
      // Small delay to avoid rate limits
      if (i < analyses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`   ❌ Failed:`, error);
    }
  }
  
  return results;
}
