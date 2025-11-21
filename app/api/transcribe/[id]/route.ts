import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { extractKeywordsWithAI } from '@/lib/keywords';
import { generateCrankiePanorama } from '@/lib/crankie-generator';
import { createTask, updateTaskProgress, completeTask, calculateProgress } from '@/lib/task-progress';
import { OpenAI } from 'openai';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const taskId = createTask(params.id);
  
  try {
    const { id } = params;

    if (!process.env.OPENAI_API_KEY) {
      completeTask(taskId, 'OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const supabase = getServiceSupabase();
    
    updateTaskProgress(taskId, {
      status: 'transcribing',
      currentStep: 'Downloading audio file...',
      progress: 5,
      currentStepIndex: 0,
      totalSteps: 8, // download, transcribe, keywords, beats, 4-6 images (avg)
    });

    // Fetch story
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !story) {
      completeTask(taskId, 'Story not found');
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
    
    updateTaskProgress(taskId, {
      currentStep: 'Transcribing audio with Whisper...',
      progress: 15,
      currentStepIndex: 1,
    });

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
    
    updateTaskProgress(taskId, {
      currentStep: 'Extracting keywords...',
      progress: 35,
      currentStepIndex: 2,
    });

    // Extract keywords
    const keywords = await extractKeywordsWithAI(
      transcript,
      process.env.OPENAI_API_KEY
    );
    
    updateTaskProgress(taskId, {
      currentStep: 'Analyzing narrative structure...',
      progress: 50,
      currentStepIndex: 3,
    });

    // Generate crankie panorama (multi-frame sequence)
    let panorama: any = null;
    try {
      if (process.env.REPLICATE_API_TOKEN) {
        updateTaskProgress(taskId, {
          status: 'generating_images',
          currentStep: 'Generating shadow puppet scenes...',
          progress: 60,
          currentStepIndex: 4,
        });
        
        console.log('🎨 Generating crankie panorama (5-7 scenes)...');
        panorama = await generateCrankiePanorama(
          id,
          transcript,
          story.duration_s || 165
        );
        if (panorama) {
          console.log(`✅ Crankie panorama generated: ${panorama.scenes.length} scenes`);
          updateTaskProgress(taskId, {
            currentStep: 'Saving panorama...',
            progress: 90,
            currentStepIndex: 7,
          });
        }
      } else {
        console.log('⚠️ Replicate API token not configured, skipping visual generation');
        updateTaskProgress(taskId, {
          currentStep: 'Skipping visual generation (no API token)...',
          progress: 90,
          currentStepIndex: 7,
        });
      }
    } catch (visualError) {
      console.error('⚠️ Crankie generation failed (continuing anyway):', visualError);
      updateTaskProgress(taskId, {
        currentStep: 'Visual generation failed, saving text only...',
        progress: 85,
      });
      // Don't fail the whole process if visual generation fails
    }

    // Update story with transcript, keywords, and panorama
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        transcript,
        keywords,
        panorama,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
      completeTask(taskId, 'Failed to update story');
      return NextResponse.json(
        { error: 'Failed to update story' },
        { status: 500 }
      );
    }
    
    completeTask(taskId);

    return NextResponse.json({
      success: true,
      taskId,
      transcript,
      keywords,
      panorama,
    });

  } catch (error) {
    console.error('Error in transcription:', error);
    completeTask(taskId, 'Transcription failed: ' + (error as Error).message);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
