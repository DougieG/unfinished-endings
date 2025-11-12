'use client';

import { useState } from 'react';
import { PhoneControls } from './PhoneControls';
import { uploadAudio } from '@/lib/audio';

export function PhoneRecorder() {
  const [uploading, setUploading] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    setUploading(true);
    
    try {
      // Upload to Supabase via API
      const filename = `phone-${Date.now()}.webm`;
      const id = await uploadAudio(blob, filename);
      
      setStoryId(id);
      
    } catch (error) {
      console.error('Error uploading recording:', error);
      alert('Error saving recording. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const viewStory = () => {
    if (storyId) {
      window.open(`/story/${storyId}`, '_blank');
    }
  };

  const closeNotification = () => {
    setStoryId(null);
  };

  const handlePlaybackStart = () => {
    console.log('Starting playback of random story');
  };

  return (
    <div className="space-y-8">
      <PhoneControls
        onRecordingComplete={handleRecordingComplete}
        onPlaybackStart={handlePlaybackStart}
      />
      
      {uploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-lg font-medium">Saving your story...</p>
          </div>
        </div>
      )}
      
      {storyId && !uploading && (
        <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-2xl p-6 max-w-md border-2 border-green-500">
          <div className="flex items-start gap-4">
            <div className="text-3xl">✓</div>
            <div className="flex-1">
              <h3 className="text-lg font-serif text-soot mb-2">Story Saved!</h3>
              <p className="text-sm text-soot/70 mb-4">
                Your story is being processed. Shadow puppet will be ready in ~1 minute.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={viewStory}
                  className="px-4 py-2 bg-teal text-white rounded hover:bg-teal/90 transition-colors text-sm font-medium"
                >
                  View Story →
                </button>
                <button
                  onClick={closeNotification}
                  className="px-4 py-2 bg-soot/10 text-soot rounded hover:bg-soot/20 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
