'use client';

import { useState } from 'react';
import type { Story } from '@/lib/supabase';

interface AdminTableProps {
  initialStories: Story[];
}

export default function AdminTable({ initialStories }: AdminTableProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKeywords, setEditKeywords] = useState<string>('');

  const filteredStories = stories.filter(story => {
    const search = searchTerm.toLowerCase();
    return (
      story.id.toLowerCase().includes(search) ||
      story.transcript?.toLowerCase().includes(search) ||
      story.keywords?.some(k => k.toLowerCase().includes(search))
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search stories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-soot/20 rounded-sm w-96"
        />
        <div className="text-sm text-soot/60">
          {filteredStories.length} of {stories.length} stories
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
              <th className="text-left p-3">Play Count</th>
              <th className="text-left p-3">Consent</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStories.map((story) => (
              <tr key={story.id} className="border-b border-soot/10 hover:bg-cardboard/30">
                <td className="p-3 font-mono text-xs">
                  {story.id.substring(0, 8)}...
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
                        {story.keywords?.slice(0, 3).join(', ') || '-'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingId(story.id);
                          setEditKeywords(story.keywords?.join(', ') || '');
                        }}
                        className="text-xs text-amber hover:underline"
                      >
                        Edit
                      </button>
                    </div>
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
                    <button
                      onClick={() => playAudio(story.audio_url)}
                      className="text-amber hover:underline text-xs"
                    >
                      Play
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
