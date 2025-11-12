'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShadowPuppet from './ShadowPuppet';
import type { Story } from '@/lib/supabase';

export default function WitnessWall() {
  const [story, setStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const pickUpPhone = async () => {
    setIsRinging(true);

    // Ring for 2 seconds
    setTimeout(async () => {
      setIsRinging(false);
      
      try {
        const response = await fetch('/api/stories/random');
        if (!response.ok) throw new Error('No stories available');

        const storyData = await response.json();
        setStory(storyData);

        // Play audio
        const audio = new Audio(storyData.audio_url);
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setStory(null);
          setAudioElement(null);
        });

        audio.play();
        setAudioElement(audio);
        setIsPlaying(true);

      } catch (error) {
        console.error('Failed to fetch story:', error);
        setIsRinging(false);
      }
    }, 2000);
  };

  const hangUp = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setIsPlaying(false);
    setStory(null);
    setAudioElement(null);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-cardboard">
      <AnimatePresence mode="wait">
        {!isPlaying && !isRinging && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h2 className="text-4xl font-serif text-soot mb-8">
              Witness Wall
            </h2>
            <button
              onClick={pickUpPhone}
              className="px-8 py-4 bg-soot text-cardboard font-sans text-lg rounded-sm
                         hover:bg-soot/90 transition-all duration-400
                         hover:scale-[1.02] active:scale-[0.98]"
            >
              Pick up a phone
            </button>
          </motion.div>
        )}

        {isRinging && (
          <motion.div
            key="ringing"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.98, 1, 0.98]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-center"
          >
            <div className="text-6xl mb-4">📞</div>
            <p className="text-2xl font-serif text-soot">Ringing...</p>
          </motion.div>
        )}

        {isPlaying && story && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl"
          >
            <div className="bg-white/50 rounded-lg p-8 shadow-2xl">
              <div className="aspect-[4/3] mb-6 bg-cardboard/30 rounded overflow-hidden">
                <ShadowPuppet 
                  keywords={story.keywords || []}
                  motifs={[]}
                />
              </div>

              <div className="text-center space-y-4">
                {story.transcript && (
                  <p className="text-sm text-soot/70 font-sans italic max-h-32 overflow-y-auto">
                    {story.transcript.substring(0, 200)}
                    {story.transcript.length > 200 && '...'}
                  </p>
                )}

                <button
                  onClick={hangUp}
                  className="px-6 py-2 bg-soot/20 text-soot font-sans rounded-sm
                             hover:bg-soot/30 transition-all duration-400"
                >
                  Hang up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
