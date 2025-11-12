'use client';

import { useState } from 'react';
import IntricateShadow from '@/components/IntricateShadow';
import { INTRICATE_LIBRARY } from '@/lib/intricate-svgs';

const STORY_EXAMPLES = [
  {
    title: "Grandmother's Thread",
    keywords: ['grandmother', 'thread', 'hands', 'memory'],
    description: 'Elderly woman with reaching hands motif'
  },
  {
    title: "Window Vigil",
    keywords: ['window', 'door', 'candle', 'light', 'waiting'],
    description: 'Gothic arch with candle and frame'
  },
  {
    title: "Garden Memory",
    keywords: ['tree', 'willow', 'garden', 'vine', 'nature'],
    description: 'Weeping willow with vine border'
  },
  {
    title: "Paper Cranes",
    keywords: ['bird', 'butterfly', 'wings', 'transformation'],
    description: 'Bird and butterfly creatures'
  },
  {
    title: "The Clock Stopped",
    keywords: ['clock', 'time', 'hands', 'waiting'],
    description: 'Antique clock with reaching hands'
  },
  {
    title: "All Elements",
    keywords: ['grandmother', 'tree', 'window', 'candle', 'bird', 'hands', 'time'],
    description: 'Complex composition with multiple elements'
  },
];

export default function TestIntricatePage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = STORY_EXAMPLES[selectedIndex];

  return (
    <div className="min-h-screen bg-cardboard">
      <div className="border-b border-soot/10 p-6">
        <h1 className="text-4xl font-serif text-soot mb-2">
          Intricate Shadow Puppets v2.0
        </h1>
        <p className="text-sm font-sans text-soot/60">
          Lotte Reiniger inspired • Paper-cut style • Decorative cutouts
        </p>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Large Preview */}
        <div className="mb-8">
          <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-2xl border-4 border-soot/20">
            <IntricateShadow keywords={selected.keywords} />
          </div>
          
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-serif text-soot mb-1">
              {selected.title}
            </h2>
            <p className="text-sm font-sans text-soot/60 mb-3">
              {selected.description}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {selected.keywords.map(kw => (
                <span
                  key={kw}
                  className="px-3 py-1 bg-soot/10 text-soot rounded-full text-xs font-sans"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setSelectedIndex((i) => (i - 1 + STORY_EXAMPLES.length) % STORY_EXAMPLES.length)}
            className="px-6 py-3 bg-soot text-cardboard rounded-sm font-sans
                       hover:bg-soot/90 transition-all duration-300"
          >
            ← Previous
          </button>
          <span className="px-4 py-3 text-sm font-sans text-soot/60">
            {selectedIndex + 1} / {STORY_EXAMPLES.length}
          </span>
          <button
            onClick={() => setSelectedIndex((i) => (i + 1) % STORY_EXAMPLES.length)}
            className="px-6 py-3 bg-soot text-cardboard rounded-sm font-sans
                       hover:bg-soot/90 transition-all duration-300"
          >
            Next →
          </button>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {STORY_EXAMPLES.map((example, index) => (
            <button
              key={example.title}
              onClick={() => setSelectedIndex(index)}
              className={`p-3 rounded-lg transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-amber shadow-xl scale-105'
                  : 'bg-white/50 hover:bg-white/70 shadow-md'
              }`}
            >
              <div className="aspect-[4/3] rounded overflow-hidden mb-2">
                <IntricateShadow keywords={example.keywords} />
              </div>
              <p className="text-xs font-serif text-soot text-center">
                {example.title}
              </p>
            </button>
          ))}
        </div>

        {/* Library Info */}
        <div className="bg-white/50 rounded-lg p-6">
          <h3 className="text-xl font-serif text-soot mb-4">
            Current SVG Library ({INTRICATE_LIBRARY.length} elements)
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {INTRICATE_LIBRARY.map(element => (
              <div key={element.id} className="p-3 bg-cardboard/20 rounded">
                <p className="text-sm font-sans font-semibold text-soot capitalize mb-1">
                  {element.id.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-soot/60 mb-2">
                  {element.category} • layer {element.layer}
                </p>
                <div className="flex flex-wrap gap-1">
                  {element.keywords.slice(0, 3).map(kw => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 bg-soot/10 text-soot rounded text-xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="bg-white/50 rounded-lg p-6">
            <h4 className="text-lg font-serif text-soot mb-3">
              ✨ Visual Features
            </h4>
            <ul className="space-y-2 text-sm font-sans text-soot/70">
              <li>• Intricate paper-cut style silhouettes</li>
              <li>• Decorative cutout patterns (amber glow)</li>
              <li>• Warm gradient backlight (#F4A259)</li>
              <li>• Multi-layer depth (foreground/mid/background)</li>
              <li>• Gentle breathing animation (scale pulse)</li>
              <li>• Subtle parallax motion by layer</li>
              <li>• Floating particle ambiance</li>
            </ul>
          </div>

          <div className="bg-white/50 rounded-lg p-6">
            <h4 className="text-lg font-serif text-soot mb-3">
              🔮 Next Steps
            </h4>
            <ul className="space-y-2 text-sm font-sans text-soot/70">
              <li>• Expand library to 100+ elements</li>
              <li>• Add more figures, objects, creatures</li>
              <li>• Build composition engine (smart layouts)</li>
              <li>• Morphing transitions between scenes</li>
              <li>• Audio-reactive particle systems</li>
              <li>• Custom frames per story theme</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
