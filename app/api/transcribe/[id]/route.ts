import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { extractKeywordsWithAI } from '@/lib/keywords';
import { generateShadowPuppet } from '@/lib/visual-generator';
import { OpenAI } from 'openai';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const supabase = getServiceSupabase();

    // Fetch story
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Download audio file
    const audioResponse = await fetch(story.audio_url);
    if (!audioResponse.ok) {
      throw new Error('Failed to download audio');
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Transcribe with Whisper
    const audioFile = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' });
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    });

    const transcript = transcription.text;

    // Extract keywords
    const keywords = await extractKeywordsWithAI(
      transcript,
      process.env.OPENAI_API_KEY
    );

    // Generate shadow puppet visual using Stable Diffusion
    let visualUrl: string | null = null;
    try {
      if (process.env.REPLICATE_API_TOKEN) {
        console.log('🎨 Generating shadow puppet visual...');
        // Create a simple analysis object from keywords
        const analysis = {
          objects_mentioned: keywords.slice(0, 3).map(k => ({ 
            object: k,
            category: 'object' as const,
            frequency: 1,
            context: []
          })),
          sentiment_score: 0, // Neutral default
        };
        visualUrl = await generateShadowPuppet(analysis);
        if (visualUrl) {
          console.log('✅ Visual generated:', visualUrl);
        }
      } else {
        console.log('⚠️ Replicate API token not configured, skipping visual generation');
      }
    } catch (visualError) {
      console.error('⚠️ Visual generation failed (continuing anyway):', visualError);
      // Don't fail the whole process if visual generation fails
    }

    // Update story with transcript, keywords, and visual
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        transcript,
        keywords,
        visual_url: visualUrl,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update story' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transcript,
      keywords,
      visual_url: visualUrl,
    });

  } catch (error) {
    console.error('Error in transcription:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
