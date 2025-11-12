import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAudioDuration } from '@/lib/audio';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${audioFile.name || 'recording.webm'}`;

    // Upload to Supabase Storage
    const arrayBuffer = await audioFile.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('stories')
      .upload(filename, arrayBuffer, {
        contentType: audioFile.type || 'audio/webm',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload audio' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('stories')
      .getPublicUrl(uploadData.path);

    // Get audio duration (optional - can be calculated later)
    let duration: number | null = null;
    try {
      const blob = new Blob([arrayBuffer], { type: audioFile.type });
      duration = await getAudioDuration(blob);
    } catch (err) {
      console.warn('Could not calculate duration:', err);
    }

    // Insert story record
    const { data: story, error: insertError } = await supabase
      .from('stories')
      .insert({
        source: 'interior',
        audio_url: urlData.publicUrl,
        duration_s: duration,
        consent: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save story' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: story.id,
      audio_url: story.audio_url,
    });

  } catch (error) {
    console.error('Error in POST /api/stories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .eq('consent', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stories });

  } catch (error) {
    console.error('Error in GET /api/stories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
