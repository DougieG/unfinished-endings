#!/usr/bin/env tsx

/**
 * Generate Crankie Panoramas for Stories
 * Creates scrolling visual narratives
 */

import * as dotenv from 'dotenv';

// Load env vars FIRST
dotenv.config({ path: '.env.local' });
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { generateCrankiePanorama } from '../lib/crankie-generator';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('❌ Missing Replicate API token');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OpenAI API key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateCrankiesForCorpus() {
  console.log('🎬 Starting crankie panorama generation...\n');
  
  // Get corpus stories
  const { data: stories, error } = await supabase
    .from('stories_corpus')
    .select('*')
    .order('collected_at', { ascending: true });
  
  if (error || !stories) {
    console.error('❌ Failed to fetch stories:', error);
    return;
  }
  
  console.log(`📚 Found ${stories.length} stories in corpus\n`);
  
  // Check which already have crankies
  const { data: existing } = await supabase
    .from('generated_visuals')
    .select('story_id')
    .eq('generation_method', 'crankie_panorama');
  
  const existingIds = new Set(existing?.map(v => v.story_id) || []);
  const toGenerate = stories.filter(s => !existingIds.has(s.id));
  
  if (toGenerate.length === 0) {
    console.log('✅ All stories already have crankie panoramas!');
    return;
  }
  
  console.log(`🆕 Generating crankies for ${toGenerate.length} stories...\n`);
  console.log(`💰 Estimated cost: ~$${(toGenerate.length * 0.12).toFixed(2)} (${toGenerate.length} stories × ~6 scenes × $0.02)\n`);
  
  for (let i = 0; i < toGenerate.length; i++) {
    const story = toGenerate[i];
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📖 Story ${i + 1}/${toGenerate.length}: ${story.source} (${story.word_count} words)`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const startTime = Date.now();
    
    try {
      // Estimate duration (assume ~150 words/minute speaking pace)
      const estimatedDuration = Math.max((story.word_count / 150) * 60, 60);
      
      const panorama = await generateCrankiePanorama(
        story.id,
        story.cleaned_text || story.raw_text,
        estimatedDuration
      );
      
      if (!panorama) {
        console.log('   ⚠️  Failed to generate panorama\n');
        continue;
      }
      
      const generationTime = Date.now() - startTime;
      
      // Store in database
      const { error: insertError } = await supabase
        .from('generated_visuals')
        .insert({
          story_id: story.id,
          generation_method: 'crankie_panorama',
          composition: {
            panorama,
          },
          svg_cache: null,
          matched_patterns: [],
          symbols_used: [],
          generation_time_ms: generationTime,
        });
      
      if (insertError) {
        console.error('   ❌ Failed to store panorama:', insertError);
      } else {
        console.log(`   💾 Saved to database (${(generationTime / 1000).toFixed(1)}s total)\n`);
      }
      
      // Delay between stories
      if (i < toGenerate.length - 1) {
        console.log('   ⏸️  Waiting 5 seconds before next story...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (error) {
      console.error(`   ❌ Generation failed:`, error);
    }
  }
  
  console.log(`\n✨ Crankie generation complete!`);
  console.log(`   Generated: ${toGenerate.length} panoramas`);
  console.log(`\n🎭 View at: http://localhost:3000/demo-narrative\n`);
}

generateCrankiesForCorpus().catch(console.error);
