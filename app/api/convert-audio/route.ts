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

    // DELETE all WebM stories from database
    const storyIds = stories.map(s => s.id);
    
    const { error: deleteError } = await supabase
      .from('stories')
      .delete()
      .in('id', storyIds);
    
    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete WebM stories',
        details: deleteError
      }, { status: 500 });
    }

    return NextResponse.json({
      message: `Deleted ${storyIds.length} WebM stories from database`,
      deleted: storyIds.length,
      note: 'All iOS-incompatible WebM stories have been removed.'
    });

  } catch (error) {
    console.error('Error in convert-audio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
