import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    const { data: stories, error } = await supabase
      .from('stories')
      .select('id, audio_url, created_at, consent')
      .eq('consent', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Analyze formats
    const analysis = stories?.map(s => ({
      id: s.id.substring(0, 8),
      created: s.created_at,
      format: s.audio_url.includes('.webm') || s.audio_url.includes('blob') ? 'WebM' : 
              s.audio_url.includes('.mp4') ? 'MP4' : 'Unknown',
      url: s.audio_url
    })) || [];

    const webmCount = analysis.filter(s => s.format === 'WebM').length;
    const mp4Count = analysis.filter(s => s.format === 'MP4').length;

    return NextResponse.json({
      total: stories?.length || 0,
      webm: webmCount,
      mp4: mp4Count,
      stories: analysis
    });

  } catch (error) {
    console.error('Debug stories error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
