import { NextRequest, NextResponse } from 'next/server';
import { PhoneSessionManager } from '@/lib/phone-audio';
import { getServiceSupabase, type Story } from '@/lib/supabase';
import { selectRandomStory, parseLRU } from '@/lib/random';

/**
 * POST /api/phone/playback/start
 * 
 * Get random story for Phone 2 playback
 * Triggered when phone is picked up
 */
export async function POST(request: NextRequest) {
  try {
    // TESTING: Temporarily bypass session check
    const session = PhoneSessionManager.getSession(2);
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'No active phone session' },
    //     { status: 400 }
    //   );
    // }

    const supabase = getServiceSupabase();

    // Get all stories (consent check disabled for testing)
    // TODO: Re-enable consent filter for production: .eq('consent', true)
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      // .eq('consent', true) // TESTING: Disabled consent check
      .order('created_at', { ascending: false });

    if (error || !stories || stories.length === 0) {
      return NextResponse.json(
        { error: 'No stories available' },
        { status: 404 }
      );
    }

    // Get LRU from request (could be cookie or header)
    // For phone, we track separately to avoid repeating last 3 stories
    const lru = parseLRU(request.headers.get('x-phone-lru') || '[]');

    // Select weighted random story (excluding recently played)
    const story = selectRandomStory(stories as Story[], {
      excludeIds: lru,
      recencyBias: 0.3,
    });

    if (!story) {
      return NextResponse.json(
        { error: 'No stories available' },
        { status: 404 }
      );
    }

    // Update play count and last played timestamp
    await supabase
      .from('stories')
      .update({
        play_count: (story.play_count || 0) + 1,
        last_played_at: new Date().toISOString(),
      })
      .eq('id', story.id);

    console.log(`[Phone Playback] Playing story ${story.id} (${story.duration_s}s)`);

    return NextResponse.json({
      sessionId: session?.sessionId || 'test-session',
      phone: 2,
      story: {
        id: story.id,
        audio_url: story.audio_url,
        duration_s: story.duration_s,
        keywords: story.keywords,
        panorama: story.panorama, // Include shadow puppet data
      },
    });

  } catch (error) {
    console.error('Error starting phone playback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
