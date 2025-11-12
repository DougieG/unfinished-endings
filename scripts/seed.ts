#!/usr/bin/env tsx

/**
 * Seed script for Unfinished Endings
 * Adds 8-12 preloaded stories to the archive
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample story transcripts (placeholders - replace with real audio)
const STORIES = [
  {
    transcript: "I found my grandmother's sewing box after she passed. Inside was a single red thread wound around a spool, and a note that just said 'unfinished.' I still don't know what she meant to make.",
    keywords: ['thread', 'sewing', 'grandmother', 'red', 'unfinished', 'note'],
    duration_s: 23,
  },
  {
    transcript: "Every morning my father would stand at the kitchen window with his coffee. After he died, I realized he wasn't looking at anything in particular. He was just... standing. I do it now too.",
    keywords: ['window', 'father', 'morning', 'coffee', 'ritual', 'standing'],
    duration_s: 28,
  },
  {
    transcript: "She kept a drawer full of hotel soap bars. Hundreds of them. We threw them all away when she moved to hospice. I wish I'd kept just one.",
    keywords: ['drawer', 'soap', 'hotel', 'hospice', 'collection', 'regret'],
    duration_s: 18,
  },
  {
    transcript: "I still have his voicemail saved. 'Hey, it's me. Call me back.' He never got to tell me why he called. It's been three years.",
    keywords: ['voicemail', 'call', 'phone', 'voice', 'saved', 'waiting'],
    duration_s: 16,
  },
  {
    transcript: "We used to fold paper cranes together when I was small. She told me if I made a thousand, I could make a wish. I stopped at nine hundred and ninety-nine.",
    keywords: ['crane', 'paper', 'wish', 'folding', 'tradition', 'incomplete'],
    duration_s: 25,
  },
  {
    transcript: "His coat still hangs in the hall closet. Sometimes I press my face into it, but it doesn't smell like him anymore. Just dust and time.",
    keywords: ['coat', 'closet', 'smell', 'memory', 'fading', 'presence'],
    duration_s: 20,
  },
  {
    transcript: "She planted a garden every spring. Tomatoes, mostly. This year they grew without her, wild and tangled. I couldn't bring myself to pick them.",
    keywords: ['garden', 'tomatoes', 'spring', 'wild', 'growth', 'untended'],
    duration_s: 22,
  },
  {
    transcript: "I found a photograph of us at the beach, but I can't remember the day. Was I seven? Eight? Did we have ice cream? Why can't I remember?",
    keywords: ['photograph', 'beach', 'memory', 'forgotten', 'childhood', 'ice cream'],
    duration_s: 21,
  },
  {
    transcript: "Every year on her birthday, a bouquet of white lilies arrives at my door. No card. No sender. It's been five years and I still don't know who sends them.",
    keywords: ['lilies', 'flowers', 'birthday', 'mystery', 'ritual', 'white'],
    duration_s: 24,
  },
  {
    transcript: "He taught me to tie my shoes when I was four. Loop, swoop, and pull. I taught my daughter the same way. He never got to meet her.",
    keywords: ['shoes', 'teaching', 'daughter', 'loop', 'connection', 'absence'],
    duration_s: 19,
  },
];

async function createDummyAudio(duration: number): Promise<Buffer> {
  // Create a minimal silent WAV file (44.1kHz, 16-bit, mono)
  const sampleRate = 44100;
  const samples = sampleRate * duration;
  const dataSize = samples * 2; // 16-bit = 2 bytes per sample
  
  const buffer = Buffer.alloc(44 + dataSize);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20);  // audio format (1 = PCM)
  buffer.writeUInt16LE(1, 22);  // number of channels
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);  // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Silent audio data (zeros)
  buffer.fill(0, 44);
  
  return buffer;
}

async function seed() {
  console.log('🌱 Starting seed...\n');

  for (let i = 0; i < STORIES.length; i++) {
    const story = STORIES[i];
    
    console.log(`📝 Creating story ${i + 1}/${STORIES.length}...`);

    try {
      // Create dummy audio file
      const audioBuffer = await createDummyAudio(story.duration_s);
      const filename = `seed-story-${i + 1}.wav`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filename, audioBuffer, {
          contentType: 'audio/wav',
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error(`   ❌ Upload failed: ${uploadError.message}`);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('stories')
        .getPublicUrl(uploadData.path);

      // Insert story record
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          source: 'preload',
          audio_url: urlData.publicUrl,
          duration_s: story.duration_s,
          transcript: story.transcript,
          keywords: story.keywords,
          consent: true,
        });

      if (insertError) {
        console.error(`   ❌ Insert failed: ${insertError.message}`);
        continue;
      }

      console.log(`   ✅ Story ${i + 1} created successfully`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`   ❌ Error: ${error}`);
    }
  }

  console.log('\n✨ Seed complete!');
  console.log(`\nCreated ${STORIES.length} stories in the archive.`);
  console.log('Note: Audio files are silent placeholders. Replace with real recordings.\n');
}

seed().catch(console.error);
