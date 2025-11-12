#!/usr/bin/env tsx

/**
 * Corpus Collection Script
 * Gathers loss narratives from various sources
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample stories for initial seeding
// In production, these would come from APIs, web scraping, etc.
const SAMPLE_CORPUS_STORIES = [
  {
    source: 'modernloss',
    text: `Every morning my father stood at the kitchen window with his coffee. I never asked why. 
    After he died, I realized he wasn't looking at anything in particular. He was just standing. 
    Standing in the morning light, holding his mug, being present for a few quiet minutes before 
    the day began. Now I do it too. I stand at my kitchen window, coffee in hand, looking at nothing, 
    thinking of everything. It's the only time I feel close to him.`,
    metadata: { year: 2019, theme: 'inherited_ritual' }
  },
  
  {
    source: 'submission',
    text: `I found my grandmother's sewing box after she passed. Inside was a single red thread 
    wound around a wooden spool, and a note that just said "unfinished." I still don't know what 
    she meant to make. The thread is too delicate to use now, too precious to throw away. 
    Sometimes I hold it up to the light and try to imagine: a dress? A quilt square? A bookmark? 
    The not-knowing is its own kind of loss.`,
    metadata: { relationship: 'grandmother', object: 'thread' }
  },
  
  {
    source: 'reddit',
    text: `She kept a drawer full of hotel soap bars. Hundreds of them. Little wrapped rectangles from 
    every trip they ever took together. When she moved to hospice, my father and I sorted through 
    the house. We threw them all away—it felt wrong to keep them, wrong to use them. I wish I'd 
    kept just one. Any one. Something small and ordinary that held their whole life together.`,
    metadata: { object: 'soap', relationship: 'mother' }
  },
  
  {
    source: 'storycorps',
    text: `We used to fold paper cranes together when I was small. She told me if I made a thousand, 
    I could make a wish. We got to nine hundred ninety-nine before she got too sick to fold anymore. 
    I never made the thousandth one. It felt like it should be hers to fold. The box of 999 cranes 
    sits in my closet. Sometimes I think about finishing them. Sometimes I think the incompleteness 
    is the point.`,
    metadata: { activity: 'paper_cranes', number: 999 }
  },
  
  {
    source: 'moth',
    text: `His coat still hangs in the hall closet. Three years later and I can't move it. 
    Sometimes I press my face into the wool and breathe in, but it doesn't smell like him anymore. 
    Just dust and mothballs and time. My wife says I should donate it. She's right. But removing 
    that coat feels like removing him all over again, and I've already done that once. I can't do it twice.`,
    metadata: { object: 'coat', years_since: 3 }
  },
  
  {
    source: 'modernloss',
    text: `She planted a garden every spring. Tomatoes mostly, but also zucchini, basil, those tiny 
    cherry peppers. This year they grew without her, wild and tangled and everywhere. I couldn't 
    bring myself to pick them. Couldn't bear to weed or prune or tend. I just let the garden do 
    what it wanted. In August the tomatoes split on the vine, too ripe, too heavy, bursting with 
    life she'll never taste.`,
    metadata: { season: 'summer', object: 'garden' }
  },
  
  {
    source: 'submission',
    text: `I found a photograph of us at the beach. I must have been seven, maybe eight. We're both 
    squinting in the sun, salt in our hair, sand between our toes. But I can't remember the day. 
    Was it Jersey? The Cape? Did we have ice cream after? Did we find shells? Why can't I remember? 
    The photo is proof we were there, together, happy. But the memory is gone, and now so is she, 
    and all I have is this small rectangle of fading paper.`,
    metadata: { object: 'photograph', age: 7 }
  },
  
  {
    source: 'reddit',
    text: `Every year on her birthday, a bouquet of white lilies arrives at my door. No card. No sender. 
    It's been five years and I still don't know who sends them. Her sister denies it. Her college 
    roommate says it wasn't her. I've checked my bank statements—I'm not paying for them. They just 
    arrive, every April 3rd, a mystery wrapped in white petals and ribbon. I used to want to solve it. 
    Now I'm afraid of the answer.`,
    metadata: { flowers: 'lilies', years: 5, mystery: true }
  },
  
  {
    source: 'storycorps',
    text: `He taught me to tie my shoes when I was four. Loop, swoop, and pull. I taught my daughter 
    the same way. Same words, same rhythm, same patient repetition. She's got it now, her small 
    fingers making the bunny ears, pulling them tight. He never got to meet her. She'll never know 
    the man who taught me this small, essential thing. But every time she ties her shoes, he's there. 
    Loop, swoop, and pull.`,
    metadata: { teaching: 'shoe_tying', grandchild: true }
  },
  
  {
    source: 'moth',
    text: `The last thing she said to me was "see you tomorrow." Just like every other day. See you 
    tomorrow. But there was no tomorrow. I didn't know those would be the last words. If I'd known, 
    I would have said more. I would have said everything. Instead I said "yeah, see you tomorrow" 
    and walked out the door. Those ordinary words haunt me now. The perfect useless promise of tomorrow.`,
    metadata: { last_words: 'see you tomorrow', sudden: true }
  }
];

async function collectCorpus() {
  console.log('📚 Starting corpus collection...\n');
  
  let added = 0;
  let skipped = 0;
  
  for (const story of SAMPLE_CORPUS_STORIES) {
    try {
      const word_count = story.text.split(/\s+/).length;
      
      const { data, error } = await supabase
        .from('stories_corpus')
        .insert({
          source: story.source,
          raw_text: story.text,
          cleaned_text: story.text.trim(),
          word_count,
          metadata: story.metadata,
          processed: false
        })
        .select()
        .single();
      
      if (error) {
        if (error.message.includes('duplicate')) {
          console.log(`   ⏭️  Skipped: ${story.source} (already exists)`);
          skipped++;
        } else {
          console.error(`   ❌ Error: ${error.message}`);
        }
        continue;
      }
      
      console.log(`   ✅ Added: ${story.source} (${word_count} words)`);
      added++;
      
    } catch (error) {
      console.error(`   ❌ Failed to add story:`, error);
    }
  }
  
  console.log(`\n✨ Collection complete!`);
  console.log(`   Added: ${added} stories`);
  console.log(`   Skipped: ${skipped} stories`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Run: npm run analyze-corpus`);
  console.log(`   2. Review patterns in database`);
  console.log(`   3. Expand corpus with more sources\n`);
}

// Additional helper functions for future expansion

/**
 * Placeholder for Reddit scraping
 * Would use Reddit API to fetch stories from r/GriefSupport, etc.
 */
async function scrapeReddit(subreddit: string, limit: number = 50) {
  console.log(`📡 Scraping r/${subreddit} (placeholder)...`);
  // Implementation would use Reddit API
  // Filter for stories 100-500 words
  // Check for personal narrative markers
  return [];
}

/**
 * Placeholder for StoryCorps API
 * Would fetch transcripts tagged with loss/memory
 */
async function fetchStoryCorps(query: string) {
  console.log(`📡 Fetching StoryCorps: "${query}" (placeholder)...`);
  // Implementation would use StoryCorps API if available
  // Or web scraping with permission
  return [];
}

/**
 * Placeholder for Modern Loss scraping
 * Would scrape with permission or use RSS feed
 */
async function scrapeModernLoss() {
  console.log(`📡 Scraping Modern Loss (placeholder)...`);
  // Implementation would respect robots.txt
  // Or work with Modern Loss team for access
  return [];
}

collectCorpus().catch(console.error);
