'use client';

import { useEffect, useState, useRef } from 'react';
import { PhoneAudioManager } from '@/lib/phone-audio';
import { PHONE_CONFIG } from '@/lib/phone-config';
import CrankiePlayer from '@/components/CrankiePlayer';

type StationState = 'idle' | 'loading' | 'playing' | 'error';

export default function PlaybackStation() {
  const [state, setState] = useState<StationState>('idle');
  const [currentStory, setCurrentStory] = useState<any>(null);
  
  const audioManager = useRef<PhoneAudioManager | null>(null);
  const sessionId = useRef<string | null>(null);
  const storyAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioManager.current = new PhoneAudioManager({
      phone1DeviceName: PHONE_CONFIG.phone1DeviceName,
      phone2DeviceName: PHONE_CONFIG.phone2DeviceName,
    });

    return () => {
      audioManager.current?.cleanup();
    };
  }, []);

  // Handle key events
  useEffect(() => {
    // OFF HOOK = keyup (button released when phone lifted)
    const handleKeyUp = async (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (PHONE_CONFIG.playback.offHook.includes(e.code)) {
        if (state === 'idle') {
          startSession();
        }
      }
    };

    // ON HOOK = keydown (button pressed when phone cradled)
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;

      // Hangup
      if (PHONE_CONFIG.playback.onHook.includes(e.code)) {
        endSession();
      }

      // NEXT STORY
      if (PHONE_CONFIG.playback.next && PHONE_CONFIG.playback.next.includes(e.code)) {
        if (state === 'playing') {
          if (storyAudio.current) {
            storyAudio.current.pause();
            storyAudio.current = null;
          }
          playRandomStory();
        }
      }

      // REPEAT STORY
      if (PHONE_CONFIG.playback.repeat && PHONE_CONFIG.playback.repeat.includes(e.code)) {
        if (state === 'playing' && currentStory?.audio_url) {
          if (storyAudio.current) {
            storyAudio.current.pause();
            storyAudio.current.currentTime = 0;
            storyAudio.current.play();
          }
        }
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state, currentStory]);

  const playIntroMessage = (): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio('https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/1Listening.mp3');
      audio.setAttribute('playsinline', ''); // iOS requirement
      
      audio.onended = () => resolve();
      audio.onerror = (err) => {
        console.error('Intro message failed to play', err);
        resolve(); // Continue anyway
      };
      
      audio.play().catch(err => {
        console.error('Audio play failed', err);
        resolve(); // Continue anyway
      });
    });
  };

  const playClosingMessage = (): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio('https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/3ThankyePlayback.mp3');
      audio.setAttribute('playsinline', ''); // iOS requirement
      
      audio.onended = () => resolve();
      audio.onerror = (err) => {
        console.error('Closing message failed to play', err);
        resolve(); // Continue anyway
      };
      
      audio.play().catch(err => {
        console.error('Audio play failed', err);
        resolve(); // Continue anyway
      });
    });
  };

  const startSession = async () => {
    try {
      setState('loading');
      
      // 1. Register session
      const res = await fetch('/api/phone/hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: 2, state: 'off-hook' }),
      });
      const data = await res.json();
      if (data.session) sessionId.current = data.session.sessionId;

      // 2. Play intro message
      await playIntroMessage();

      // 3. Get story and play
      await playRandomStory();

    } catch (err) {
      console.error('Playback start failed', err);
      setState('error');
    }
  };

  const playRandomStory = async () => {
    try {
      setState('loading');
      
      const res = await fetch('/api/phone/playback/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error:', res.status, errorText);
        throw new Error(`No stories available: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Story data received:', data);
      
      if (!data.story || !data.story.audio_url) {
        console.error('Invalid story data:', data);
        throw new Error('No valid story returned');
      }
      
      setCurrentStory(data.story);
      setState('playing');
      
      console.log('Playing story:', data.story.audio_url);
      console.log('Panorama data:', data.story.panorama);
      
      // ONLY play audio manually if there's NO panorama (CrankiePlayer handles it otherwise)
      if (!data.story.panorama) {
        storyAudio.current = new Audio(data.story.audio_url);
        
        storyAudio.current.onended = async () => {
          await playClosingMessage();
          endSession();
        };
        
        storyAudio.current.onerror = (err) => {
          console.error('Story playback failed', err, storyAudio.current?.error);
          setState('error');
        };
        
        storyAudio.current.play().catch(err => {
          console.error('Story play failed', err);
          setState('error');
        });
      }
      // If panorama exists, CrankiePlayer will handle audio playback
      
    } catch (err) {
      console.error('Fetch story failed', err);
      setState('error');
    }
  };

  const endSession = async () => {
    setState('idle');
    setCurrentStory(null);
    
    // Stop audio
    if (storyAudio.current) {
      storyAudio.current.pause();
      storyAudio.current = null;
    }
    audioManager.current?.stopPlayback();

    // Notify backend
    await fetch('/api/phone/hook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: 2, state: 'on-hook' }),
    }).catch(console.error);

    // Finalize logs
    if (sessionId.current) {
      await fetch('/api/phone/playback/stop', { method: 'POST' }).catch(console.error);
    }
    sessionId.current = null;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      {/* Shadow puppet display */}
      {state === 'playing' && currentStory?.panorama && (
        <div className="fixed inset-0 z-10 bg-black flex items-center justify-center">
          <div className="w-full h-full">
            <CrankiePlayer 
              panorama={currentStory.panorama}
              audioUrl={currentStory.audio_url}
              autoPlay={true}
              hideControls={true}
              onEnded={async () => {
                await playClosingMessage();
                endSession();
              }}
            />
          </div>
        </div>
      )}

      {/* Status overlay - ONLY show when NOT playing crankie */}
      {!(state === 'playing' && currentStory?.panorama) && (
        <div className="relative z-20 text-center space-y-8 p-8">
          <h1 className="text-4xl font-bold tracking-wider uppercase text-gray-500">
            Playback Station
          </h1>

          <div className="text-6xl font-mono">
            {state === 'idle' && <span className="text-gray-600">Pick up to listen</span>}
            {state === 'loading' && <span className="text-yellow-400 animate-pulse">Connecting...</span>}
            {state === 'playing' && !currentStory?.panorama && (
              <div className="space-y-4">
                <span className="text-green-500">Playing Story</span>
                {currentStory && (
                  <div className="text-2xl text-gray-400 mt-4">
                    #{currentStory.id.slice(0, 8)}
                  </div>
                )}
              </div>
            )}
            {state === 'error' && <span className="text-red-600">Unavailable</span>}
          </div>
        </div>
      )}
    </main>
  );
}
