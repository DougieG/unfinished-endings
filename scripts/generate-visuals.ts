#!/usr/bin/env tsx

/**
 * Generate AI Shadow Puppets
 * Uses Stable Diffusion to create visuals for analyzed stories
 */

import * as dotenv from 'dotenv';

// Load env vars FIRST
dotenv.config({ path: '.env.local' });
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { generateShadowPuppet, batchGenerateVisuals } from '../lib/visual-generator';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('❌ Missing Replicate API token');
  console.error('   Get one at: https://replicate.com/account/api-tokens');
  console.error('   Add to .env.local: REPLICATE_API_TOKEN=r8_...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateVisualsForCorpus() {
  console.log('🎨 Starting visual generation with Stable Diffusion...\n');
  
  // Get analyzed stories
  const { data: analyses, error } = await supabase
    .from('story_analysis')
    .select('*')
    .order('analyzed_at', { ascending: true });
  
  if (error) {
    console.error('❌ Failed to fetch analyses:', error);
    return;
  }
  
  if (!analyses || analyses.length === 0) {
    console.log('⚠️  No analyzed stories found!');
    console.log('   Run: npm run analyze-corpus');
    return;
  }
  
  console.log(`📊 Found ${analyses.length} analyzed stories\n`);
  console.log('💰 Cost estimate: ~$${(analyses.length * 0.02).toFixed(2)} for ${analyses.length} images\n');
  
  // Check which already have visuals
  const { data: existing } = await supabase
    .from('generated_visuals')
    .select('story_id');
  
  const existingIds = new Set(existing?.map(v => v.story_id) || []);
  const toGenerate = analyses.filter(a => !existingIds.has(a.story_id));
  
  if (toGenerate.length === 0) {
    console.log('✅ All stories already have generated visuals!');
    return;
  }
  
  console.log(`🆕 Generating visuals for ${toGenerate.length} new stories...\n`);
  
  for (let i = 0; i < toGenerate.length; i++) {
    const analysis = toGenerate[i];
    
    console.log(`\n[${i + 1}/${toGenerate.length}] Generating visual for story ${analysis.story_id.substring(0, 8)}...`);
    
    const startTime = Date.now();
    
    try {
      const imageUrl = await generateShadowPuppet(analysis);
      
      if (!imageUrl) {
        console.log('   ⚠️  No image generated');
        continue;
      }
      
      const generationTime = Date.now() - startTime;
      
      // Store in database
      const { error: insertError } = await supabase
        .from('generated_visuals')
        .insert({
          story_id: analysis.story_id,
          generation_method: 'ai_generated',
          composition: {
            image_url: imageUrl,
            prompt: analysis.themes,
            objects: analysis.objects_mentioned,
          },
          svg_cache: null,
          matched_patterns: analysis.themes?.map((t: any) => t.name) || [],
          symbols_used: analysis.objects_mentioned?.map((o: any) => o.object) || [],
          generation_time_ms: generationTime,
        });
      
      if (insertError) {
        console.error('   ❌ Failed to store visual:', insertError);
      } else {
        console.log(`   ✅ Saved to database (${(generationTime / 1000).toFixed(1)}s)`);
      }
      
      // Small delay between generations
      if (i < toGenerate.length - 1) {
        console.log('   ⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`   ❌ Generation failed:`, error);
    }
  }
  
  console.log(`\n✨ Visual generation complete!`);
  console.log(`   Generated: ${toGenerate.length} new visuals`);
  console.log(`\n📷 View at: http://localhost:3000/demo-narrative\n`);
}

generateVisualsForCorpus().catch(console.error);
