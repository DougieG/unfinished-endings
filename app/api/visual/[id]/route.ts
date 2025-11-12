import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { keywordsToMotifs } from '@/lib/keywords';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getServiceSupabase();

    // Fetch story
    const { data: story, error } = await supabase
      .from('stories')
      .select('keywords')
      .eq('id', id)
      .single();

    if (error || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Get motifs from keywords
    const keywords = story.keywords || [];
    const motifs = keywordsToMotifs(keywords);

    // Return motif data (component will render SVG)
    return NextResponse.json({
      motifs,
      keywords,
    });

  } catch (error) {
    console.error('Error in visual generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate visual' },
      { status: 500 }
    );
  }
}
