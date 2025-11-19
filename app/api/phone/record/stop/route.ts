import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * POST /api/phone/record/stop
 * 
 * Stop recording and save to database
 * Body: { sessionId: string, blob: File }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const audioBlob = formData.get('audio') as File;

    if (!sessionId || !audioBlob) {
      return NextResponse.json(
        { error: 'Missing session ID or audio data' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Upload audio file
    const filename = `phone-${sessionId}.webm`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('stories')
      .upload(filename, audioBlob, {
        contentType: audioBlob.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading audio:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload audio' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('stories')
      .getPublicUrl(filename);

    // Calculate duration (approximate from blob size)
    const durationS = Math.floor(audioBlob.size / 16000); // ~16KB per second for webm

    // Save to database
    const { data: story, error: dbError } = await supabase
      .from('stories')
      .insert({
        source: 'interior', // Phone 1 is interior line
        duration_s: durationS,
        audio_url: publicUrl,
        consent: true, // Auto-approve for installation (add moderation later if needed)
        play_count: 0,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving story:', dbError);
      return NextResponse.json(
        { error: 'Failed to save story' },
        { status: 500 }
      );
    }

    console.log(`[Phone Recording] Saved story ${story.id} (${durationS}s)`);

    return NextResponse.json({
      id: story.id,
      duration_s: durationS,
      audio_url: publicUrl,
    });

  } catch (error) {
    console.error('Error stopping phone recording:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
