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
      
      // Show success message
      alert(`Story recorded! Duration: ${duration}s\nStory ID: ${id}`);
      
    } catch (error) {
      console.error('Error uploading recording:', error);
      alert('Error saving recording. Please try again.');
    } finally {
      setUploading(false);
    }
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
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          ✓ Story saved! ID: {storyId}
        </div>
      )}
    </div>
  );
}
