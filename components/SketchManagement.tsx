'use client';

/**
 * SKETCH MANAGEMENT COMPONENT
 * Upload and attach sketches to stories from admin panel
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WebcamCapture from './WebcamCapture';

interface SketchManagementProps {
  storyId: string;
  currentSketch?: {
    sketch_original_url: string | null;
    sketch_processed_url: string | null;
    sketch_title: string | null;
    sketch_first_name: string | null;
    has_custom_sketch: boolean;
  };
  onSketchUploaded?: () => void;
}

export default function SketchManagement({ 
  storyId, 
  currentSketch,
  onSketchUploaded 
}: SketchManagementProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    uploadFile(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('form_image', file);
      formData.append('story_id', storyId);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const response = await fetch('/api/sketch/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      await response.json();
      
      // Success!
      setTimeout(() => {
        setShowUploadForm(false);
        setIsUploading(false);
        setUploadProgress(0);
        if (onSketchUploaded) onSketchUploaded();
      }, 500);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div>
      {currentSketch?.has_custom_sketch ? (
        // Show existing sketch
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
              ✓ HAS SKETCH
            </span>
            {currentSketch.sketch_title && (
              <span className="text-xs text-soot/60">
                "{currentSketch.sketch_title}"
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <a
              href={currentSketch.sketch_processed_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber hover:underline"
            >
              View Sketch
            </a>
            <button
              onClick={() => setShowUploadForm(true)}
              className="text-xs text-soot/60 hover:text-soot hover:underline"
            >
              Replace
            </button>
          </div>
        </div>
      ) : (
        // No sketch yet
        <button
          onClick={() => setShowUploadForm(true)}
          className="text-xs px-3 py-1 bg-amber/20 text-soot rounded hover:bg-amber/30
                     transition-colors border border-amber/40"
        >
          📤 Upload Sketch
        </button>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isUploading && setShowUploadForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-serif text-soot mb-4">
                Upload Sketch Form
              </h3>
              
              {!isUploading ? (
                <div>
                  <p className="text-sm text-soot/60 mb-6">
                    Upload a photo or scan of the Ending Care Form.
                    The sketch and text will be automatically extracted.
                  </p>
                  
                  {/* Camera and Upload Options */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Camera Button */}
                    <button
                      onClick={() => {
                        setShowUploadForm(false);
                        setShowCamera(true);
                      }}
                      className="border-2 border-dashed border-soot/20 rounded-xl p-6
                                hover:border-amber hover:bg-amber/5 transition-all
                                text-center group"
                    >
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📷</div>
                      <p className="text-sm text-soot font-medium">
                        Use Camera
                      </p>
                    </button>

                    {/* File Upload Button */}
                    <label className="border-2 border-dashed border-soot/20 rounded-xl p-6
                                      hover:border-amber hover:bg-amber/5 transition-all cursor-pointer
                                      text-center group">
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📁</div>
                      <p className="text-sm text-soot font-medium">
                        Choose File
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="w-full mt-4 py-2 text-soot/60 hover:text-soot text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="text-6xl mb-4 inline-block"
                  >
                    🎨
                  </motion.div>
                  
                  <p className="text-lg font-serif text-soot mb-4">
                    Processing form...
                  </p>
                  
                  <div className="h-2 bg-soot/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber"
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  <p className="text-xs text-soot/60 mt-2">
                    Extracting sketch and text with OCR...
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webcam Capture Modal */}
      {showCamera && (
        <WebcamCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
