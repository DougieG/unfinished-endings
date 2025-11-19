import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * GET /api/stories/test
 * Simple test endpoint to check if stories exist
 */
export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    const { data: stories, error } = await supabase
      .from('stories')
      .select('id, created_at, audio_url, consent')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      count: stories?.length || 0,
      stories: stories || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
