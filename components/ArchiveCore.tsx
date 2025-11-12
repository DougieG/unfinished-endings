'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioRecorder } from '@/lib/audio';
import ArchiveCard from './ArchiveCard';

const MAX_DURATION = 165; // 2:45 in seconds

export default function ArchiveCore() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const recorder = new AudioRecorder(MAX_DURATION);
      await recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      setDuration(0);

      // Update duration every second
      timerRef.current = setInterval(() => {
        if (recorderRef.current) {
          const d = recorderRef.current.getDuration();
          setDuration(d);

          if (d >= MAX_DURATION) {
            stopRecording();
          }
        }
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      console.error(err);
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const blob = await recorderRef.current.stop();
      setIsRecording(false);
      setIsUploading(true);

      // Upload to server
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const response = await fetch('/api/stories', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }

      const data = await response.json();
      setStoryId(data.id);
      setIsUploading(false);

    } catch (err: any) {
      setError(err.message || 'Failed to save recording');
      setIsUploading(false);
      console.error(err);
    }

    recorderRef.current = null;
  };

  const reset = () => {
    setStoryId(null);
    setDuration(0);
    setShowCard(false);
    setError(null);
  };

  const progress = (duration / MAX_DURATION) * 100;
  const timeRemaining = MAX_DURATION - duration;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-teal/10">
      <AnimatePresence mode="wait">
        {!isRecording && !isUploading && !storyId && !showCard && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-lg"
          >
            <h2 className="text-4xl font-serif text-soot mb-4">
              Archive Core
            </h2>
            <p className="text-lg font-sans text-soot/70 mb-8">
              Press to add your tale to our archive. You have 2 minutes and 45 seconds.
              By recording, you consent to others witnessing it.
            </p>

            {error && (
              <div className="mb-4 p-4 bg-amber/20 text-soot rounded">
                {error}
              </div>
            )}

            <button
              onClick={startRecording}
              className="px-12 py-6 bg-amber text-soot font-sans text-xl rounded-sm
                         hover:bg-amber/90 transition-all duration-400
                         hover:scale-[1.02] active:scale-[0.98]"
            >
              Press 1 to Record
            </button>
          </motion.div>
        )}

        {isRecording && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="relative w-64 h-64 mb-8">
              {/* Progress ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="#E8DCC4"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="#F4A259"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  strokeLinecap="round"
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-serif text-soot mb-2">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-soot/60 font-sans">remaining</div>
              </div>
            </div>

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mb-8"
            >
              <div className="w-4 h-4 bg-amber rounded-full mx-auto" />
            </motion.div>

            <button
              onClick={stopRecording}
              className="px-8 py-3 bg-soot text-cardboard font-sans rounded-sm
                         hover:bg-soot/90 transition-all duration-400"
            >
              Stop & Submit
            </button>
          </motion.div>
        )}

        {isUploading && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="text-2xl font-serif text-soot mb-4">
              Saving your tale...
            </div>
            <div className="w-16 h-16 border-4 border-soot/20 border-t-soot rounded-full animate-spin mx-auto" />
          </motion.div>
        )}

        {storyId && !showCard && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-lg"
          >
            <h3 className="text-3xl font-serif text-soot mb-4">
              Thank you
            </h3>
            <p className="text-lg font-sans text-soot/70 mb-8">
              Your tale has been added to our archive. Others will witness it in time.
            </p>

            <div className="space-x-4">
              <button
                onClick={() => setShowCard(true)}
                className="px-6 py-3 bg-amber text-soot font-sans rounded-sm
                           hover:bg-amber/90 transition-all duration-400"
              >
                Generate Archive Card
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 bg-soot/20 text-soot font-sans rounded-sm
                           hover:bg-soot/30 transition-all duration-400"
              >
                Record Another
              </button>
            </div>
          </motion.div>
        )}

        {showCard && storyId && (
          <motion.div
            key="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl"
          >
            <ArchiveCard storyId={storyId} onClose={reset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
