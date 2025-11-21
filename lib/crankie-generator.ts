/**
 * Crankie Panorama Generator - Create scrolling visual narratives
 */

import Replicate from 'replicate';
import { extractNarrativeBeats, beatToSDPrompt, type NarrativeBeat } from './narrative-beats';
import { getServiceSupabase } from './supabase';

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
 * Download image and upload to Supabase Storage for permanent storage
 */
async function saveImageToStorage(
  replicateUrl: string,
  storyId: string,
  sequence: number
): Promise<string> {
  try {
    // Download from Replicate
    const response = await fetch(replicateUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase Storage
    const filename = `crankie/${storyId}/scene-${sequence}.png`;
    const supabase = getServiceSupabase();
    
    const { data, error } = await supabase.storage
      .from('stories')
      .upload(filename, buffer, {
        contentType: 'image/png',
        cacheControl: '31536000', // 1 year
        upsert: true,
      });
    
    if (error) {
      console.error(`Failed to upload scene ${sequence}:`, error);
      return replicateUrl; // Fallback to Replicate URL
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('stories')
      .getPublicUrl(filename);
    
    return urlData.publicUrl;
    
  } catch (error) {
    console.error(`Error saving image ${sequence}:`, error);
    return replicateUrl; // Fallback to Replicate URL
  }
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
      console.log(`      PROMPT: ${prompt.substring(0, 100)}...`);
      
      try {
        const output = await getReplicate().run(
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          {
            input: {
              prompt,
              negative_prompt: "color, colorful, realistic, photograph, modern, text, words, faces, detailed faces, people with faces, logos, watermark, blurry, low quality, vertical composition, interior detail, linework, filigree, ornate patterns, decorative elements, shading, gradients, texture, fine details, complexity, elaborate designs",
              width: 1024,
              height: 768,
              num_outputs: 1,
              scheduler: "K_EULER",
              num_inference_steps: 30,
              guidance_scale: 10, // Higher = stricter prompt following (was 7.5)
              seed: 42, // Fixed seed for more consistent silhouette style
            }
          }
        );
        
        if (Array.isArray(output) && output.length > 0) {
          const replicateUrl = output[0] as string;
          console.log(`      ✅ Generated, saving to storage...`);
          
          // Save to Supabase Storage for permanent access
          const permanentUrl = await saveImageToStorage(replicateUrl, storyId, beat.sequence);
          
          scenes.push({
            sequence: beat.sequence,
            image_url: permanentUrl,
            beat,
          });
          console.log(`      💾 Saved permanently`);
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
