import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { clearAudioConfigCache } from '@/lib/phone-audio-config';

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
    const contentType = request.headers.get('content-type');
    
    // Handle JSON request (metadata update only)
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      const { config_key, metadata } = body;
      
      if (!config_key) {
        return NextResponse.json({ error: 'config_key required' }, { status: 400 });
      }
      
      const supabase = getServiceSupabase();
      const { error } = await supabase
        .from('phone_audio_config')
        .update({ metadata, updated_at: new Date().toISOString() })
        .eq('config_key', config_key);
      
      if (error) throw error;
      
      clearAudioConfigCache();
      return NextResponse.json({ success: true });
    }
    
    // Handle multipart form data (file upload)
    const formData = await request.formData();
    const file = (formData.get('audio') || formData.get('file')) as File;
    const configKey = formData.get('config_key') as string;

    if (!file || !configKey) {
      return NextResponse.json(
        { error: 'File and config_key are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Upload audio file to Supabase Storage
    const filename = `phone-audio/${configKey}-${Date.now()}.mp3`;
    const arrayBuffer = await file.arrayBuffer();
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
    
    // Clear cache so new audio is used immediately
    clearAudioConfigCache();

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

/**
 * DELETE /api/admin/phone-audio?config_key=xxx
 * Delete audio file and reset configuration to default
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configKey = searchParams.get('config_key');

    if (!configKey) {
      return NextResponse.json(
        { error: 'config_key is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get current config to find the audio file to delete
    const { data: currentConfig } = await supabase
      .from('phone_audio_config')
      .select('audio_url')
      .eq('config_key', configKey)
      .single();

    // Extract filename from URL and delete from storage if it exists
    if (currentConfig?.audio_url) {
      const url = new URL(currentConfig.audio_url);
      const pathParts = url.pathname.split('/');
      const filename = pathParts.slice(-2).join('/'); // Get 'phone-audio/filename.mp3'
      
      if (filename.startsWith('phone-audio/')) {
        await supabase.storage
          .from('stories')
          .remove([filename]);
      }
    }

    // Reset to empty/default state (you may want to set a default URL here)
    const { error: updateError } = await supabase
      .from('phone_audio_config')
      .update({ 
        audio_url: '',
        updated_at: new Date().toISOString() 
      })
      .eq('config_key', configKey);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to reset configuration' },
        { status: 500 }
      );
    }

    // Clear cache
    clearAudioConfigCache();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE phone audio config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
