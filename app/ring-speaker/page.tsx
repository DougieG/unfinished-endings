'use client';

import { useEffect, useRef, useState } from 'react';

export default function RingSpeaker() {
  const [status, setStatus] = useState<'idle' | 'ringing'>('idle');
  const [ipAddress, setIpAddress] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Get local IP address on mount
  useEffect(() => {
    // Display network info
    setIpAddress(window.location.hostname);

    // Poll for ring commands every 500ms
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
  }, [status]);

  const startRinging = async () => {
    console.log('🔔 Starting ring on iPad 2 speakers');
    setStatus('ringing');

    try {
      // Get ring tone URL from config
      const configResponse = await fetch('/api/admin/phone-audio');
      const configData = await configResponse.json();
      const ringUrl = configData.configs?.find((c: any) => c.config_key === 'ring_tone')?.audio_url 
        || 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/phone-ring.mp3';

      console.log('🔔 Ring URL:', ringUrl);

      // Create AudioContext for playback
      audioContextRef.current = new AudioContext({ sampleRate: 48000 });

      // Fetch and decode audio
      const response = await fetch(ringUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      // Create looping source
      sourceNodeRef.current = audioContextRef.current.createBufferSource();
      sourceNodeRef.current.buffer = audioBuffer;
      sourceNodeRef.current.loop = true;

      // Create gain node for LOUD volume
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 1.0; // Full volume

      // Connect and play
      sourceNodeRef.current.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      sourceNodeRef.current.start(0);

      console.log('✅ Ring playing through iPad 2 speakers!');
    } catch (err) {
      console.error('❌ Ring failed:', err);
    }
  };

  const stopRinging = () => {
    console.log('🛑 Stopping ring');
    setStatus('idle');

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      sourceNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
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
    </main>
  );
}
