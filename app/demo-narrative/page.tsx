'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import IntricateShadow from '@/components/IntricateShadow';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AnalyzedStory {
  id: string;
  source: string;
  text: string;
  word_count: number;
  themes: Array<{ name: string; confidence: number }>;
  objects_mentioned: Array<{ object: string; frequency: number }>;
  sentiment_score: number;
  generated_image_url?: string;
}

export default function NarrativeDemoPage() {
  const [stories, setStories] = useState<AnalyzedStory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStories() {
      // Fetch analyzed stories with their corpus data and generated visuals
      const { data, error } = await supabase
        .from('story_analysis')
        .select(`
          *,
          stories_corpus:story_id (
            id,
            source,
            cleaned_text,
            word_count
          ),
          generated_visuals!story_id (
            composition
          )
        `)
        .limit(10);

      if (error) {
        console.error('Error loading stories:', error);
        return;
      }

      const formatted = data?.map((analysis: any) => ({
        id: analysis.story_id,
        source: analysis.stories_corpus.source,
        text: analysis.stories_corpus.cleaned_text,
        word_count: analysis.stories_corpus.word_count,
        themes: analysis.themes || [],
        objects_mentioned: analysis.objects_mentioned || [],
        sentiment_score: analysis.sentiment_score || 0,
        generated_image_url: analysis.generated_visuals?.[0]?.composition?.image_url,
      })) || [];

      setStories(formatted);
      setLoading(false);
    }

    loadStories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cardboard flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-serif text-soot mb-2">Loading analyzed stories...</div>
          <div className="text-sm text-soot/60">Fetching patterns from database</div>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-cardboard flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-serif text-soot mb-2">No analyzed stories found</div>
          <div className="text-sm text-soot/60">Run: npm run collect-corpus && npm run analyze-corpus</div>
        </div>
      </div>
    );
  }

  const story = stories[selectedIndex];
  
  // Extract keywords from objects for visual generation
  const keywords = story.objects_mentioned
    .slice(0, 6)
    .map(obj => obj.object.toLowerCase());

  return (
    <div className="min-h-screen bg-cardboard">
      {/* Header */}
      <div className="border-b border-soot/10 p-6">
        <h1 className="text-4xl font-serif text-soot mb-2">
          Narrative Visual System Demo
        </h1>
        <p className="text-sm font-sans text-soot/60">
          Stories → GPT-4 Analysis → Pattern Learning → Visual Generation
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Story + Analysis */}
          <div className="space-y-6">
            {/* Story Text */}
            <div className="bg-white/50 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
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
              
              <p className="text-base font-sans text-soot/90 leading-relaxed italic">
                "{story.text}"
              </p>
            </div>

            {/* Analysis Results */}
            <div className="bg-white/50 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-serif text-soot mb-4">
                GPT-4 Analysis Results
              </h3>

              {/* Themes */}
              <div className="mb-4">
                <h4 className="text-sm font-sans font-semibold text-soot/60 mb-2">
                  Discovered Themes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {story.themes.map((theme, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 bg-amber/30 text-soot rounded-sm text-xs font-sans"
                    >
                      {theme.name.replace(/_/g, ' ')}
                      <span className="ml-1 opacity-60">
                        ({Math.round(theme.confidence * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Objects */}
              <div className="mb-4">
                <h4 className="text-sm font-sans font-semibold text-soot/60 mb-2">
                  Objects Mentioned
                </h4>
                <div className="flex flex-wrap gap-2">
                  {story.objects_mentioned.slice(0, 8).map((obj, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-soot/10 text-soot rounded-full text-xs font-sans"
                    >
                      {obj.object}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sentiment */}
              <div>
                <h4 className="text-sm font-sans font-semibold text-soot/60 mb-2">
                  Emotional Tone
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-soot/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-soot/40"
                      style={{
                        width: `${Math.abs(story.sentiment_score) * 100}%`,
                        marginLeft: story.sentiment_score < 0 ? '0' : '50%',
                      }}
                    />
                  </div>
                  <span className="text-xs text-soot/60 w-12">
                    {story.sentiment_score.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-soot/40 mt-1">
                  <span>grief</span>
                  <span>neutral</span>
                  <span>peace</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedIndex((i) => (i - 1 + stories.length) % stories.length)}
                className="flex-1 px-4 py-3 bg-soot text-cardboard rounded-sm font-sans
                           hover:bg-soot/90 transition-all duration-300"
              >
                ← Previous Story
              </button>
              <button
                onClick={() => setSelectedIndex((i) => (i + 1) % stories.length)}
                className="flex-1 px-4 py-3 bg-soot text-cardboard rounded-sm font-sans
                           hover:bg-soot/90 transition-all duration-300"
              >
                Next Story →
              </button>
            </div>
          </div>

          {/* Right: Generated Visual */}
          <div className="space-y-6">
            <div className="bg-white/50 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif text-soot">
                  Generated Shadow Puppet
                </h3>
                {story.generated_image_url && (
                  <span className="px-2 py-1 bg-amber/30 text-soot text-xs rounded">
                    AI Generated
                  </span>
                )}
              </div>
              
              <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl border-4 border-soot/20 mb-4 bg-gradient-to-br from-amber/20 to-amber/5">
                {story.generated_image_url ? (
                  <img 
                    src={story.generated_image_url} 
                    alt="AI-generated shadow puppet"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IntricateShadow keywords={keywords} />
                )}
              </div>

              <div className="text-xs text-soot/60">
                <p className="mb-2">
                  <strong>How it works:</strong>
                </p>
                {story.generated_image_url ? (
                  <ol className="space-y-1 ml-4 list-decimal">
                    <li>Story analyzed by GPT-4 for themes & objects</li>
                    <li>Prompt constructed from analysis results</li>
                    <li>Stable Diffusion SDXL generates shadow puppet</li>
                    <li>Image styled as Lotte Reiniger paper-cut art</li>
                    <li>Cached in database for instant display</li>
                  </ol>
                ) : (
                  <div>
                    <p className="mb-2">No AI visual yet. Using SVG fallback.</p>
                    <p className="text-soot/40">Run: npm run generate-visuals</p>
                  </div>
                )}
              </div>
            </div>

            {/* Keywords Used */}
            <div className="bg-white/50 rounded-lg p-6 shadow-lg">
              <h4 className="text-sm font-sans font-semibold text-soot/60 mb-3">
                Visual Keywords Used
              </h4>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-amber text-soot rounded-sm text-xs font-sans font-semibold"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* All Stories Grid */}
        <div className="mt-12">
          <h3 className="text-2xl font-serif text-soot mb-6">
            All Analyzed Stories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stories.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSelectedIndex(i)}
                className={`p-3 rounded-lg transition-all duration-300 text-left ${
                  i === selectedIndex
                    ? 'bg-amber shadow-xl scale-105'
                    : 'bg-white/50 hover:bg-white/70 shadow-md'
                }`}
              >
                <div className="text-xs text-soot/60 mb-1">{s.source}</div>
                <div className="text-xs font-serif text-soot line-clamp-3">
                  {s.text.substring(0, 60)}...
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.themes.slice(0, 2).map((t, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 bg-soot/10 rounded-full">
                      {t.name.split('_')[0]}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 bg-soot/5 rounded-lg p-8">
          <h3 className="text-2xl font-serif text-soot mb-6">
            Corpus Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-serif text-soot">{stories.length}</div>
              <div className="text-sm text-soot/60">Stories Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-soot">
                {new Set(stories.flatMap(s => s.themes.map(t => t.name))).size}
              </div>
              <div className="text-sm text-soot/60">Unique Themes</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-soot">
                {new Set(stories.flatMap(s => s.objects_mentioned.map(o => o.object))).size}
              </div>
              <div className="text-sm text-soot/60">Unique Objects</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-soot">
                {Math.round(stories.reduce((sum, s) => sum + Math.abs(s.sentiment_score), 0) / stories.length * 100) / 100}
              </div>
              <div className="text-sm text-soot/60">Avg Sentiment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
