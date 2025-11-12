'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import CrankiePlayer from '@/components/CrankiePlayer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CrankieStory {
  id: string;
  source: string;
  text: string;
  word_count: number;
  panorama: any;
}

export default function CrankieDemoPage() {
  const [stories, setStories] = useState<CrankieStory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCrankies() {
      const { data, error } = await supabase
        .from('generated_visuals')
        .select(`
          story_id,
          composition,
          stories_corpus!story_id (
            id,
            source,
            cleaned_text,
            word_count
          )
        `)
        .eq('generation_method', 'crankie_panorama')
        .limit(10);

      if (error) {
        console.error('Error loading crankies:', error);
        setLoading(false);
        return;
      }

      const formatted = data?.map((item: any) => ({
        id: item.story_id,
        source: item.stories_corpus.source,
        text: item.stories_corpus.cleaned_text,
        word_count: item.stories_corpus.word_count,
        panorama: item.composition.panorama,
      })) || [];

      setStories(formatted);
      setLoading(false);
    }

    loadCrankies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cardboard flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-serif text-soot mb-2">Loading crankie theaters...</div>
          <div className="text-sm text-soot/60">Fetching panoramas from database</div>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-cardboard flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="text-3xl font-serif text-soot mb-4">No Crankie Panoramas Found</div>
          <div className="text-sm text-soot/60 mb-6">
            Crankie panoramas are multi-scene visual narratives generated from story analysis.
          </div>
          <div className="bg-white/50 rounded-lg p-6 text-left">
            <p className="text-sm font-sans text-soot mb-4">To generate crankie panoramas:</p>
            <ol className="list-decimal ml-5 space-y-2 text-sm text-soot/80">
              <li>Make sure you've run: <code className="bg-soot/10 px-2 py-1 rounded">npm run analyze-corpus</code></li>
              <li>Then run: <code className="bg-soot/10 px-2 py-1 rounded">npm run generate-crankies</code></li>
              <li>This will create 5-7 scenes per story (~$0.12 per story)</li>
              <li>Generation takes ~1-2 minutes per story</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const story = stories[selectedIndex];

  return (
    <div className="min-h-screen bg-cardboard">
      {/* Header */}
      <div className="border-b border-soot/10 p-6">
        <h1 className="text-4xl font-serif text-soot mb-2">
          Crankie Theater
        </h1>
        <p className="text-sm font-sans text-soot/60">
          Scrolling shadow puppet panoramas • Generated from loss narratives
        </p>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Story Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-3 py-1 bg-soot/10 text-soot rounded-full text-xs font-sans">
                {story.source}
              </span>
              <span className="ml-2 text-xs text-soot/60">
                {story.word_count} words
              </span>
            </div>
            <div className="text-xs text-soot/60">
              Story {selectedIndex + 1} of {stories.length}
            </div>
          </div>
        </div>

        {/* Crankie Player */}
        <div className="mb-8">
          <CrankiePlayer 
            panorama={story.panorama}
            autoPlay={false}
          />
        </div>

        {/* Story Text */}
        <div className="bg-white/50 rounded-lg p-6 shadow-lg mb-8">
          <h3 className="text-lg font-serif text-soot mb-4">Original Story</h3>
          <p className="text-base font-sans text-soot/90 leading-relaxed italic">
            "{story.text}"
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setSelectedIndex((i) => (i - 1 + stories.length) % stories.length)}
            className="flex-1 px-6 py-3 bg-soot text-cardboard rounded-sm font-sans
                       hover:bg-soot/90 transition-all duration-300"
          >
            ← Previous Story
          </button>
          <button
            onClick={() => setSelectedIndex((i) => (i + 1) % stories.length)}
            className="flex-1 px-6 py-3 bg-soot text-cardboard rounded-sm font-sans
                       hover:bg-soot/90 transition-all duration-300"
          >
            Next Story →
          </button>
        </div>

        {/* All Stories Grid */}
        <div className="bg-white/50 rounded-lg p-6">
          <h3 className="text-xl font-serif text-soot mb-4">All Crankie Panoramas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stories.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSelectedIndex(i)}
                className={`relative p-3 rounded-lg transition-all text-left ${
                  i === selectedIndex
                    ? 'bg-amber shadow-xl scale-105'
                    : 'bg-cardboard/30 hover:bg-cardboard/50 shadow-md'
                }`}
              >
                <div className="text-xs text-soot/60 mb-2">{s.source}</div>
                <div className="text-sm font-serif text-soot mb-3 line-clamp-2">
                  {s.text.substring(0, 80)}...
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-soot/60">{s.panorama.scenes.length} scenes</span>
                  <span className="text-soot/60">{Math.round(s.panorama.scroll_duration)}s</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-soot/5 rounded-lg p-6">
          <h3 className="text-lg font-serif text-soot mb-3">How Crankie Panoramas Work</h3>
          <ol className="space-y-2 text-sm text-soot/80">
            <li><strong>1. Story Analysis:</strong> GPT-4 extracts 5-7 key narrative moments (beats)</li>
            <li><strong>2. Scene Generation:</strong> Each beat becomes a Stable Diffusion prompt</li>
            <li><strong>3. Panorama Creation:</strong> Scenes are stitched into a scrolling sequence</li>
            <li><strong>4. Synchronized Playback:</strong> Panorama scrolls to match story timing</li>
            <li><strong>5. Interactive Navigation:</strong> Jump to any scene or scrub through timeline</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
