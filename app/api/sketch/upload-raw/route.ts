/**
 * ULTRA SIMPLE - Just upload the raw image, no processing
 * POST /api/sketch/upload-raw
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Raw upload started (NO PROCESSING)');
    
    const formData = await request.formData();
    const file = formData.get('form_image') as File;
    const title = (formData.get('title') as string) || '';
    const firstName = (formData.get('first_name') as string) || '';
    const email = (formData.get('email') as string) || '';
    const storyId = formData.get('story_id') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    // Validate
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }
    
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }
    
    console.log(`📸 Uploading: ${file.name} (${Math.round(file.size / 1024)}KB)`);
    
    // Convert to buffer - NO SHARP, NO PROCESSING
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('📤 Uploading to Supabase (raw file, no processing)...');
    
    // Upload to Supabase
    const supabase = getServiceSupabase();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const filename = `sketch/raw-${timestamp}-${randomId}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('stories')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '31536000'
      });
    
    if (error) {
      console.error('❌ Upload failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    console.log('✅ Upload successful');
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('stories')
      .getPublicUrl(data.path);
    
    // Update story if ID provided
    if (storyId) {
      console.log(`📝 Updating story ${storyId}`);
      await supabase
        .from('stories')
        .update({
          sketch_original_url: publicUrl,
          sketch_processed_url: publicUrl, // Same URL - no processing
          sketch_title: title || null,
          sketch_first_name: firstName || null,
          sketch_email: email || null,
          has_custom_sketch: true,
          sketch_uploaded_at: new Date().toISOString()
        })
        .eq('id', storyId);
    }
    
    console.log('✅ Complete - no errors!');
    
    return NextResponse.json({
      success: true,
      data: {
        originalFormUrl: publicUrl,
        sketchUrl: publicUrl,
        processedSketchUrl: publicUrl, // All same - no processing
        title: title,
        firstName: firstName,
        email: email,
        storyId: storyId || null,
        processedAt: new Date().toISOString(),
        note: 'Raw upload - no image processing (Sharp not available)'
      }
    });
    
  } catch (error) {
    console.error('❌ Raw upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
    }, { status: 500 });
  }
}
