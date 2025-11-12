/**
 * Crankie Panorama Generator - Create scrolling visual narratives
 */

import Replicate from 'replicate';
import { extractNarrativeBeats, beatToSDPrompt, type NarrativeBeat } from './narrative-beats';

let _replicate: Replicate | null = null;
function getReplicate(): Replicate {
  if (!_replicate) {
    _replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }
  return _replicate;
}

export interface CrankieScene {
  sequence: number;
  image_url: string;
  beat: NarrativeBeat;
}

export interface CrankiePanorama {
  story_id: string;
  scenes: CrankieScene[];
  total_width: number;
  scroll_duration: number; // seconds
}

/**
 * Generate a complete crankie panorama for a story
 */
export async function generateCrankiePanorama(
  storyId: string,
  storyText: string,
  estimatedDuration: number = 165 // seconds
): Promise<CrankiePanorama | null> {
  try {
    console.log(`\n🎬 Generating crankie panorama for story ${storyId.substring(0, 8)}...`);
    
    // Step 1: Extract narrative beats
    console.log('   📖 Analyzing narrative structure...');
    const beats = await extractNarrativeBeats(storyText);
    
    if (beats.length === 0) {
      console.log('   ⚠️  No beats extracted');
      return null;
    }
    
    console.log(`   ✅ Found ${beats.length} narrative beats`);
    
    // Step 2: Generate image for each beat
    const scenes: CrankieScene[] = [];
    
    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      
      console.log(`\n   🎨 [${i + 1}/${beats.length}] Generating scene: "${beat.moment}"`);
      
      const prompt = beatToSDPrompt(beat);
      console.log(`      Mood: ${beat.mood} | Position: ${Math.round(beat.timestamp_percent * 100)}%`);
      
      try {
        const output = await getReplicate().run(
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          {
            input: {
              prompt,
              negative_prompt: "color, colorful, realistic, photograph, modern, text, words, faces, people, logos, watermark, blurry, low quality, vertical composition",
              width: 1024,
              height: 768,
              num_outputs: 1,
              scheduler: "K_EULER",
              num_inference_steps: 30,
              guidance_scale: 7.5,
            }
          }
        );
        
        if (Array.isArray(output) && output.length > 0) {
          const imageUrl = output[0] as string;
          scenes.push({
            sequence: beat.sequence,
            image_url: imageUrl,
            beat,
          });
          console.log(`      ✅ Generated`);
        } else {
          console.log(`      ⚠️  No image returned`);
        }
        
        // Rate limiting
        if (i < beats.length - 1) {
          console.log('      ⏳ Waiting 2s...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`      ❌ Failed:`, error);
      }
    }
    
    if (scenes.length === 0) {
      return null;
    }
    
    // Sort by sequence
    scenes.sort((a, b) => a.sequence - b.sequence);
    
    const panorama: CrankiePanorama = {
      story_id: storyId,
      scenes,
      total_width: scenes.length * 1024, // Each image is 1024px wide
      scroll_duration: estimatedDuration,
    };
    
    console.log(`\n   ✨ Crankie panorama complete!`);
    console.log(`      Scenes: ${scenes.length}`);
    console.log(`      Total width: ${panorama.total_width}px`);
    console.log(`      Duration: ${panorama.scroll_duration}s\n`);
    
    return panorama;
    
  } catch (error) {
    console.error('Crankie generation failed:', error);
    return null;
  }
}

/**
 * Get scroll position for a given time in the story
 */
export function getScrollPosition(
  panorama: CrankiePanorama,
  currentTime: number
): number {
  const progress = Math.min(currentTime / panorama.scroll_duration, 1);
  return progress * panorama.total_width;
}

/**
 * Get current scene based on playback time
 */
export function getCurrentScene(
  panorama: CrankiePanorama,
  currentTime: number
): CrankieScene | null {
  const progress = currentTime / panorama.scroll_duration;
  
  for (let i = 0; i < panorama.scenes.length; i++) {
    const scene = panorama.scenes[i];
    const nextScene = panorama.scenes[i + 1];
    
    if (!nextScene || progress < nextScene.beat.timestamp_percent) {
      return scene;
    }
  }
  
  return panorama.scenes[panorama.scenes.length - 1] || null;
}
