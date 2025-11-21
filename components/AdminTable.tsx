'use client';

import { useState, useRef } from 'react';
import type { Story } from '@/lib/supabase';

interface AdminTableProps {
  initialStories: Story[];
}

export default function AdminTable({ initialStories }: AdminTableProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKeywords, setEditKeywords] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredStories = stories.filter(story => {
    const search = searchTerm.toLowerCase();
    const keywordsArray = Array.isArray(story.keywords) ? story.keywords : [];
    return (
      story.id.toLowerCase().includes(search) ||
      story.transcript?.toLowerCase().includes(search) ||
      keywordsArray.some(k => k.toLowerCase().includes(search))
    );
  });

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  const toggleConsent = async (id: string, currentConsent: boolean) => {
    const response = await fetch(`/api/admin/stories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: !currentConsent }),
    });

    if (response.ok) {
      setStories(stories.map(s => 
        s.id === id ? { ...s, consent: !currentConsent } : s
      ));
    }
  };

  const redactTranscript = async (id: string) => {
    if (!confirm('Redact transcript and keywords? This cannot be undone.')) return;

    const response = await fetch(`/api/admin/stories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: null, keywords: null }),
    });

    if (response.ok) {
      setStories(stories.map(s => 
        s.id === id ? { ...s, transcript: null, keywords: null } : s
      ));
    }
  };

  const deleteStory = async (id: string) => {
    if (!confirm('Delete this story permanently?')) return;

    const response = await fetch(`/api/admin/stories/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setStories(stories.filter(s => s.id !== id));
    }
  };

  const regenerateStory = async (id: string) => {
    if (!confirm('Re-generate transcript, keywords, and crankie visuals? This may take 60-90 seconds.')) return;

    const response = await fetch(`/api/transcribe/${id}`, {
      method: 'POST',
    });

    if (response.ok) {
      alert('Re-generation started! Refresh the page in 60-90 seconds to see results.');
    } else {
      alert('Failed to start re-generation. Check console for errors.');
    }
  };

  const updateKeywords = async (id: string) => {
    const keywords = editKeywords.split(',').map(k => k.trim()).filter(Boolean);

    const response = await fetch(`/api/admin/stories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords }),
    });

    if (response.ok) {
      setStories(stories.map(s => 
        s.id === id ? { ...s, keywords } : s
      ));
      setEditingId(null);
    }
  };

  const convertWebMStories = async () => {
    if (!confirm('DELETE all WebM audio files from database? This cannot be undone. Only iOS-compatible MP4 stories will remain.')) {
      return;
    }

    setConverting(true);
    try {
      const response = await fetch('/api/convert-audio', {
        method: 'POST',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to flag stories');
      }

      alert(`Deleted ${result.deleted} WebM stories. ${result.note}`);
      // Reload page to show updated stories
      window.location.reload();
    } catch (err) {
      console.error('Error flagging stories:', err);
      alert('Failed to flag stories: ' + (err as Error).message);
    } finally {
      setConverting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('audio', file);

        const response = await fetch('/api/stories', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();
        console.log(`Uploaded ${file.name}, story ID: ${result.id}`);
      }

      alert(`Successfully uploaded ${files.length} file(s)! Transcription and crankie generation started.`);
      window.location.reload();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full max-w-7xl">
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/mp4,audio/m4a"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className={`px-6 py-2 rounded-md font-medium cursor-pointer ${
              uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {uploading ? 'Uploading...' : '📤 Upload MP3'}
          </label>
          <button
            onClick={convertWebMStories}
            disabled={converting}
            className={`px-6 py-2 rounded-md font-medium ${
              converting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {converting ? 'Deleting...' : '🗑️ Delete WebM Stories'}
          </button>
          <div className="text-sm text-soot/60">
            {filteredStories.length} of {stories.length} stories
          </div>
        </div>
        <div className="text-xs text-soot/60">
          💡 Upload MP3/M4A files to automatically transcribe and generate crankies
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-soot/20">
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Created</th>
              <th className="text-left p-3">Source</th>
              <th className="text-left p-3">Duration</th>
              <th className="text-left p-3">Keywords</th>
              <th className="text-left p-3">Crankie</th>
              <th className="text-left p-3">Play Count</th>
              <th className="text-left p-3">Consent</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStories.map((story) => (
              <tr key={story.id} className="border-b border-soot/10 hover:bg-cardboard/30">
                <td className="p-3 font-mono text-xs">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(story.id);
                      alert('Story ID copied!');
                    }}
                    className="text-left hover:text-teal hover:underline cursor-pointer"
                    title="Click to copy full ID"
                  >
                    {story.id.substring(0, 8)}...
                  </button>
                </td>
                <td className="p-3">
                  {new Date(story.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-soot/10 rounded text-xs">
                    {story.source}
                  </span>
                </td>
                <td className="p-3">
                  {story.duration_s ? `${Math.floor(story.duration_s / 60)}:${(story.duration_s % 60).toString().padStart(2, '0')}` : '-'}
                </td>
                <td className="p-3">
                  {editingId === story.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editKeywords}
                        onChange={(e) => setEditKeywords(e.target.value)}
                        className="px-2 py-1 border border-soot/20 rounded text-xs w-48"
                        placeholder="keyword1, keyword2..."
                      />
                      <button
                        onClick={() => updateKeywords(story.id)}
                        className="text-xs text-amber hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-soot/60 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-soot/60">
                        {(() => {
                          if (!story.keywords) return '-';
                          const kw = Array.isArray(story.keywords) ? story.keywords : [story.keywords];
                          return kw.slice(0, 3).join(', ');
                        })()}
                      </span>
                      <button
                        onClick={() => {
                          setEditingId(story.id);
                          const kw = Array.isArray(story.keywords) ? story.keywords : [story.keywords];
                          setEditKeywords(kw.join(', ') || '');
                        }}
                        className="text-xs text-amber hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {story.panorama ? (
                    <span className="text-xs text-green-600">
                      ✓ {story.panorama.scenes?.length || 0} scenes
                    </span>
                  ) : (
                    <span className="text-xs text-soot/40">-</span>
                  )}
                </td>
                <td className="p-3">{story.play_count}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleConsent(story.id, story.consent)}
                    className={`px-2 py-1 rounded text-xs ${
                      story.consent
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {story.consent ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <a
                      href={`/story/${story.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal hover:underline text-xs font-medium"
                    >
                      View
                    </a>
                    <button
                      onClick={() => playAudio(story.audio_url)}
                      className="text-amber hover:underline text-xs"
                    >
                      Play
                    </button>
                    <button
                      onClick={() => regenerateStory(story.id)}
                      className="text-purple-600 hover:underline text-xs font-medium"
                      title="Re-generate transcript, keywords, and crankie visuals"
                    >
                      Re-gen
                    </button>
                    {story.transcript && (
                      <button
                        onClick={() => redactTranscript(story.id)}
                        className="text-orange-600 hover:underline text-xs"
                      >
                        Redact
                      </button>
                    )}
                    <button
                      onClick={() => deleteStory(story.id)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12 text-soot/40">
          No stories found
        </div>
      )}
    </div>
  );
}
