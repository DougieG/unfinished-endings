/**
 * SIMPLIFIED Upload Route - No OCR
 * POST /api/sketch/upload-v2
 * User provides text manually, we just process the image
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { processFormSimple } from '@/lib/form-processor-simple';

export const runtime = 'nodejs';
export const maxDuration = 30; // Much faster without OCR

export async function POST(request: NextRequest) {
  try {
    console.log('📤 V2 upload started (no OCR)');
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('form_image') as File;
    const storyId = formData.get('story_id') as string | null;
    
    // Optional manual text fields
    const title = (formData.get('title') as string) || '';
    const firstName = (formData.get('first_name') as string) || '';
    const email = (formData.get('email') as string) || '';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    // Validate file
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
    
    console.log(`📸 Processing: ${file.name} (${Math.round(file.size / 1024)}KB)`);
    
    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process image (NO OCR - just extract sketch)
    console.log('🔄 Extracting sketch (no OCR)...');
    const extractedData = await processFormSimple(buffer);
    console.log('✅ Extraction complete');
    
    // Upload to Supabase
    const supabase = getServiceSupabase();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const baseFilename = `sketch/${timestamp}-${randomId}`;
    
    // Upload original
    console.log('📤 Uploading original...');
    const { data: originalUpload, error: originalError } = await supabase.storage
      .from('stories')
      .upload(`${baseFilename}-original.jpg`, buffer, {
        contentType: file.type,
        cacheControl: '31536000'
      });
    
    if (originalError) {
      throw new Error('Failed to upload original');
    }
    
    // Upload sketch
    console.log('📤 Uploading sketch...');
    const { data: sketchUpload, error: sketchError } = await supabase.storage
      .from('stories')
      .upload(`${baseFilename}-sketch.png`, extractedData.sketchImageBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000'
      });
    
    if (sketchError) {
      throw new Error('Failed to upload sketch');
    }
    
    // Upload processed silhouette
    console.log('📤 Uploading processed...');
    const { data: processedUpload, error: processedError } = await supabase.storage
      .from('stories')
      .upload(`${baseFilename}-processed.png`, extractedData.sketchProcessedBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000'
      });
    
    if (processedError) {
      throw new Error('Failed to upload processed');
    }
    
    // Get public URLs
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('stories')
      .getPublicUrl(originalUpload.path);
    
    const { data: { publicUrl: sketchUrl } } = supabase.storage
      .from('stories')
      .getPublicUrl(sketchUpload.path);
    
    const { data: { publicUrl: processedUrl } } = supabase.storage
      .from('stories')
      .getPublicUrl(processedUpload.path);
    
    // If storyId provided, update the story
    if (storyId) {
      console.log(`📝 Updating story ${storyId}`);
      const { error: updateError } = await supabase
        .from('stories')
        .update({
          sketch_original_url: originalUrl,
          sketch_processed_url: processedUrl,
          sketch_title: title || null,
          sketch_first_name: firstName || null,
          sketch_email: email || null,
          has_custom_sketch: true,
          sketch_uploaded_at: new Date().toISOString()
        })
        .eq('id', storyId);
      
      if (updateError) {
        console.error('Failed to update story:', updateError);
      }
    }
    
    console.log('✅ Upload complete');
    
    return NextResponse.json({
      success: true,
      data: {
        originalFormUrl: originalUrl,
        sketchUrl: sketchUrl,
        processedSketchUrl: processedUrl,
        
        // User-provided text (not OCR)
        title: title,
        firstName: firstName,
        email: email,
        
        processedAt: extractedData.processedAt,
        formDimensions: extractedData.formDimensions,
        storyId: storyId || null
      }
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Detailed error info for debugging
    const errorInfo = {
      error: 'Failed to process upload',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version
    };
    
    console.error('Full error details:', JSON.stringify(errorInfo, null, 2));
    
    return NextResponse.json(errorInfo, { status: 500 });
  }
}
