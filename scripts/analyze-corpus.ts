#!/usr/bin/env tsx

/**
 * Analyze Corpus Script
 * Run GPT-4 analysis on collected stories and extract patterns
 */

import * as dotenv from 'dotenv';

// Load env vars FIRST before any other imports
dotenv.config({ path: '.env.local' });
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { analyzeStory } from '../lib/corpus-analyzer';
import type { CorpusStory } from '../lib/corpus-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OpenAI API key');
  console.error('   Add OPENAI_API_KEY to your .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeCorpusStories() {
  console.log('🔬 Starting corpus analysis...\n');
  
  // Get unprocessed stories
  const { data: stories, error } = await supabase
    .from('stories_corpus')
    .select('*')
    .eq('processed', false)
    .order('collected_at', { ascending: true });
  
  if (error) {
    console.error('❌ Failed to fetch stories:', error);
    return;
  }
  
  if (!stories || stories.length === 0) {
    console.log('✅ No unprocessed stories found!');
    console.log('   All stories have been analyzed.\n');
    return;
  }
  
  console.log(`📊 Found ${stories.length} stories to analyze\n`);
  
  let analyzed = 0;
  let failed = 0;
  
  for (const story of stories) {
    console.log(`\n📝 Analyzing story from ${story.source} (${story.word_count} words)...`);
    
    try {
      // Analyze with GPT-4
      const analysis = await analyzeStory(story.cleaned_text || story.raw_text);
      
      // Store analysis
      const { error: analysisError } = await supabase
        .from('story_analysis')
        .insert({
          story_id: story.id,
          ...analysis
        });
      
      if (analysisError) {
        throw analysisError;
      }
      
      // Mark as processed
      await supabase
        .from('stories_corpus')
        .update({ processed: true })
        .eq('id', story.id);
      
      console.log(`   ✅ Analysis complete`);
      console.log(`      Themes: ${analysis.themes?.map(t => t.name).join(', ')}`);
      console.log(`      Objects: ${analysis.objects_mentioned?.length || 0}`);
      console.log(`      Sentiment: ${analysis.sentiment_score?.toFixed(2)}`);
      
      analyzed++;
      
      // Rate limiting (GPT-4: ~20 req/min)
      if (analyzed < stories.length) {
        console.log('   ⏳ Waiting 3 seconds (rate limit)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.error(`   ❌ Analysis failed:`, error);
      failed++;
    }
  }
  
  console.log(`\n✨ Batch analysis complete!`);
  console.log(`   Analyzed: ${analyzed} stories`);
  console.log(`   Failed: ${failed} stories`);
  
  if (analyzed > 0) {
    console.log(`\n📈 Extracting patterns...`);
    await extractPatterns();
  }
}

async function extractPatterns() {
  // Get all analyses
  const { data: analyses, error } = await supabase
    .from('story_analysis')
    .select('*');
  
  if (error || !analyses) {
    console.error('❌ Failed to fetch analyses:', error);
    return;
  }
  
  console.log(`   Analyzing ${analyses.length} stories...`);
  
  // Extract theme patterns
  const themeFrequency = new Map<string, { count: number; examples: string[] }>();
  const objectFrequency = new Map<string, { count: number; co_occurrences: Map<string, number> }>();
  const metaphorTypes = new Map<string, number>();
  
  for (const analysis of analyses) {
    // Count themes
    if (analysis.themes) {
      for (const theme of analysis.themes) {
        const current = themeFrequency.get(theme.name) || { count: 0, examples: [] };
        current.count++;
        if (current.examples.length < 5) {
          current.examples.push(analysis.story_id);
        }
        themeFrequency.set(theme.name, current);
      }
    }
    
    // Count objects and co-occurrences
    if (analysis.objects_mentioned) {
      const storyObjects = analysis.objects_mentioned.map((o: any) => o.object);
      
      for (const obj of analysis.objects_mentioned) {
        const objName = obj.object.toLowerCase();
        
        if (!objectFrequency.has(objName)) {
          objectFrequency.set(objName, { count: 0, co_occurrences: new Map() });
        }
        
        const objData = objectFrequency.get(objName)!;
        objData.count++;
        
        // Track co-occurrences
        for (const other of storyObjects) {
          if (other !== obj.object) {
            const otherName = other.toLowerCase();
            const currentCount = objData.co_occurrences.get(otherName) || 0;
            objData.co_occurrences.set(otherName, currentCount + 1);
          }
        }
      }
    }
    
    // Count metaphor types
    if (analysis.metaphors) {
      for (const metaphor of analysis.metaphors) {
        const key = `${metaphor.source_domain}→${metaphor.target_domain}`;
        metaphorTypes.set(key, (metaphorTypes.get(key) || 0) + 1);
      }
    }
  }
  
  // Store learned patterns
  console.log(`\n   📊 Pattern Summary:`);
  console.log(`   • ${themeFrequency.size} unique themes`);
  console.log(`   • ${objectFrequency.size} unique objects`);
  console.log(`   • ${metaphorTypes.size} metaphor types`);
  
  console.log(`\n   🔝 Top Themes:`);
  const sortedThemes = Array.from(themeFrequency.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  
  for (const [theme, data] of sortedThemes) {
    const frequency = data.count / analyses.length;
    console.log(`      ${theme}: ${data.count} (${(frequency * 100).toFixed(1)}%)`);
    
    // Store in database
    await supabase
      .from('learned_patterns')
      .upsert({
        pattern_type: 'theme',
        pattern_name: theme,
        pattern_data: { description: theme },
        occurrence_count: data.count,
        frequency,
        confidence: Math.min(frequency * 2, 1),
        example_story_ids: data.examples
      }, {
        onConflict: 'pattern_type,pattern_name'
      });
  }
  
  console.log(`\n   🔝 Top Objects:`);
  const sortedObjects = Array.from(objectFrequency.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15);
  
  for (const [object, data] of sortedObjects) {
    console.log(`      ${object}: ${data.count} occurrences`);
    
    // Convert co-occurrence map to object
    const coOccObj: Record<string, number> = {};
    data.co_occurrences.forEach((count, obj) => {
      coOccObj[obj] = count;
    });
    
    // Store visual symbol
    await supabase
      .from('visual_symbols')
      .upsert({
        symbol_name: object,
        category: categorizeObject(object),
        occurrence_count: data.count,
        priority_score: calculatePriority(data.count, analyses.length),
        co_occurrences: coOccObj,
        trigger_keywords: [object]
      }, {
        onConflict: 'symbol_name'
      });
  }
  
  console.log(`\n✅ Patterns extracted and stored!\n`);
}

function categorizeObject(obj: string): string {
  const categories: Record<string, string[]> = {
    'figure': ['hand', 'hands', 'finger', 'palm', 'body', 'face', 'figure', 'person'],
    'flora': ['tree', 'flower', 'garden', 'plant', 'branch', 'leaf', 'vine'],
    'object': ['clock', 'photograph', 'book', 'chair', 'coat', 'thread', 'box', 'drawer'],
    'frame': ['window', 'door', 'doorway', 'threshold', 'gate'],
    'creature': ['bird', 'butterfly', 'moth', 'crane']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => obj.toLowerCase().includes(kw))) {
      return category;
    }
  }
  
  return 'object';
}

function calculatePriority(count: number, total: number): number {
  const frequency = count / total;
  // Priority is frequency weighted by absolute count
  return Math.min((frequency * 100) + (Math.log(count + 1) * 10), 100);
}

analyzeCorpusStories().catch(console.error);
