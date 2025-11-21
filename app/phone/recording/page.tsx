'use client';

import { useEffect, useState, useRef } from 'react';
import { PhoneAudioManager } from '@/lib/phone-audio';
import { PHONE_CONFIG } from '@/lib/phone-config';
import { getPhoneAudioConfig, type PhoneAudioConfig } from '@/lib/phone-audio-config';

type StationState = 'idle' | 'intro' | 'recording' | 'processing' | 'error';

export default function RecordingStation() {
  const [state, setState] = useState<StationState>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [duration, setDuration] = useState(0);
  const [audioConfigLoaded, setAudioConfigLoaded] = useState(false);
  
  // Refs for audio handling
  const audioManager = useRef<PhoneAudioManager | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const sessionId = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const silenceCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const audioConfig = useRef<PhoneAudioConfig | null>(null);

  // Initialize audio manager and fetch config
  useEffect(() => {
    audioManager.current = new PhoneAudioManager({
      phone1DeviceName: PHONE_CONFIG.phone1DeviceName,
      phone2DeviceName: PHONE_CONFIG.phone2DeviceName,
    });

    // Fetch audio configuration
    getPhoneAudioConfig().then(config => {
      audioConfig.current = config;
      console.log('Phone audio config loaded:', config);
      setAudioConfigLoaded(true);
    }).catch(err => {
      console.error('Failed to load audio config:', err);
      // Still allow phone to work with fallback URLs
      setAudioConfigLoaded(true);
    });

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (silenceCheckInterval.current) clearInterval(silenceCheckInterval.current);
    audioManager.current?.cleanup();
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
  };

  // Handle key events
  useEffect(() => {
    // OFF HOOK = keyup (button released when phone lifted)
    const handleKeyUp = async (e: KeyboardEvent) => {
      if (e.repeat) return;
      console.log('Key up:', e.key);
      
      // Wait for audio config before starting
      if (!audioConfigLoaded) {
        console.log('⏳ Waiting for audio config to load...');
        return;
      }
      
      if (PHONE_CONFIG.recording.offHook.includes(e.code)) {
        if (state === 'idle') {
          startSession();
        }
      }
    };

    // ON HOOK = keydown (button pressed when phone cradled)
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (PHONE_CONFIG.recording.onHook.includes(e.code)) {
        if (state === 'recording' || state === 'intro') {
          endSession();
        }
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state]);

  const playWelcomeMessage = (): Promise<void> => {
    return new Promise((resolve) => {
      const audioUrl = audioConfig.current?.interior_intro || 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/int.phone pre-track.mp3';
      console.log('🎵 Playing INTRO audio:', audioUrl);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => resolve();
      audio.onerror = (err) => {
        console.error('Welcome message failed to play', err);
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
      const audioUrl = audioConfig.current?.interior_outro || 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/int-post recording.mp3';
      console.log('🎵 Playing OUTRO audio:', audioUrl);
      const audio = new Audio(audioUrl);
      
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

      // 2. Play welcome message
      setStatusMessage('Listen to instructions...');
      await playWelcomeMessage();

      // 3. Play beep to signal recording start
      setStatusMessage('Get ready...');
      if (audioManager.current) {
        await audioManager.current.playBeep('recording');
      }

      // 4. Start recording stream
      setStatusMessage('Recording now!');
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
    
    // Use audio/mp4 (AAC) which is supported by iOS
    // Safari doesn't support MP3 encoding, but supports AAC in MP4 container
    const mimeType = 'audio/mp4';
    const recorder = new MediaRecorder(stream, { mimeType });
    
    console.log('Recording with mimeType:', mimeType);
    
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
      
      // Start silence detection
      startSilenceDetection(stream);
    };

    recorder.start(1000); // Slice every second
    mediaRecorder.current = recorder;
  };

  const startSilenceDetection = (stream: MediaStream) => {
    try {
      // Create audio context and analyser
      const ctx = new AudioContext();
      const analyzerNode = ctx.createAnalyser();
      analyzerNode.fftSize = 2048;
      
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyzerNode);
      
      audioContext.current = ctx;
      analyser.current = analyzerNode;
      
      // Monitor audio levels
      const dataArray = new Uint8Array(analyzerNode.frequencyBinCount);
      const SILENCE_THRESHOLD = 10; // Adjust this value based on testing
      const SILENCE_DURATION = 4000; // 4 seconds of silence
      let silenceStart: number | null = null;
      
      silenceCheckInterval.current = setInterval(() => {
        if (!analyser.current) return;
        
        analyzerNode.getByteTimeDomainData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = Math.abs(dataArray[i] - 128);
          sum += normalized;
        }
        const average = sum / dataArray.length;
        
        if (average < SILENCE_THRESHOLD) {
          // Silence detected
          if (silenceStart === null) {
            silenceStart = Date.now();
            console.log('Silence detected, starting timer...');
          } else if (Date.now() - silenceStart >= SILENCE_DURATION) {
            // Silence threshold reached
            console.log('Silence duration exceeded, stopping recording...');
            stopRecordingDueToSilence();
          }
        } else {
          // Sound detected, reset silence timer
          if (silenceStart !== null) {
            console.log('Sound detected, resetting silence timer');
            silenceStart = null;
          }
        }
      }, 100); // Check every 100ms
    } catch (err) {
      console.error('Failed to setup silence detection:', err);
    }
  };

  const stopRecordingDueToSilence = async () => {
    // Clear intervals
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceCheckInterval.current) clearInterval(silenceCheckInterval.current);
    
    setState('processing');
    setStatusMessage('Saving...');

    // Stop local recording
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.onstop = async () => {
        await saveRecordingAndPlayOutro();
      };
      mediaRecorder.current.stop();
    }

    // Stop audio stream
    audioManager.current?.stopRecording();

    // Clean up audio context
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }

    // Notify backend of hook state
    await fetch('/api/phone/hook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: 1, state: 'recording-complete' }),
    }).catch(console.error);
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
      const blob = new Blob(audioChunks.current, { type: 'audio/mp4' });
      
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

      // Upload to unified stories endpoint (triggers transcription pipeline)
      await fetch('/api/stories', {
        method: 'POST',
        body: formData,
      });

      // Play closing message
      setStatusMessage('Thank you!');
      await playClosingMessage();

      resetToIdle();
    } catch (err) {
      console.error('Save failed', err);
      setState('error');
      setTimeout(resetToIdle, 3000);
    }
  };

  const saveRecordingAndPlayOutro = async () => {
    try {
      const blob = new Blob(audioChunks.current, { type: 'audio/mp4' });
      
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

      // Start saving in the background (non-blocking)
      fetch('/api/stories', {
        method: 'POST',
        body: formData,
      }).catch(err => console.error('Background save failed:', err));

      // Play closing message immediately
      setStatusMessage('Thank you!');
      await playClosingMessage();

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
