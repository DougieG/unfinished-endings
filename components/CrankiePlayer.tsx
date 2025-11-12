'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CrankieScene {
  sequence: number;
  image_url: string;
  beat: {
    moment: string;
    mood: string;
    timestamp_percent: number;
  };
}

interface CrankiePanorama {
  scenes: CrankieScene[];
  total_width: number;
  scroll_duration: number;
}

interface CrankiePlayerProps {
  panorama: CrankiePanorama;
  audioUrl?: string;
  autoPlay?: boolean;
}

export default function CrankiePlayer({ 
  panorama, 
  audioUrl,
  autoPlay = false 
}: CrankiePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(panorama.scroll_duration);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // Calculate scroll position
  const progress = Math.min(currentTime / duration, 1);
  const scrollX = -(progress * panorama.total_width);
  
  // Find current scene
  const currentScene = panorama.scenes.find((scene, i) => {
    const nextScene = panorama.scenes[i + 1];
    return !nextScene || progress < nextScene.beat.timestamp_percent;
  }) || panorama.scenes[0];

  // Animation loop for timer-based playback (when no audio)
  useEffect(() => {
    const audio = audioRef.current;
    
    // If we have audio, sync to it
    if (audio && audioUrl) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }
    
    // Otherwise, use timer-based animation
    if (isPlaying && !audioUrl) {
      const animate = () => {
        const now = Date.now();
        const delta = (now - lastUpdateRef.current) / 1000; // seconds
        lastUpdateRef.current = now;
        
        setCurrentTime(prev => {
          const next = prev + delta;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      lastUpdateRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isPlaying, audioUrl, duration]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    
    // If we have audio, use it
    if (audio && audioUrl) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    } else {
      // Otherwise, toggle our timer-based playback
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    
    if (audio && audioUrl) {
      audio.currentTime = newTime;
    } else {
      setCurrentTime(newTime);
      lastUpdateRef.current = Date.now();
    }
  };

  return (
    <div className="relative w-full">
      {/* Crankie Theater Frame */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow-2xl border-8 border-soot"
        style={{
          background: 'radial-gradient(ellipse at center, #F4A259 0%, #D4A574 60%, #C89666 100%)',
        }}
        onClick={handleSeek}
      >
        {/* Scrolling Panorama */}
        <motion.div
          className="absolute top-0 left-0 h-full flex"
          animate={{ x: scrollX }}
          transition={{ 
            type: 'tween',
            ease: 'linear',
            duration: 0.3 
          }}
        >
          {panorama.scenes.map((scene) => (
            <div
              key={scene.sequence}
              className="h-full flex-shrink-0"
              style={{ width: '1024px' }}
            >
              <img
                src={scene.image_url}
                alt={scene.beat.moment}
                className="w-full h-full object-cover"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          ))}
        </motion.div>

        {/* Ornate Frame Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top decorative border */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-soot/40 to-transparent" />
          {/* Bottom decorative border */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-soot/40 to-transparent" />
        </div>

        {/* Scene Title Overlay */}
        {currentScene && (
          <motion.div
            key={currentScene.sequence}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 pointer-events-none"
          >
            <div className="bg-soot/80 backdrop-blur-sm rounded px-4 py-2">
              <p className="text-xs text-cardboard/80 font-serif italic">
                {currentScene.beat.moment}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4">
        {/* Progress Bar */}
        <div className="relative h-2 bg-soot/10 rounded-full overflow-hidden mb-3 cursor-pointer">
          <div
            className="absolute top-0 left-0 h-full bg-soot transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
          {/* Scene markers */}
          {panorama.scenes.map((scene) => (
            <div
              key={scene.sequence}
              className="absolute top-0 h-full w-0.5 bg-amber"
              style={{ left: `${scene.beat.timestamp_percent * 100}%` }}
            />
          ))}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayPause}
            className="px-6 py-2 bg-soot text-cardboard rounded-sm font-sans text-sm
                       hover:bg-soot/90 transition-all duration-300"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <div className="flex-1 flex items-center gap-2 text-xs text-soot/60">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="text-xs text-soot/60">
            Scene {currentScene?.sequence || 1} of {panorama.scenes.length}
          </div>
        </div>

        {/* Scene List */}
        <div className="mt-4 grid grid-cols-7 gap-2">
          {panorama.scenes.map((scene) => (
            <button
              key={scene.sequence}
              onClick={() => {
                const audio = audioRef.current;
                const newTime = scene.beat.timestamp_percent * duration;
                
                if (audio && audioUrl) {
                  audio.currentTime = newTime;
                } else {
                  setCurrentTime(newTime);
                  lastUpdateRef.current = Date.now();
                }
              }}
              className={`relative aspect-[4/3] rounded overflow-hidden border-2 transition-all ${
                currentScene?.sequence === scene.sequence
                  ? 'border-amber scale-105'
                  : 'border-soot/20 hover:border-soot/40'
              }`}
            >
              <img
                src={scene.image_url}
                alt={scene.beat.moment}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-soot/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-1">
                <p className="text-xs text-cardboard font-serif truncate">
                  {scene.beat.mood}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
