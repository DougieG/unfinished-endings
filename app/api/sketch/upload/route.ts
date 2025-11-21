/**
 * API Route: Upload and Process Ending Care Form
 * POST /api/sketch/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { processEndingCareForm, cleanTitle, validateEmail } from '@/lib/form-processor';

export const runtime = 'nodejs';
export const maxDuration = 60; // OCR can take time

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Sketch upload request received');
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('form_image') as File;
    const storyId = formData.get('story_id') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }
    
    console.log(`📸 Processing form image: ${file.name} (${Math.round(file.size / 1024)}KB)`);
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process form with OCR
    console.log('🔄 Starting OCR and image extraction...');
    const extractedData = await processEndingCareForm(buffer);
    
    // Upload images to Supabase Storage
    const supabase = getServiceSupabase();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const baseFilename = `sketch/${timestamp}-${randomId}`;
    
    // Upload original form
    console.log('📤 Uploading original form to storage...');
    const { data: originalUpload, error: originalError } = await supabase.storage
      .from('stories')
      .upload(`${baseFilename}-original.jpg`, buffer, {
        contentType: file.type,
        cacheControl: '31536000'
      });
    
    if (originalError) {
      console.error('Failed to upload original:', originalError);
      throw new Error('Failed to upload original form');
    }
    
    // Upload extracted sketch
    console.log('📤 Uploading extracted sketch...');
    const { data: sketchUpload, error: sketchError } = await supabase.storage
      .from('stories')
      .upload(`${baseFilename}-sketch.png`, extractedData.sketchImageBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000'
      });
    
    if (sketchError) {
      console.error('Failed to upload sketch:', sketchError);
      throw new Error('Failed to upload sketch');
    }
    
    // Upload processed silhouette
    console.log('📤 Uploading processed silhouette...');
    const { data: processedUpload, error: processedError } = await supabase.storage
      .from('stories')
      .upload(`${baseFilename}-processed.png`, extractedData.sketchProcessedBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000'
      });
    
    if (processedError) {
      console.error('Failed to upload processed:', processedError);
      throw new Error('Failed to upload processed sketch');
    }
    
    // Get public URLs
    const { data: originalUrl } = supabase.storage
      .from('stories')
      .getPublicUrl(originalUpload.path);
    
    const { data: sketchUrl } = supabase.storage
      .from('stories')
      .getPublicUrl(sketchUpload.path);
    
    const { data: processedUrl } = supabase.storage
      .from('stories')
      .getPublicUrl(processedUpload.path);
    
    // If story_id provided, update the story
    if (storyId) {
      console.log(`🔗 Attaching sketch to story ${storyId}`);
      
      const { error: updateError } = await supabase
        .from('stories')
        .update({
          sketch_original_url: originalUrl.publicUrl,
          sketch_processed_url: processedUrl.publicUrl,
          sketch_title: cleanTitle(extractedData.title),
          sketch_first_name: extractedData.firstName,
          sketch_email: validateEmail(extractedData.email) ? extractedData.email : null,
          has_custom_sketch: true,
          sketch_uploaded_at: new Date().toISOString(),
          form_metadata: {
            confidence: extractedData.confidence,
            dimensions: extractedData.formDimensions
          }
        })
        .eq('id', storyId);
      
      if (updateError) {
        console.error('Failed to update story:', updateError);
        // Don't fail the whole request - sketch is still uploaded
      }
    }
    
    console.log('✅ Form processing complete!');
    
    // Return extracted data for review
    return NextResponse.json({
      success: true,
      data: {
        // URLs
        originalFormUrl: originalUrl.publicUrl,
        sketchUrl: sketchUrl.publicUrl,
        processedSketchUrl: processedUrl.publicUrl,
        
        // Extracted text (for review/editing)
        title: extractedData.title,
        firstName: extractedData.firstName,
        email: extractedData.email,
        
        // Confidence scores
        confidence: extractedData.confidence,
        
        // Metadata
        processedAt: extractedData.processedAt,
        formDimensions: extractedData.formDimensions,
        storyId: storyId || null
      }
    });
    
  } catch (error) {
    console.error('❌ Form processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
