import { notFound } from 'next/navigation';
import { getServiceSupabase } from '@/lib/supabase';
import StoryPlayer from './StoryPlayer';

interface StoryPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = params;
  const supabase = getServiceSupabase();

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('consent', true)
    .single();

  if (error || !story) {
    notFound();
  }

  // Debug logging
  console.log('Story data:', {
    id: story.id,
    hasPanorama: !!story.panorama,
    panoramaScenes: story.panorama?.scenes?.length || 0
  });

  return (
    <div className="min-h-screen bg-cardboard flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif text-soot mb-4">
            Unfinished Endings
          </h1>
          <p className="text-sm font-sans text-soot/60">
            Tale #{story.id.substring(0, 8).toUpperCase()}
            {story.panorama && (
              <span className="ml-2 text-amber">🎭 Crankie Theater</span>
            )}
          </p>
        </div>

        <StoryPlayer story={story} />

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-soot/20 text-soot font-sans rounded-sm
                       hover:bg-soot/30 transition-all duration-400"
          >
            Return to Archive
          </a>
        </div>
      </div>
    </div>
  );
}
