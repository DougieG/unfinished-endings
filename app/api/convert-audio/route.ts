import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = getServiceSupabase();
    
    // Get all stories with WebM audio
    const { data: stories, error: fetchError } = await supabase
      .from('stories')
      .select('id, audio_url')
      .ilike('audio_url', '%.webm');
    
    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
    }

    if (!stories || stories.length === 0) {
      return NextResponse.json({ 
        message: 'No WebM files to convert',
        converted: 0,
        failed: 0
      });
    }

    let converted = 0;
    let failed = 0;

    // For each story, mark it as needing re-recording
    // We can't convert without FFmpeg, so we'll just flag them
    for (const story of stories) {
      try {
        // Add a note to keywords that this needs re-recording
        const { error: updateError } = await supabase
          .from('stories')
          .update({ 
            keywords: 'NEEDS_RERECORDING_IOS_INCOMPATIBLE_WEBM'
          })
          .eq('id', story.id);

        if (updateError) {
          console.error(`Failed to update story ${story.id}:`, updateError);
          failed++;
        } else {
          converted++;
        }
      } catch (err) {
        console.error(`Error processing story ${story.id}:`, err);
        failed++;
      }
    }

    return NextResponse.json({
      message: `Marked ${converted} stories as needing re-recording`,
      converted,
      failed,
      note: 'WebM stories have been flagged. Please re-record them for iOS compatibility.'
    });

  } catch (error) {
    console.error('Error in convert-audio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
