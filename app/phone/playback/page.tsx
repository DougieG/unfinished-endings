'use client';

import { useEffect, useState, useRef } from 'react';
import { PhoneAudioManager } from '@/lib/phone-audio';
import { PHONE_CONFIG } from '@/lib/phone-config';
import CrankiePlayer from '@/components/CrankiePlayer';
import DebugConsole from '@/components/DebugConsole';

type StationState = 'idle' | 'loading' | 'playing' | 'error';

export default function PlaybackStation() {
  const [state, setState] = useState<StationState>('idle');
  const [currentStory, setCurrentStory] = useState<any>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  
  const audioManager = useRef<PhoneAudioManager | null>(null);
  const sessionId = useRef<string | null>(null);
  const storyAudio = useRef<HTMLAudioElement | null>(null);
  const crankieAudioRef = useRef<HTMLAudioElement | null>(null); // Pre-load crankie audio

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
          console.log('📞 PICKUP - STARTING CRANKIE NOW');
          setState('loading');
          
          // Create crankie audio element NOW
          const crankieAudio = new Audio();
          crankieAudio.setAttribute('playsinline', '');
          crankieAudioRef.current = crankieAudio;
          
          // Fetch story IMMEDIATELY
          fetch('/api/phone/playback/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
            .then(res => res.json())
            .then(data => {
              console.log('📦 STORY:', data.story.id);
              
              if (data.story.panorama && data.story.audio_url) {
                console.log('🎵 LOADING:', data.story.audio_url);
                crankieAudio.src = data.story.audio_url;
                
                // PLAY IMMEDIATELY
                crankieAudio.play()
                  .then(() => {
                    console.log('✅ PLAYING');
                    // Set state to show crankie
                    setCurrentStory(data.story);
                    setState('playing');
                  })
                  .catch(err => console.error('❌ FAILED:', err));
              } else {
                console.error('No panorama data');
                setState('error');
              }
            })
            .catch(err => {
              console.error('Fetch failed:', err);
              setState('error');
            });
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
      
      audio.play()
        .then(() => {
          console.log('✅ Intro played - audio context unlocked');
          setAudioUnlocked(true); // Mark audio as unlocked
        })
        .catch(err => {
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

  // Not needed anymore - everything happens in keyup handler
  const startSession = async () => {
    console.log('Session tracking disabled for testing');
  };

  // This function is no longer needed - story fetched in keyup handler
  const playRandomStory = async () => {
    console.log('⚠️ playRandomStory called but should not be used anymore');
  };

  const endSession = async () => {
    console.log('📴 HANGUP - STOPPING ALL AUDIO');
    
    // Stop crankie audio
    if (crankieAudioRef.current) {
      crankieAudioRef.current.pause();
      crankieAudioRef.current.currentTime = 0;
      crankieAudioRef.current = null;
    }
    
    // Stop regular story audio
    if (storyAudio.current) {
      storyAudio.current.pause();
      storyAudio.current.currentTime = 0;
      storyAudio.current = null;
    }
    
    audioManager.current?.stopPlayback();
    
    // Reset state
    setState('idle');
    setCurrentStory(null);

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
      <DebugConsole />
      {/* Shadow puppet display */}
      {state === 'playing' && currentStory?.panorama && crankieAudioRef.current && (
        <div className="fixed inset-0 z-10 bg-black flex items-center justify-center">
          <div className="w-full h-full">
            <CrankiePlayer 
              panorama={currentStory.panorama}
              audioElement={crankieAudioRef.current}
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
