'use client';

import { useState, useRef } from 'react';
import { AudioRecorder } from '@/lib/audio';

interface PhoneControlsProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  onPlaybackStart?: () => void;
}

export function PhoneControls({ onRecordingComplete, onPlaybackStart }: PhoneControlsProps) {
  const [phone1Active, setPhone1Active] = useState(false);
  const [phone2Active, setPhone2Active] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Phone 1: Recording
  const handlePhone1Pickup = async () => {
    setPhone1Active(true);
    
    try {
      // Start recording
      recorderRef.current = new AudioRecorder(165); // 2:45 max
      await recorderRef.current.start();
      
      // Update duration counter
      durationIntervalRef.current = setInterval(() => {
        if (recorderRef.current) {
          setRecordingDuration(recorderRef.current.getDuration());
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please grant permission.');
      setPhone1Active(false);
    }
  };

  const handlePhone1Hangup = async () => {
    if (recorderRef.current) {
      try {
        const blob = await recorderRef.current.stop();
        const duration = recorderRef.current.getDuration();
        
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
        
        setPhone1Active(false);
        setRecordingDuration(0);
        
        if (onRecordingComplete) {
          onRecordingComplete(blob, duration);
        }
        
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  };

  // Phone 2: Playback
  const handlePhone2Pickup = async () => {
    setPhone2Active(true);
    
    if (onPlaybackStart) {
      onPlaybackStart();
    }
    
    // Get random story
    try {
      const response = await fetch('/api/stories/random');
      if (response.ok) {
        const story = await response.json();
        
        // Play audio
        const audio = new Audio(story.audio_url);
        audio.play();
        
        // Auto-hangup when finished
        audio.onended = () => {
          setPhone2Active(false);
        };
        
      } else {
        alert('No stories available to play');
        setPhone2Active(false);
      }
    } catch (error) {
      console.error('Error playing story:', error);
      setPhone2Active(false);
    }
  };

  const handlePhone2Hangup = () => {
    setPhone2Active(false);
    // Stop any playing audio
    document.querySelectorAll('audio').forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  };

  return (
    <div className="flex gap-8 p-8">
      {/* Phone 1 - Recording */}
      <div className="flex-1 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif text-soot">Phone 1</h2>
          <p className="text-sm text-soot/70">Share Your Story</p>
        </div>
        
        <div className="bg-cardboard rounded-lg p-8 space-y-4 shadow-lg">
          {!phone1Active ? (
            <button
              onClick={handlePhone1Pickup}
              className="w-full py-6 bg-amber text-white rounded-lg text-lg font-medium hover:bg-amber/90 transition-colors"
            >
              📞 Pick Up Phone
            </button>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">🔴</div>
                <p className="text-lg font-medium text-soot">Recording...</p>
                <p className="text-3xl font-mono text-soot mt-2">
                  {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}
                </p>
                <p className="text-sm text-soot/70 mt-1">
                  Max 2:45
                </p>
              </div>
              
              <button
                onClick={handlePhone1Hangup}
                className="w-full py-6 bg-soot text-white rounded-lg text-lg font-medium hover:bg-soot/90 transition-colors"
              >
                📵 Hang Up
              </button>
            </div>
          )}
        </div>
        
        {!phone1Active && (
          <div className="text-xs text-soot/50 text-center space-y-1">
            <p>• Pick up to record your story</p>
            <p>• Speak for up to 2 minutes 45 seconds</p>
            <p>• Hang up when finished</p>
          </div>
        )}
      </div>

      {/* Phone 2 - Playback */}
      <div className="flex-1 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif text-soot">Phone 2</h2>
          <p className="text-sm text-soot/70">Listen to a Voice</p>
        </div>
        
        <div className="bg-cardboard rounded-lg p-8 space-y-4 shadow-lg">
          {!phone2Active ? (
            <button
              onClick={handlePhone2Pickup}
              className="w-full py-6 bg-teal text-white rounded-lg text-lg font-medium hover:bg-teal/90 transition-colors"
            >
              📞 Pick Up Phone
            </button>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">🔊</div>
                <p className="text-lg font-medium text-soot">Playing story...</p>
              </div>
              
              <button
                onClick={handlePhone2Hangup}
                className="w-full py-6 bg-soot text-white rounded-lg text-lg font-medium hover:bg-soot/90 transition-colors"
              >
                📵 Hang Up
              </button>
            </div>
          )}
        </div>
        
        {!phone2Active && (
          <div className="text-xs text-soot/50 text-center space-y-1">
            <p>• Pick up to hear a random story</p>
            <p>• Listen to someone's memory of loss</p>
            <p>• Hang up when finished</p>
          </div>
        )}
      </div>
    </div>
  );
}
