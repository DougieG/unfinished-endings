'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioConfig {
  id: number;
  config_key: string;
  audio_url: string;
  display_name: string;
  description: string | null;
  updated_at: string;
  metadata?: any;
}

export default function PhoneAudioConfig() {
  const [configs, setConfigs] = useState<AudioConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/phone-audio');
      const result = await response.json();
      const data = result.configs || result; // Handle both formats
      setConfigs(data);
    } catch (error) {
      console.error('Failed to fetch audio config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (configKey: string, file: File) => {
    if (!file) return;

    setUploading(configKey);
    try {
      const formData = new FormData();
      formData.append('config_key', configKey);
      formData.append('audio', file);

      const response = await fetch('/api/admin/phone-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Update local state
      setConfigs(prev => prev.map(config => 
        config.config_key === configKey 
          ? { ...config, audio_url: result.config.audio_url, updated_at: result.config.updated_at }
          : config
      ));

      alert('✅ Audio uploaded successfully!');
      
      // Clear file input
      if (fileInputRefs.current[configKey]) {
        fileInputRefs.current[configKey]!.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const playAudio = (url: string) => {
    if (!url) return;
    if (playingUrl === url) {
      // Stop if already playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingUrl(null);
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingUrl(null);
      setPlayingUrl(url);
    }
  };

  const handleDelete = async (configKey: string) => {
    if (!confirm('Delete this audio file? The entry will remain but with no audio.')) {
      return;
    }

    setDeleting(configKey);
    try {
      const response = await fetch(`/api/admin/phone-audio?config_key=${configKey}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      // Update local state
      setConfigs(prev => prev.map(config => 
        config.config_key === configKey 
          ? { ...config, audio_url: '', updated_at: new Date().toISOString() }
          : config
      ));

      alert('✅ Audio deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Delete failed. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow">
        <p className="text-gray-600">Loading audio configuration...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-2xl font-serif text-soot mb-1">Phone Audio Configuration</h2>
        <p className="text-sm text-soot/60">
          Manage intro/outro audio files for both phones
        </p>
      </div>

      <div className="space-y-3">
        {configs.map((config) => {
          const hasAudio = config.audio_url && config.audio_url !== '';
          return (
            <div 
              key={config.id} 
              className="border border-soot/20 rounded p-4 hover:border-soot/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-soot mb-1">
                    {config.display_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-soot/60">
                    <span>
                      {hasAudio ? `Updated ${new Date(config.updated_at).toLocaleDateString()}` : 'No audio uploaded'}
                    </span>
                    {config.description && (
                      <>
                        <span>•</span>
                        <span>{config.description}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasAudio && (
                    <>
                      <button
                        onClick={() => playAudio(config.audio_url)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                          playingUrl === config.audio_url
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        title="Play current audio"
                      >
                        {playingUrl === config.audio_url ? '⏹' : '▶️'}
                      </button>

                      <a
                        href={config.audio_url}
                        download
                        className="px-3 py-1.5 bg-soot/20 hover:bg-soot/30 text-soot rounded text-xs font-medium transition-colors"
                        title="Download audio file"
                      >
                        💾
                      </a>
                    </>
                  )}

                  <input
                    ref={(el) => { fileInputRefs.current[config.config_key] = el; }}
                    type="file"
                    accept="audio/mp3,audio/mpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(config.config_key, file);
                      }
                    }}
                    className="hidden"
                    id={`upload-${config.config_key}`}
                    disabled={uploading === config.config_key}
                  />
                  <label
                    htmlFor={`upload-${config.config_key}`}
                    className={`inline-flex items-center px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                      uploading === config.config_key
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : hasAudio 
                          ? 'bg-amber hover:bg-amber/90 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    title={hasAudio ? 'Replace audio file' : 'Upload audio file'}
                  >
                    {uploading === config.config_key ? '⏳' : hasAudio ? '🔄 Replace' : '📤 Upload'}
                  </label>

                  {hasAudio && (
                    <button
                      onClick={() => handleDelete(config.config_key)}
                      disabled={deleting === config.config_key}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        deleting === config.config_key
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                      title="Delete audio file"
                    >
                      {deleting === config.config_key ? '⏳' : '🗑️'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
        <strong>💡 Note:</strong> Changes take effect immediately—no restart required.
      </div>
    </div>
  );
}
