'use client';

import { useEffect, useState, useRef } from 'react';
import { PhoneAudioManager } from '@/lib/phone-audio';
import { PHONE_CONFIG } from '@/lib/phone-config';
import { getPhoneAudioConfig, type PhoneAudioConfig } from '@/lib/phone-audio-config';
import { getUploadQueue } from '@/lib/upload-queue';
import { validateAudioBlob, isOnline } from '@/lib/upload-validator';

type StationState = 'idle' | 'intro' | 'recording' | 'processing' | 'ringing' | 'outro' | 'error' | 'queued';

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
  const ringAudio = useRef<HTMLAudioElement | null>(null);

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
    if (ringAudio.current) {
      ringAudio.current.pause();
      ringAudio.current = null;
    }
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
      
      // Wait for audio config before starting (check ref, not state)
      if (!audioConfig.current) {
        console.log('⏳ Waiting for audio config to load...');
        return;
      }
      
      if (PHONE_CONFIG.recording.offHook.includes(e.code)) {
        if (state === 'idle') {
          startSession();
        } else if (state === 'ringing') {
          // Answer the ringing phone to hear outro
          answerForOutro();
        }
      }
    };

    // ON HOOK = keydown (button pressed when phone cradled)
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (PHONE_CONFIG.recording.onHook.includes(e.code)) {
        if (state === 'recording' || state === 'intro') {
          endSession();
        } else if (state === 'outro') {
          // Hang up after outro completes
          resetToIdle();
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
    return new Promise(async (resolve) => {
      const audioUrl = audioConfig.current?.interior_intro || 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/int.phone pre-track.mp3';
      console.log('🎵 Playing INTRO audio:', audioUrl);
      
      try {
        // Try to play through Phone 1 (Recording Phone)
        console.log('Attempting to play through Phone 1 device...');
        await audioManager.current?.playThroughRecordingPhone(audioUrl);
        console.log('✅ Intro finished playing');
        resolve();
      } catch (err) {
        console.warn('⚠️ Phone device playback failed, falling back to browser audio:', err);
        
        // Fallback: play through browser audio
        const audio = new Audio(audioUrl);
        audio.onended = () => resolve();
        audio.onerror = () => {
          console.error('❌ Browser audio also failed');
          resolve(); // Continue anyway
        };
        
        audio.play().catch(playErr => {
          console.error('❌ Audio play failed:', playErr);
          resolve();
        });
      }
    });
  };

  const playClosingMessage = (): Promise<void> => {
    return new Promise(async (resolve) => {
      const audioUrl = audioConfig.current?.interior_outro || 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/int-post recording.mp3';
      console.log('🎵 Playing OUTRO audio:', audioUrl);
      
      try {
        // Try to play through Phone 1 (Recording Phone)
        console.log('Attempting to play through Phone 1 device...');
        await audioManager.current?.playThroughRecordingPhone(audioUrl);
        console.log('✅ Outro finished playing');
        resolve();
      } catch (err) {
        console.warn('⚠️ Phone device playback failed, falling back to browser audio:', err);
        
        // Fallback: play through browser audio
        const audio = new Audio(audioUrl);
        audio.onended = () => resolve();
        audio.onerror = () => {
          console.error('❌ Browser audio also failed');
          resolve(); // Continue anyway
        };
        
        audio.play().catch(playErr => {
          console.error('❌ Audio play failed:', playErr);
          resolve();
        });
      }
    });
  };

  const startRinging = async () => {
    console.log('📞 Phone is ringing...');
    setState('ringing');
    setStatusMessage('Phone is ringing - pick up to hear message');
    
    // Play ring tone on loop through iPad speakers (NOT phone device)
    const ringUrl = audioConfig.current?.ring_tone || 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/phone-ring.mp3';
    console.log('🔔 Playing RING through iPad/laptop speakers (NOT phone):', ringUrl);
    
    ringAudio.current = new Audio(ringUrl);
    ringAudio.current.loop = true;
    ringAudio.current.volume = 1.0; // Full volume for iPad speakers
    
    // CRITICAL: Force ring to play through default system speakers, NOT phone device
    // This prevents the browser from routing the ring to the phone handset
    try {
      // Check if setSinkId is supported (Chrome/Edge)
      if ('setSinkId' in ringAudio.current) {
        // Set to empty string = default system speakers
        await (ringAudio.current as any).setSinkId('');
        console.log('✅ Ring explicitly set to use default system speakers');
      } else {
        console.log('⚠️ setSinkId not supported, ring will use browser default');
      }
    } catch (err) {
      console.warn('⚠️ Could not set sink ID:', err);
    }
    
    ringAudio.current.oncanplaythrough = () => {
      console.log('✅ Ring audio loaded and ready');
    };
    
    ringAudio.current.onerror = (err) => {
      console.error('❌ Ring audio failed to load:', err);
    };
    
    ringAudio.current.play()
      .then(() => {
        console.log('✅ Ring playing through system speakers!');
      })
      .catch(err => {
        console.error('❌ Ring playback failed:', err);
        console.log('Autoplay might be blocked - ring will show visually');
      });
  };

  const answerForOutro = async () => {
    console.log('📞 Answered ringing phone - playing outro...');
    
    // Stop ring
    if (ringAudio.current) {
      ringAudio.current.pause();
      ringAudio.current = null;
    }
    
    setState('outro');
    setStatusMessage('Playing message...');
    
    // Play outro message
    await playClosingMessage();
    
    // After outro plays, user can hang up
    setStatusMessage('Thank you! Hang up when ready.');
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
      
      // ===== BULLETPROOF SILENCE DETECTION SETTINGS =====
      // ENABLE/DISABLE: Set to false to completely disable auto-stop
      const SILENCE_DETECTION_ENABLED = false; // DISABLED until we debug the issue
      
      if (!SILENCE_DETECTION_ENABLED) {
        console.log('⚠️ SILENCE DETECTION DISABLED - recording will only stop on manual hangup');
      }
      
      // SILENCE_THRESHOLD: Higher = less sensitive (ignores quiet speech/breathing)
      // Set HIGH to avoid stopping during natural pauses, quiet speech, thinking
      const SILENCE_THRESHOLD = 35; // Very conservative - only true silence triggers
      
      // SILENCE_DURATION: How long of complete silence before auto-stop (milliseconds)
      // Set LONG to allow for long thinking pauses, emotional moments
      const SILENCE_DURATION = 10000; // 10 seconds of complete silence
      
      // MINIMUM_RECORDING_TIME: Don't check for silence until this much time has passed
      // Prevents premature stopping if someone starts quietly or pauses early
      const MINIMUM_RECORDING_TIME = 15000; // 15 seconds - let them get started
      
      let silenceStart: number | null = null;
      const recordingStartTime = Date.now();
      
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
        const recordingDuration = Date.now() - recordingStartTime;
        
        // MASTER KILL SWITCH: If disabled, just monitor but never stop
        if (!SILENCE_DETECTION_ENABLED) {
          // Log volume levels but don't trigger any stops
          return;
        }
        
        // BULLETPROOF: Don't check for silence until minimum recording time has passed
        if (recordingDuration < MINIMUM_RECORDING_TIME) {
          return; // Let them record freely for the first 15 seconds
        }
        
        if (average < SILENCE_THRESHOLD) {
          // Silence detected
          if (silenceStart === null) {
            silenceStart = Date.now();
            console.log(`🔇 Silence detected (volume: ${average.toFixed(2)} < ${SILENCE_THRESHOLD}), starting ${SILENCE_DURATION/1000}s timer... [Recording: ${Math.floor(recordingDuration/1000)}s]`);
          } else {
            const elapsed = Date.now() - silenceStart;
            if (elapsed >= SILENCE_DURATION) {
              // Silence threshold reached
              console.log(`⏹️ Silence duration exceeded (${elapsed/1000}s >= ${SILENCE_DURATION/1000}s), stopping recording... [Total: ${Math.floor(recordingDuration/1000)}s]`);
              stopRecordingDueToSilence();
            }
          }
        } else {
          // Sound detected, reset silence timer
          if (silenceStart !== null) {
            const elapsed = Date.now() - silenceStart;
            console.log(`🔊 Sound detected (volume: ${average.toFixed(2)} > ${SILENCE_THRESHOLD}), resetting timer after ${(elapsed/1000).toFixed(1)}s [Recording: ${Math.floor(recordingDuration/1000)}s]`);
            silenceStart = null;
          }
        }
      }, 100); // Check every 100ms
    } catch (err) {
      console.error('Failed to setup silence detection:', err);
    }
  };

  const stopRecordingDueToSilence = async () => {
    console.log('🛑 Stopping recording due to silence...');
    
    // Clear intervals
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceCheckInterval.current) {
      clearInterval(silenceCheckInterval.current);
      silenceCheckInterval.current = null;
    }
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
    
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
    console.log('📴 Manual hangup - stopping recording...');
    
    // Clear all timers and intervals
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceCheckInterval.current) {
      clearInterval(silenceCheckInterval.current);
      silenceCheckInterval.current = null;
    }
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
    
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
    
    // Clean up audio context
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }

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
      
      console.log('💾 Saving recording:', {
        size: blob.size,
        sizeKB: Math.round(blob.size / 1024),
        type: blob.type,
        online: isOnline()
      });
      
      // BULLETPROOF: Validate before upload
      const validation = await validateAudioBlob(blob);
      if (!validation.valid) {
        console.error('❌ Validation failed:', validation.errors);
        setState('error');
        setStatusMessage(validation.errors[0] || 'Recording invalid');
        setTimeout(resetToIdle, 5000);
        return;
      }
      
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Validation warnings:', validation.warnings);
      }

      // BULLETPROOF: Use upload queue for guaranteed delivery
      const uploadQueue = getUploadQueue();
      const uploadId = await uploadQueue.enqueue(blob, sessionId.current);
      
      console.log(`📦 Recording queued for upload: ${uploadId}`);
      
      // Check queue status
      const queueStatus = uploadQueue.getStatus();
      console.log('📊 Queue status:', queueStatus);
      
      if (!isOnline()) {
        setState('queued');
        setStatusMessage('Saved offline. Will upload when connected.');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Recording saved! Now make phone ring for outro
      setStatusMessage('Recording saved!');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
      startRinging();
    } catch (err) {
      console.error('❌ Save failed:', err);
      setState('error');
      setStatusMessage(err instanceof Error ? err.message : 'Upload failed. Will retry automatically.');
      setTimeout(resetToIdle, 5000);
    }
  };

  const saveRecordingAndPlayOutro = async () => {
    try {
      const blob = new Blob(audioChunks.current, { type: 'audio/mp4' });
      
      console.log('💾 Saving recording (background):', {
        size: blob.size,
        sizeKB: Math.round(blob.size / 1024),
        type: blob.type,
        online: isOnline()
      });
      
      // BULLETPROOF: Validate before upload
      const validation = await validateAudioBlob(blob);
      if (!validation.valid) {
        console.error('❌ Validation failed:', validation.errors);
        setState('error');
        setStatusMessage(validation.errors[0] || 'Recording invalid');
        setTimeout(resetToIdle, 5000);
        return;
      }

      // BULLETPROOF: Use upload queue (non-blocking)
      const uploadQueue = getUploadQueue();
      uploadQueue.enqueue(blob, sessionId.current).then(uploadId => {
        console.log(`📦 Recording queued (background): ${uploadId}`);
      }).catch(err => {
        console.error('❌ Queue failed:', err);
      });

      // Recording saved in background! Now make phone ring for outro
      setStatusMessage('Recording saved!');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
      startRinging();
    } catch (err) {
      console.error('❌ Save failed:', err);
      setState('error');
      setStatusMessage(err instanceof Error ? err.message : 'Upload failed. Will retry automatically.');
      setTimeout(resetToIdle, 5000);
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
          {state === 'ringing' && <span className="text-green-400 animate-pulse">📞 Ringing... Pick up!</span>}
          {state === 'outro' && <span className="text-green-300">Playing message...</span>}
          {state === 'queued' && <span className="text-yellow-400">Queued (offline)</span>}
          {state === 'error' && <span className="text-red-600">Error</span>}
        </div>

        <div className="text-xl text-gray-600 max-w-md mx-auto">
          {statusMessage}
        </div>

        {/* Test Ring Button */}
        {state === 'idle' && (
          <button
            onClick={async () => {
              const ringUrl = audioConfig.current?.ring_tone || 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/phone-ring.mp3';
              console.log('🧪 TEST: Playing ring through system speakers (NOT phone)');
              const testAudio = new Audio(ringUrl);
              testAudio.volume = 1.0;
              
              // Force to system speakers
              try {
                if ('setSinkId' in testAudio) {
                  await (testAudio as any).setSinkId('');
                  console.log('✅ TEST: Set to system speakers');
                }
              } catch (err) {
                console.warn('⚠️ TEST: setSinkId failed:', err);
              }
              
              testAudio.play()
                .then(() => console.log('✅ TEST: Ring playing through system speakers!'))
                .catch(err => console.error('❌ TEST: Failed:', err));
            }}
            className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            🔔 Test Ring Sound
          </button>
        )}
      </div>
    </main>
  );
}
