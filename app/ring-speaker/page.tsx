'use client';

import { useEffect, useRef, useState } from 'react';

export default function RingSpeaker() {
  const [status, setStatus] = useState<'idle' | 'ringing'>('idle');
  const [ipAddress, setIpAddress] = useState('');
  const [audioReady, setAudioReady] = useState(false);
  const [activationStatus, setActivationStatus] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set IP address on mount
  useEffect(() => {
    setIpAddress(window.location.hostname);
  }, []);

  // Poll for ring commands
  useEffect(() => {
    // Poll for ring commands every 500ms (only if audio is ready)
    if (!audioReady) {
      return; // Don't poll until audio is activated
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/ring/status');
        const data = await response.json();
        
        if (data.shouldRing && status !== 'ringing') {
          startRinging();
        } else if (!data.shouldRing && status === 'ringing') {
          stopRinging();
        }
      } catch (err) {
        // Polling failed, ignore
      }
    }, 500);

    return () => clearInterval(pollInterval);
  }, [status, audioReady]);

  const activateAudio = async () => {
    console.log('🔓 Activating audio - SIMPLE METHOD');
    setActivationStatus('Loading audio...');
    
    try {
      // SIMPLEST APPROACH: Just create audio and load it
      // The button tap IS the user interaction - no tricks needed!
      const ringUrl = 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/phone-ring.mp3';
      console.log('🔔 Ring URL:', ringUrl);

      // Create audio element
      audioRef.current = new Audio();
      audioRef.current.src = ringUrl;
      audioRef.current.loop = true;
      audioRef.current.volume = 1.0;
      audioRef.current.preload = 'auto';
      
      console.log('📥 Loading audio file...');
      setActivationStatus('Downloading ring audio...');
      
      // Wait for it to load (with 10 second timeout)
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.log('✅ Timeout - assuming loaded');
          resolve(null);
        }, 10000);
        
        audioRef.current!.addEventListener('canplaythrough', () => {
          clearTimeout(timeout);
          console.log('✅ Audio fully loaded');
          resolve(null);
        }, { once: true });
        
        audioRef.current!.addEventListener('error', (e) => {
          clearTimeout(timeout);
          console.error('❌ Audio load error:', e);
          reject(new Error('Failed to load audio file'));
        }, { once: true });
        
        audioRef.current!.load();
      });
      
      setActivationStatus('');
      setAudioReady(true);
      console.log('✅✅✅ AUDIO READY! System can now ring.');
      
    } catch (err: any) {
      console.error('❌ Audio activation failed:', err);
      setActivationStatus(`ERROR: ${err.message}`);
      alert(`Audio failed to load: ${err.message}\n\nTry:\n1. Check internet connection\n2. Refresh page\n3. Try different browser`);
    }
  };

  const startRinging = async () => {
    console.log('🔔 Starting ring on speaker');
    setStatus('ringing');

    if (!audioRef.current) {
      console.warn('⚠️ Audio not ready! Tap Activate Audio first.');
      alert('Audio not ready! Tap the yellow Activate button first.');
      return;
    }

    try {
      // Reset to beginning
      audioRef.current.currentTime = 0;
      audioRef.current.loop = true;
      audioRef.current.volume = 1.0;
      
      console.log('▶️ Attempting to play...');
      const playPromise = audioRef.current.play();
      
      await playPromise;
      console.log('✅✅✅ RING IS PLAYING!');
      
    } catch (err: any) {
      console.error('❌ Play failed:', err);
      setStatus('idle');
      alert(`Cannot play audio: ${err.message}\n\nMake sure:\n- Phone not on silent\n- Volume is UP\n- Try tapping Activate Audio again`);
    }
  };

  const stopRinging = () => {
    console.log('🛑 Stopping ring');
    setStatus('idle');

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // DON'T set to null - keep the audio element for reuse
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-wider uppercase text-gray-500">
          Ring Speaker Station
        </h1>

        <div className="text-6xl font-mono">
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="text-gray-600">🔇</div>
              <div className="text-3xl text-gray-600">Ready</div>
            </div>
          )}
          {status === 'ringing' && (
            <div className="space-y-6 animate-pulse">
              <div className="text-8xl">🔔</div>
              <div className="text-5xl font-bold text-green-400 uppercase tracking-widest">
                Ringing
              </div>
            </div>
          )}
        </div>

        <div className="text-xl text-gray-500 space-y-4 p-6 bg-gray-900 rounded-lg">
          <div className="font-mono">
            <div className="text-sm text-gray-600">This iPad's Address:</div>
            <div className="text-2xl text-green-400">{ipAddress || 'Loading...'}</div>
          </div>
          <div className="text-sm text-gray-600">
            Configure the Recording Station (iPad 1) to send ring commands to this address.
          </div>
          <div className="text-xs text-gray-700 mt-4">
            iPad 2 listens for ring commands and plays audio through its built-in speakers at full volume.
            This bypasses all browser audio routing limitations.
          </div>
        </div>

        {/* Audio Activation */}
        {!audioReady ? (
          <div className="space-y-4">
            <div className="text-yellow-400 text-lg font-semibold animate-pulse">
              ⚠️ Audio Not Activated
            </div>
            <button
              onClick={activateAudio}
              disabled={activationStatus !== ''}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black rounded-lg font-bold text-xl"
            >
              🔓 TAP HERE TO ACTIVATE AUDIO
            </button>
            {activationStatus && (
              <div className="text-blue-400 text-lg font-semibold animate-pulse">
                {activationStatus}
              </div>
            )}
            <div className="text-sm text-gray-600">
              Mobile browsers require a tap to unlock audio playback.
              <br />
              Tap the button above FIRST, then the system will be ready.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-green-400 text-lg font-semibold">
              ✅ Audio Ready - System Active
            </div>
            {/* Manual test buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={startRinging}
                disabled={status === 'ringing'}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-semibold"
              >
                🔔 Test Ring
              </button>
              <button
                onClick={stopRinging}
                disabled={status === 'idle'}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-semibold"
              >
                🛑 Stop Ring
              </button>
              <button
                onClick={() => {
                  stopRinging();
                  setAudioReady(false);
                  setActivationStatus('');
                  audioRef.current = null;
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
