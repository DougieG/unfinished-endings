'use client';

import { useEffect, useState, useRef } from 'react';
import { PhoneAudioManager } from '@/lib/phone-audio';
import { PHONE_CONFIG } from '@/lib/phone-config';

type StationState = 'idle' | 'intro' | 'recording' | 'processing' | 'error';

export default function RecordingStation() {
  const [state, setState] = useState<StationState>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [duration, setDuration] = useState(0);
  
  // Refs for audio handling
  const audioManager = useRef<PhoneAudioManager | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const sessionId = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio manager
  useEffect(() => {
    audioManager.current = new PhoneAudioManager({
      phone1DeviceName: PHONE_CONFIG.phone1DeviceName,
      phone2DeviceName: PHONE_CONFIG.phone2DeviceName,
    });

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioManager.current?.cleanup();
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
  };

  // Handle key events
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ignore repeated keys
      if (e.repeat) return;

      // Check for OFF HOOK (Pickup)
      if (PHONE_CONFIG.recording.offHook.includes(e.code)) {
        if (state === 'idle') {
          startSession();
        }
      }

      // Check for ON HOOK (Hangup)
      if (PHONE_CONFIG.recording.onHook.includes(e.code)) {
        if (state === 'recording' || state === 'intro') {
          endSession();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  const startSession = async () => {
    try {
      setState('intro');
      setStatusMessage('Initializing...');

      // 1. Register session with backend
      const res = await fetch('/api/phone/hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: 1, state: 'off-hook' }),
      });
      const data = await res.json();
      
      if (data.session) {
        sessionId.current = data.session.sessionId;
      }

      // 2. Play beep/prompt
      if (audioManager.current) {
        await audioManager.current.playBeep('recording');
      }

      // 3. Start recording stream
      if (audioManager.current) {
        const stream = await audioManager.current.startRecording();
        startMediaRecorder(stream);
      }

    } catch (err) {
      console.error('Session start failed', err);
      setState('error');
      setStatusMessage('Could not start recording. Please replace handset.');
    }
  };

  const startMediaRecorder = (stream: MediaStream) => {
    audioChunks.current = [];
    const recorder = new MediaRecorder(stream);
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.current.push(e.data);
    };

    recorder.onstart = () => {
      setState('recording');
      setStatusMessage('Recording...');
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    };

    recorder.start(1000); // Slice every second
    mediaRecorder.current = recorder;
  };

  const endSession = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState('processing');
    setStatusMessage('Saving...');

    // Stop local recording
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.onstop = async () => {
        await saveRecording();
      };
      mediaRecorder.current.stop();
    } else {
      // Fallback if recorder wasn't running
      resetToIdle();
    }

    // Stop audio stream
    audioManager.current?.stopRecording();

    // Notify backend of hook state
    await fetch('/api/phone/hook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: 1, state: 'on-hook' }),
    }).catch(console.error);
  };

  const saveRecording = async () => {
    try {
      const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
      
      if (blob.size < 1000) {
        console.log('Recording too short, discarding');
        resetToIdle();
        return;
      }

      const formData = new FormData();
      formData.append('audio', blob);
      if (sessionId.current) {
        formData.append('sessionId', sessionId.current);
      }

      // Upload to endpoint
      await fetch('/api/phone/record/stop', {
        method: 'POST',
        body: formData,
      });

      resetToIdle();
    } catch (err) {
      console.error('Save failed', err);
      setState('error');
      setTimeout(resetToIdle, 3000);
    }
  };

  const resetToIdle = () => {
    setState('idle');
    setStatusMessage('Ready');
    setDuration(0);
    sessionId.current = null;
    audioChunks.current = [];
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-8">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-wider uppercase text-gray-500">
          Recording Station
        </h1>

        <div className="text-6xl font-mono">
          {state === 'idle' && <span className="text-gray-600">Put phone to ear</span>}
          {state === 'intro' && <span className="text-yellow-400">Prepare...</span>}
          {state === 'recording' && (
            <div className="space-y-4">
              <span className="text-red-500 animate-pulse">● Recording</span>
              <div className="text-4xl text-gray-300">
                {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}
          {state === 'processing' && <span className="text-blue-400 animate-pulse">Saving...</span>}
          {state === 'error' && <span className="text-red-600">Error</span>}
        </div>

        <div className="text-xl text-gray-600 max-w-md mx-auto">
          {statusMessage}
        </div>
      </div>
    </main>
  );
}
