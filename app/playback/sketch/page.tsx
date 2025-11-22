'use client';

/**
 * SIMPLIFIED SKETCH UPLOAD
 * No OCR - user enters text manually
 * Fast and simple: upload → extract sketch → done in ~5 seconds
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CrankiePlayer from '@/components/CrankiePlayer';

interface UploadResult {
  originalFormUrl: string;
  sketchUrl: string;
  processedSketchUrl: string;
  title: string;
  firstName: string;
  email: string;
  storyId: string | null;
}

type Stage = 'upload' | 'processing' | 'form' | 'playback';

export default function SimplifiedSketchPage() {
  const [stage, setStage] = useState<Stage>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  
  // Manual entry fields
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB)');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setStage('processing');

    try {
      const formData = new FormData();
      formData.append('form_image', selectedFile);
      formData.append('title', title);
      formData.append('first_name', firstName);
      formData.append('email', email);

      console.log('📤 Uploading to v2 endpoint...');
      
      const response = await fetch('/api/sketch/upload-v2', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'Upload failed';
          console.error('Server error:', errorData);
        } catch (e) {
          // Response wasn't JSON - probably HTML error page
          const text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 200));
          errorMessage = `Server error (${response.status}): Check function logs`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Upload successful:', data);

      setResult(data.data);
      setStage('playback');

    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      setStage('upload');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setStage('upload');
    setSelectedFile(null);
    setPreview('');
    setResult(null);
    setTitle('');
    setFirstName('');
    setEmail('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        
        {/* Upload Stage */}
        {stage === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cardboard rounded-lg shadow-lg p-8"
          >
            <h1 className="text-3xl font-bold text-soot mb-2">
              Upload Your Sketch
            </h1>
            <p className="text-soot/70 mb-6">
              Simple and fast - just upload the image and enter the details
            </p>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block w-full">
                <div className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors
                  ${selectedFile 
                    ? 'border-teal bg-teal/5' 
                    : 'border-soot/30 hover:border-teal hover:bg-teal/5'
                  }
                `}>
                  {preview ? (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-64 mx-auto rounded"
                    />
                  ) : (
                    <>
                      <div className="text-4xl mb-2">📁</div>
                      <div className="text-soot font-medium">
                        Click to upload image
                      </div>
                      <div className="text-sm text-soot/60 mt-1">
                        JPG or PNG, max 10MB
                      </div>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Manual Entry Fields */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 mb-6"
              >
                <div>
                  <label className="block text-sm font-medium text-soot mb-1">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title..."
                    className="w-full px-4 py-2 rounded border border-soot/20 focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-soot mb-1">
                    First Name (optional)
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name..."
                    className="w-full px-4 py-2 rounded border border-soot/20 focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-soot mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email..."
                    className="w-full px-4 py-2 rounded border border-soot/20 focus:border-teal focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-teal hover:bg-teal/90 disabled:bg-soot/20 text-canvas font-medium py-3 rounded-lg transition-colors"
              >
                {uploading ? '⏳ Processing...' : '🚀 Upload & Create'}
              </button>
            )}
          </motion.div>
        )}

        {/* Processing Stage */}
        {stage === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-cardboard rounded-lg shadow-lg p-12 text-center"
          >
            <div className="text-6xl mb-4 animate-spin">🎨</div>
            <h2 className="text-2xl font-bold text-soot mb-2">
              Processing...
            </h2>
            <p className="text-soot/70">
              Extracting your sketch (no OCR - much faster!)
            </p>
          </motion.div>
        )}

        {/* Playback Stage */}
        {stage === 'playback' && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-cardboard rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-soot mb-4">
                {result.title || 'Your Shadow Puppet Show'}
              </h2>
              
              <CrankiePlayer
                panorama={{
                  scenes: [{
                    sequence: 0,
                    image_url: result.processedSketchUrl,
                    beat: {
                      moment: 'memory',
                      mood: 'peaceful',
                      timestamp_percent: 0
                    }
                  }],
                  total_width: 1024,
                  scroll_duration: 5
                }}
                autoPlay={true}
              />

              <div className="mt-4 flex gap-2">
                <button
                  onClick={reset}
                  className="flex-1 bg-soot/10 hover:bg-soot/20 text-soot font-medium py-2 rounded transition-colors"
                >
                  Upload Another
                </button>
                <a
                  href={result.processedSketchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-teal hover:bg-teal/90 text-canvas text-center font-medium py-2 rounded transition-colors"
                >
                  Download Sketch
                </a>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
