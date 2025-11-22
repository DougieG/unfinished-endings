'use client';

import { useEffect, useRef, useState } from 'react';

export default function RingSpeaker() {
  const [status, setStatus] = useState<'idle' | 'ringing'>('idle');
  const [ipAddress, setIpAddress] = useState('');
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get local IP address on mount
  useEffect(() => {
    // Display network info
    setIpAddress(window.location.hostname);

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
    console.log('🔓 Activating audio...');
    
    try {
      // Get ring tone URL
      const configResponse = await fetch('/api/admin/phone-audio');
      const configData = await configResponse.json();
      const ringUrl = configData.configs?.find((c: any) => c.config_key === 'ring_tone')?.audio_url 
        || 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/phone-ring.mp3';

      console.log('🔔 Loading ring audio:', ringUrl);

      // Create audio element and load it (this unlocks audio on mobile)
      audioRef.current = new Audio(ringUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 1.0;
      
      // Load the audio file
      await audioRef.current.load();
      
      setAudioReady(true);
      console.log('✅ Audio ready! System can now ring.');
    } catch (err) {
      console.error('❌ Audio activation failed:', err);
    }
  };

  const startRinging = async () => {
    console.log('🔔 Starting ring on speaker');
    setStatus('ringing');

    if (!audioRef.current) {
      console.warn('⚠️ Audio not ready! Tap Activate Audio first.');
      return;
    }

    try {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Ring playing through speakers!');
          })
          .catch(err => {
            console.error('❌ Play failed:', err);
            console.log('Try tapping Activate Audio button first');
          });
      }
    } catch (err) {
      console.error('❌ Ring playback failed:', err);
    }
  };

  const stopRinging = () => {
    console.log('🛑 Stopping ring');
    setStatus('idle');

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
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
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-bold text-xl"
            >
              🔓 TAP HERE TO ACTIVATE AUDIO
            </button>
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
            <div className="flex gap-4 justify-center">
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
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
