import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyTwilioSignature } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    // Verify Twilio signature
    if (process.env.TWILIO_AUTH_TOKEN) {
      const signature = request.headers.get('x-twilio-signature') || '';
      const url = process.env.NEXT_PUBLIC_APP_URL + '/api/twilio/recording/complete';
      const params = Object.fromEntries(await request.formData());

      const isValid = verifyTwilioSignature(
        process.env.TWILIO_AUTH_TOKEN,
        signature,
        url,
        params
      );

      if (!isValid) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const formData = await request.formData();
    const recordingUrl = formData.get('RecordingUrl')?.toString();
    const recordingSid = formData.get('RecordingSid')?.toString();
    const duration = formData.get('RecordingDuration')?.toString();

    if (!recordingUrl || !recordingSid) {
      return NextResponse.json(
        { error: 'Missing recording data' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Download recording from Twilio
    const twilioAuthHeader = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString('base64');

    const recordingResponse = await fetch(recordingUrl + '.mp3', {
      headers: {
        Authorization: `Basic ${twilioAuthHeader}`,
      },
    });

    if (!recordingResponse.ok) {
      throw new Error('Failed to download recording from Twilio');
    }

    const audioBuffer = await recordingResponse.arrayBuffer();

    // Upload to Supabase Storage
    const filename = `twilio-${recordingSid}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('stories')
      .upload(filename, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload recording' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('stories')
      .getPublicUrl(uploadData.path);

    // Insert story record
    const { data: story, error: insertError } = await supabase
      .from('stories')
      .insert({
        source: 'interior',
        audio_url: urlData.publicUrl,
        duration_s: parseInt(duration || '0', 10),
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

    // Trigger transcription in background (non-blocking)
    if (process.env.OPENAI_API_KEY) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/transcribe/${story.id}`, {
        method: 'POST',
      }).catch(err => console.error('Failed to trigger transcription:', err));
    }

    return NextResponse.json({ success: true, id: story.id });

  } catch (error) {
    console.error('Error in recording complete handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
