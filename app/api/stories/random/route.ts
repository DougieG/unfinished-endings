import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { selectRandomStory, parseLRU, updateLRU, serializeLRU } from '@/lib/random';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    
    // Fetch all consented stories
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

    if (!stories || stories.length === 0) {
      return NextResponse.json(
        { error: 'No stories available' },
        { status: 404 }
      );
    }

    // Get LRU from cookie
    const cookieStore = cookies();
    const lruCookie = cookieStore.get('story_lru');
    const excludeIds = parseLRU(lruCookie?.value);

    // Select random story with anti-repeat
    const story = selectRandomStory(stories, {
      excludeIds,
      recencyBias: 0.3,
    });

    if (!story) {
      return NextResponse.json(
        { error: 'No stories available' },
        { status: 404 }
      );
    }

    // Update play count and last played
    await supabase
      .from('stories')
      .update({
        play_count: story.play_count + 1,
        last_played_at: new Date().toISOString(),
      })
      .eq('id', story.id);

    // Update LRU cookie
    const updatedLRU = updateLRU(excludeIds, story.id, 3);
    
    const response = NextResponse.json(story);
    response.cookies.set('story_lru', serializeLRU(updatedLRU), {
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    });

    return response;

  } catch (error) {
    console.error('Error in GET /api/stories/random:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
