/**
 * MINIMAL Upload Test - No Sharp, No Processing
 * Just upload the raw image to Supabase
 * POST /api/sketch/upload-minimal
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Minimal upload started');
    
    const formData = await request.formData();
    const file = formData.get('form_image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    console.log(`📸 File: ${file.name} (${file.size} bytes)`);
    
    // Convert to buffer - NO PROCESSING
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`✅ Buffer created: ${buffer.length} bytes`);
    
    // Upload to Supabase - RAW FILE, NO PROCESSING
    const supabase = getServiceSupabase();
    const timestamp = Date.now();
    const filename = `sketch/minimal-test-${timestamp}.jpg`;
    
    console.log('📤 Uploading to Supabase...');
    
    const { data, error } = await supabase.storage
      .from('stories')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '31536000'
      });
    
    if (error) {
      console.error('❌ Supabase upload failed:', error);
      return NextResponse.json({
        error: 'Supabase upload failed',
        message: error.message,
        details: error
      }, { status: 500 });
    }
    
    console.log('✅ Upload successful');
    
    const { data: { publicUrl } } = supabase.storage
      .from('stories')
      .getPublicUrl(data.path);
    
    return NextResponse.json({
      success: true,
      message: 'Minimal upload test PASSED',
      url: publicUrl,
      filename: data.path,
      fileSize: buffer.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Minimal upload error:', error);
    
    return NextResponse.json({
      error: 'Minimal upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    }, { status: 500 });
  }
}
