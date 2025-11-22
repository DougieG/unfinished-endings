import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAudioDuration } from '@/lib/audio';

// BULLETPROOF: Configuration
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MIN_FILE_SIZE = 100; // 100 bytes
const ALLOWED_MIME_TYPES = ['audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];
const MAX_RETRIES = 3;
const UPLOAD_TIMEOUT = 60000; // 60 seconds

export async function POST(request: NextRequest) {
  const uploadId = `upload-${Date.now()}`;
  const startTime = Date.now();
  
  try {
    console.log(`📥 [${uploadId}] Audio upload request received`);
    
    // BULLETPROOF: Parse form data with timeout
    const formData = await Promise.race([
      request.formData(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Form data parsing timeout')), 10000)
      )
    ]) as FormData;
    
    const audioFile = formData.get('audio') as File;
    const uploadAttempt = formData.get('attempt') || '1';

    if (!audioFile) {
      console.error(`❌ [${uploadId}] No audio file in form data`);
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log(`📊 [${uploadId}] Audio file details:`, {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
      sizeKB: Math.round(audioFile.size / 1024),
      attempt: uploadAttempt
    });

    // BULLETPROOF: Validate file size
    if (audioFile.size < MIN_FILE_SIZE) {
      console.error(`❌ [${uploadId}] File too small: ${audioFile.size} bytes`);
      return NextResponse.json(
        { error: `File too small. Minimum ${MIN_FILE_SIZE} bytes required.` },
        { status: 400 }
      );
    }

    if (audioFile.size > MAX_FILE_SIZE) {
      console.error(`❌ [${uploadId}] File too large: ${audioFile.size} bytes`);
      return NextResponse.json(
        { error: `File too large. Maximum ${MAX_FILE_SIZE / 1024 / 1024}MB allowed.` },
        { status: 413 }
      );
    }

    // BULLETPROOF: Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(audioFile.type)) {
      console.warn(`⚠️ [${uploadId}] Unsupported MIME type: ${audioFile.type}, attempting anyway...`);
    }

    // BULLETPROOF: Initialize Supabase with error handling
    let supabase;
    try {
      supabase = getServiceSupabase();
    } catch (err) {
      console.error(`❌ [${uploadId}] Supabase initialization failed:`, err);
      return NextResponse.json(
        { error: 'Database connection failed. Check server configuration.' },
        { status: 503 }
      );
    }

    // Generate unique filename with correct extension
    const timestamp = Date.now();
    const extension = audioFile.type.includes('mp4') ? 'mp4' : 'webm';
    const filename = `${timestamp}-${audioFile.name || `recording.${extension}`}`;

    console.log(`📤 [${uploadId}] Uploading to Supabase: ${filename}`);

    // BULLETPROOF: Convert to buffer with timeout
    const arrayBuffer = await Promise.race([
      audioFile.arrayBuffer(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('File read timeout')), 30000)
      )
    ]) as ArrayBuffer;

    console.log(`📦 [${uploadId}] Buffer created: ${arrayBuffer.byteLength} bytes`);

    // BULLETPROOF: Upload with retry logic
    let uploadData;
    let uploadError;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await Promise.race([
          supabase.storage
            .from('stories')
            .upload(filename, arrayBuffer, {
              contentType: audioFile.type || 'audio/mp4',
              cacheControl: '3600',
              upsert: false,
            }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout')), UPLOAD_TIMEOUT)
          )
        ]) as any;
        
        uploadData = result.data;
        uploadError = result.error;
        
        if (!uploadError) {
          console.log(`✅ [${uploadId}] Upload successful on attempt ${attempt + 1}`);
          break;
        }
        
        if (attempt < MAX_RETRIES - 1) {
          console.warn(`⚠️ [${uploadId}] Upload attempt ${attempt + 1} failed, retrying...`, uploadError);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      } catch (err) {
        uploadError = err;
        if (attempt < MAX_RETRIES - 1) {
          console.warn(`⚠️ [${uploadId}] Upload attempt ${attempt + 1} threw error, retrying...`, err);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    if (uploadError || !uploadData) {
      console.error(`❌ [${uploadId}] Upload failed after ${MAX_RETRIES} attempts:`, {
        message: uploadError?.message,
        error: uploadError,
        filename,
        fileSize: arrayBuffer.byteLength
      });
      return NextResponse.json(
        { 
          error: 'Failed to upload audio after multiple attempts',
          details: uploadError?.message || 'Unknown error',
          retryable: true,
          uploadId
        },
        { status: 500 }
      );
    }

    console.log(`✅ [${uploadId}] Upload successful:`, uploadData.path);

    // BULLETPROOF: Get public URL with validation
    const { data: urlData } = supabase.storage
      .from('stories')
      .getPublicUrl(uploadData.path);
      
    if (!urlData?.publicUrl) {
      console.error(`❌ [${uploadId}] Failed to get public URL`);
      return NextResponse.json(
        { error: 'Upload succeeded but could not generate URL' },
        { status: 500 }
      );
    }
    
    console.log(`🔗 [${uploadId}] Public URL generated:`, urlData.publicUrl);

    // BULLETPROOF: Get audio duration with timeout
    let duration: number | null = null;
    try {
      const blob = new Blob([arrayBuffer], { type: audioFile.type });
      duration = await Promise.race([
        getAudioDuration(blob),
        new Promise<number>((_, reject) => 
          setTimeout(() => reject(new Error('Duration calculation timeout')), 10000)
        )
      ]);
      console.log(`⏱️ [${uploadId}] Duration calculated: ${duration}s`);
    } catch (err) {
      console.warn(`⚠️ [${uploadId}] Could not calculate duration:`, err);
      // Non-fatal - continue without duration
    }

    // BULLETPROOF: Insert story record with retry
    console.log(`💾 [${uploadId}] Inserting story record into database...`);
    
    let story;
    let insertError;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await Promise.race([
          supabase
            .from('stories')
            .insert({
              source: 'interior',
              audio_url: urlData.publicUrl,
              duration_s: duration,
              consent: true,
            })
            .select()
            .single(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database insert timeout')), 10000)
          )
        ]) as any;
        
        story = result.data;
        insertError = result.error;
        
        if (!insertError && story) {
          console.log(`✅ [${uploadId}] Database insert successful on attempt ${attempt + 1}`);
          break;
        }
        
        if (attempt < MAX_RETRIES - 1) {
          console.warn(`⚠️ [${uploadId}] Insert attempt ${attempt + 1} failed, retrying...`, insertError);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      } catch (err) {
        insertError = err;
        if (attempt < MAX_RETRIES - 1) {
          console.warn(`⚠️ [${uploadId}] Insert attempt ${attempt + 1} threw error, retrying...`, err);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    if (insertError || !story) {
      console.error(`❌ [${uploadId}] Database insert failed after ${MAX_RETRIES} attempts:`, {
        message: insertError?.message,
        code: insertError?.code,
        details: insertError?.details,
        hint: insertError?.hint,
        audioUrl: urlData.publicUrl
      });
      
      // File is uploaded but DB failed - return special error for recovery
      return NextResponse.json(
        { 
          error: 'Audio uploaded but database save failed',
          details: insertError?.message || 'Unknown error',
          audioUrl: urlData.publicUrl,
          recoverable: true,
          uploadId
        },
        { status: 500 }
      );
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ [${uploadId}] Story saved successfully: ${story.id} (${elapsedTime}ms)`);

    // Trigger transcription in the background (don't wait for it)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    fetch(`${appUrl}/api/transcribe/${story.id}`, {
      method: 'POST',
    }).catch(err => {
      console.error('Background transcription trigger failed:', err);
    });

    return NextResponse.json({
      success: true,
      id: story.id,
      audio_url: story.audio_url,
      uploadId,
      duration: duration,
      processingTime: Date.now() - startTime,
    });

  } catch (error) {
    console.error(`❌ [${uploadId}] Critical error in POST /api/stories:`, error);
    
    // BULLETPROOF: Detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('timeout');
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        retryable: isTimeout || isNetworkError,
        uploadId,
        timestamp: Date.now()
      },
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
