import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * GET /api/admin/phone-audio
 * Get all phone audio configuration
 */
export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    const { data, error } = await supabase
      .from('phone_audio_config')
      .select('*')
      .order('config_key', { ascending: true });

    if (error) {
      console.error('Error fetching phone audio config:', error);
      return NextResponse.json(
        { error: 'Failed to fetch configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ configs: data || [] });
  } catch (error) {
    console.error('Error in GET phone audio config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/phone-audio
 * Upload new audio file and update configuration
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const configKey = formData.get('config_key') as string;
    const audioFile = formData.get('audio') as File;

    if (!configKey || !audioFile) {
      return NextResponse.json(
        { error: 'Missing config_key or audio file' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Upload audio file to Supabase Storage
    const filename = `phone-audio/${configKey}-${Date.now()}.mp3`;
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('stories')
      .upload(filename, buffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload audio file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('stories')
      .getPublicUrl(filename);

    const audioUrl = urlData.publicUrl;

    // Update configuration
    const { data: updateData, error: updateError } = await supabase
      .from('phone_audio_config')
      .update({ audio_url: audioUrl })
      .eq('config_key', configKey)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      config: updateData,
    });

  } catch (error) {
    console.error('Error in POST phone audio config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
