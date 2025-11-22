/**
 * ULTRA SIMPLE - Just upload the raw image, no processing
 * POST /api/sketch/upload-raw
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  console.log('═══════════════════════════════════════');
  console.log('🚀 RAW UPLOAD STARTED');
  console.log('Time:', new Date().toISOString());
  console.log('Node:', process.version);
  console.log('Platform:', process.platform);
  
  try {
    console.log('STEP 1: Parsing form data...');
    const formData = await request.formData();
    console.log('✓ Form data parsed');
    
    console.log('STEP 2: Extracting fields...');
    const file = formData.get('form_image') as File;
    const title = (formData.get('title') as string) || '';
    const firstName = (formData.get('first_name') as string) || '';
    const email = (formData.get('email') as string) || '';
    const storyId = formData.get('story_id') as string | null;
    console.log('✓ Fields extracted:', { 
      hasFile: !!file, 
      title, 
      firstName, 
      email,
      storyId 
    });
    
    if (!file) {
      console.log('❌ No file provided');
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    console.log('STEP 3: Validating file...');
    console.log('  - Name:', file.name);
    console.log('  - Type:', file.type);
    console.log('  - Size:', file.size, 'bytes');
    
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type');
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }
    
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      console.log('❌ File too large');
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }
    console.log('✓ File valid');
    
    console.log('STEP 4: Converting to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('✓ Buffer created:', buffer.length, 'bytes');
    
    console.log('STEP 5: Initializing Supabase...');
    const supabase = getServiceSupabase();
    console.log('✓ Supabase client created');
    
    console.log('STEP 6: Preparing upload...');
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const filename = `sketch/raw-${timestamp}-${randomId}.jpg`;
    console.log('  - Filename:', filename);
    console.log('  - Bucket: stories');
    
    console.log('STEP 7: Uploading to Supabase storage...');
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
    console.error('═══════════════════════════════════════');
    console.error('❌ RAW UPLOAD ERROR');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('═══════════════════════════════════════');
    
    return NextResponse.json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name || 'Unknown',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
