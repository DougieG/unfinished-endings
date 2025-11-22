'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ShadowPuppet from '@/components/ShadowPuppet';
import CrankiePlayer from '@/components/CrankiePlayer';
import { keywordsToMotifs } from '@/lib/keywords';
import type { Story } from '@/lib/supabase';

interface StoryPlayerProps {
  story: Story;
}

export default function StoryPlayer({ story }: StoryPlayerProps) {
  const [candleCount, setCandleCount] = useState(0);
  const [hasLitCandle, setHasLitCandle] = useState(false);

  const motifs = story.keywords ? keywordsToMotifs(story.keywords) : [];

  const lightCandle = () => {
    if (hasLitCandle) return;
    setCandleCount(prev => prev + 1);
    setHasLitCandle(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/50 rounded-lg p-8 shadow-2xl"
    >
      {/* Shadow Visual / Crankie */}
      {story.panorama ? (
        /* Crankie panorama with synced audio */
        <div className="mb-6">
          <CrankiePlayer 
            panorama={story.panorama}
            audioUrl={story.audio_url}
            autoPlay={false}
            sketchUrl={story.sketch_processed_url || undefined}
            introDuration={5} // Show sketch for first 5 seconds (intro bumper)
          />
        </div>
      ) : (
        <>
          {/* Static visual */}
          <div className="aspect-[4/3] mb-6 bg-cardboard/30 rounded overflow-hidden">
            {story.visual_url ? (
              /* AI-generated shadow puppet image */
              <img 
                src={story.visual_url} 
                alt="Shadow puppet visual" 
                className="w-full h-full object-cover"
              />
            ) : (
              /* Fallback to canvas animation */
              <ShadowPuppet 
                keywords={story.keywords || []}
                motifs={motifs}
              />
            )}
          </div>

          {/* Audio Player */}
          <div className="mb-6">
            <audio 
              controls 
              className="w-full"
              src={story.audio_url}
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        </>
      )}

      {/* Transcript */}
      {story.transcript && (
        <div className="mb-6 p-4 bg-cardboard/20 rounded">
          <h3 className="text-sm font-sans font-semibold text-soot/60 mb-2">
            Transcript
          </h3>
          <p className="text-sm font-sans text-soot/80 leading-relaxed">
            {story.transcript}
          </p>
        </div>
      )}

      {/* Light a Candle */}
      <div className="text-center pt-6 border-t border-soot/10">
        <p className="text-sm font-sans text-soot/60 mb-4">
          {candleCount} {candleCount === 1 ? 'candle' : 'candles'} lit for this tale
        </p>
        <button
          onClick={lightCandle}
          disabled={hasLitCandle}
          className={`px-6 py-3 font-sans rounded-sm transition-all duration-400 ${
            hasLitCandle
              ? 'bg-soot/10 text-soot/40 cursor-not-allowed'
              : 'bg-amber text-soot hover:bg-amber/90 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {hasLitCandle ? 'Candle Lit' : 'Light a Candle'}
        </button>
      </div>
    </motion.div>
  );
}
