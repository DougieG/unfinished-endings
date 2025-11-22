/**
 * Simplified Upload Test - No OCR, just upload
 * POST /api/sketch/upload-simple
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Simple upload test started');
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('form_image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    console.log(`📸 File received: ${file.name} (${Math.round(file.size / 1024)}KB)`);
    
    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`✅ Buffer created: ${buffer.length} bytes`);
    
    // Try to upload to Supabase (no processing)
    const supabase = getServiceSupabase();
    const timestamp = Date.now();
    const filename = `sketch/test-${timestamp}.jpg`;
    
    console.log('📤 Uploading to Supabase...');
    
    const { data, error } = await supabase.storage
      .from('stories')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '31536000'
      });
    
    if (error) {
      console.error('❌ Upload failed:', error);
      return NextResponse.json(
        { 
          error: 'Upload failed',
          details: error.message
        },
        { status: 500 }
      );
    }
    
    console.log('✅ Upload successful:', data.path);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('stories')
      .getPublicUrl(data.path);
    
    return NextResponse.json({
      success: true,
      message: 'Simple upload test passed',
      url: publicUrl,
      filename: data.path,
      fileSize: buffer.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
