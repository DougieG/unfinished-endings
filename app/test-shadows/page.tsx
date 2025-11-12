'use client';

import { useState } from 'react';
import ShadowPuppet from '@/components/ShadowPuppet';
import type { MotifCategory } from '@/lib/keywords';

const MOTIFS: { category: MotifCategory; description: string; keywords: string[] }[] = [
  {
    category: 'fabric',
    description: 'Wavering ribbon - undulating fabric in gentle breeze',
    keywords: ['thread', 'fabric', 'cloth'],
  },
  {
    category: 'hand',
    description: 'Articulated hand - fingers curling and uncurling',
    keywords: ['hand', 'touch', 'finger'],
  },
  {
    category: 'portal',
    description: 'Drifting doorway - window or threshold between worlds',
    keywords: ['window', 'door', 'threshold'],
  },
  {
    category: 'bird',
    description: 'Flapping wings - crane in flight or soul departing',
    keywords: ['bird', 'crane', 'wing'],
  },
  {
    category: 'light',
    description: 'Flickering candle - memorial light with organic flicker',
    keywords: ['candle', 'flame', 'light'],
  },
  {
    category: 'nature',
    description: 'Swaying tree - branches moving in wind',
    keywords: ['tree', 'branch', 'garden'],
  },
  {
    category: 'abstract',
    description: 'Drifting particles - memory fragments, the ineffable',
    keywords: ['memory', 'fragment', 'dust'],
  },
];

export default function ShadowTestPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(false);

  const selected = MOTIFS[selectedIndex];

  return (
    <div className="min-h-screen bg-cardboard">
      {/* Header */}
      <div className="border-b border-soot/10 p-6">
        <h1 className="text-4xl font-serif text-soot mb-2">
          Shadow Puppet Test Gallery
        </h1>
        <p className="text-sm font-sans text-soot/60">
          Preview all 7 visual motifs
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Controls */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="px-4 py-2 bg-soot text-cardboard rounded-sm font-sans text-sm
                       hover:bg-soot/90 transition-all duration-300"
          >
            {showGrid ? 'Single View' : 'Grid View'}
          </button>
          
          {!showGrid && (
            <div className="flex-1 flex items-center gap-2">
              <button
                onClick={() => setSelectedIndex((i) => (i - 1 + MOTIFS.length) % MOTIFS.length)}
                className="px-4 py-2 bg-soot/20 text-soot rounded-sm font-sans text-sm
                           hover:bg-soot/30 transition-all duration-300"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 text-sm font-sans text-soot/60">
                {selectedIndex + 1} of {MOTIFS.length}
              </span>
              <button
                onClick={() => setSelectedIndex((i) => (i + 1) % MOTIFS.length)}
                className="px-4 py-2 bg-soot/20 text-soot rounded-sm font-sans text-sm
                           hover:bg-soot/30 transition-all duration-300"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Grid View */}
        {showGrid ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {MOTIFS.map((motif, index) => (
              <div
                key={motif.category}
                className="bg-white/50 rounded-lg p-4 shadow-xl cursor-pointer
                           hover:shadow-2xl transition-all duration-300"
                onClick={() => {
                  setSelectedIndex(index);
                  setShowGrid(false);
                }}
              >
                <div className="aspect-[4/3] bg-cardboard/30 rounded overflow-hidden mb-3">
                  <ShadowPuppet
                    keywords={motif.keywords}
                    motifs={[motif.category]}
                  />
                </div>
                <h3 className="text-lg font-serif text-soot mb-1 capitalize">
                  {motif.category}
                </h3>
                <p className="text-xs font-sans text-soot/60">
                  {motif.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* Single View */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/50 rounded-lg p-8 shadow-2xl">
              {/* Large preview */}
              <div className="aspect-[4/3] bg-cardboard/30 rounded overflow-hidden mb-6">
                <ShadowPuppet
                  keywords={selected.keywords}
                  motifs={[selected.category]}
                />
              </div>

              {/* Info */}
              <div className="border-t border-soot/10 pt-6">
                <h2 className="text-3xl font-serif text-soot mb-2 capitalize">
                  {selected.category}
                </h2>
                <p className="text-lg font-sans text-soot/80 mb-4">
                  {selected.description}
                </p>
                
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-sans font-semibold text-soot/60 mb-2">
                      Trigger Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selected.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-3 py-1 bg-soot/10 text-soot rounded-full font-sans text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-sans font-semibold text-soot/60 mb-2">
                      Animation Details
                    </h4>
                    <ul className="space-y-1 font-sans text-soot/70 text-xs">
                      <li>• Pure black silhouette</li>
                      <li>• Gentle, breathing motion</li>
                      <li>• 20fps canvas animation</li>
                      <li>• Time-based, no audio reactive</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick jump buttons */}
              <div className="mt-6 pt-6 border-t border-soot/10">
                <h4 className="text-xs font-sans font-semibold text-soot/60 mb-3">
                  Quick Jump
                </h4>
                <div className="flex flex-wrap gap-2">
                  {MOTIFS.map((motif, index) => (
                    <button
                      key={motif.category}
                      onClick={() => setSelectedIndex(index)}
                      className={`px-3 py-1 rounded-sm font-sans text-xs capitalize
                                  transition-all duration-300 ${
                        index === selectedIndex
                          ? 'bg-soot text-cardboard'
                          : 'bg-soot/10 text-soot hover:bg-soot/20'
                      }`}
                    >
                      {motif.category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Examples */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-serif text-soot mb-4">
            Example Story Mappings
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-sm font-sans text-soot/80 italic mb-2">
                "My grandmother kept a drawer full of <strong>thread</strong> spools..."
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-soot/10 text-soot rounded-full font-sans text-xs">
                  thread
                </span>
                <span className="text-soot/40">→</span>
                <span className="px-3 py-1 bg-amber text-soot rounded-full font-sans text-xs font-semibold">
                  FABRIC motif
                </span>
              </div>
            </div>

            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-sm font-sans text-soot/80 italic mb-2">
                "Every morning he stood at the kitchen <strong>window</strong>..."
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-soot/10 text-soot rounded-full font-sans text-xs">
                  window
                </span>
                <span className="text-soot/40">→</span>
                <span className="px-3 py-1 bg-amber text-soot rounded-full font-sans text-xs font-semibold">
                  PORTAL motif
                </span>
              </div>
            </div>

            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-sm font-sans text-soot/80 italic mb-2">
                "We folded paper <strong>cranes</strong> together, a thousand wishes..."
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-soot/10 text-soot rounded-full font-sans text-xs">
                  crane
                </span>
                <span className="text-soot/40">→</span>
                <span className="px-3 py-1 bg-amber text-soot rounded-full font-sans text-xs font-semibold">
                  BIRD motif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Notes */}
        <div className="mt-12 max-w-4xl mx-auto bg-soot/5 rounded-lg p-6">
          <h3 className="text-lg font-serif text-soot mb-3">
            Technical Notes
          </h3>
          <ul className="space-y-2 text-sm font-sans text-soot/70">
            <li>
              <strong>Canvas Size:</strong> 800×600px (4:3 aspect ratio)
            </li>
            <li>
              <strong>Color:</strong> #1A1A1A (soot) - pure black silhouette
            </li>
            <li>
              <strong>Frame Rate:</strong> 20fps (updates every 50ms)
            </li>
            <li>
              <strong>Animation Speed:</strong> Very slow (1-3 second cycles)
            </li>
            <li>
              <strong>Projection Tip:</strong> Best on muslin, rice paper, or frosted acrylic
            </li>
            <li>
              <strong>Display Options:</strong> Rear projection, front-lit screen, or direct monitor
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
