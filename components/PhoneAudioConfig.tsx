'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioConfig {
  id: number;
  config_key: string;
  audio_url: string;
  display_name: string;
  description: string | null;
  updated_at: string;
}

export default function PhoneAudioConfig() {
  const [configs, setConfigs] = useState<AudioConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/phone-audio');
      const data = await response.json();
      setConfigs(data.configs || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
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

  if (loading) {
    return (
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow">
        <p className="text-gray-600">Loading audio configuration...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Phone Audio Configuration</h2>
        <p className="text-sm text-gray-600">
          Upload and manage intro/outro audio files for both phones. Files will be automatically used in the installation.
        </p>
      </div>

      <div className="space-y-6">
        {configs.map((config) => (
          <div 
            key={config.id} 
            className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {config.display_name}
                </h3>
                {config.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {config.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(config.updated_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => playAudio(config.audio_url)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  playingUrl === config.audio_url
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {playingUrl === config.audio_url ? '⏸️ Stop' : '▶️ Play Current'}
              </button>

              <div className="flex-1">
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
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                    uploading === config.config_key
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {uploading === config.config_key ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Uploading...
                    </>
                  ) : (
                    <>📤 Upload New MP3</>
                  )}
                </label>
              </div>

              <a
                href={config.audio_url}
                download
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                💾 Download
              </a>
            </div>

            <div className="mt-3 p-3 bg-gray-50 rounded text-xs font-mono text-gray-700 break-all">
              {config.audio_url}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Note:</strong> After uploading new audio, the phones will automatically use the updated files. 
          No code changes or restarts required.
        </p>
      </div>
    </div>
  );
}
