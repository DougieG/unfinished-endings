'use client';

/**
 * MAGNIFICENT SKETCH UPLOAD & PLAYBACK INTERFACE
 * Upload Ending Care Forms → Extract Sketch → Generate Crankie
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CrankiePlayer from '@/components/CrankiePlayer';
import WebcamCapture from '@/components/WebcamCapture';

interface ExtractedData {
  originalFormUrl: string;
  sketchUrl: string;
  processedSketchUrl: string;
  title: string;
  firstName: string;
  email: string;
  confidence: {
    title: number;
    firstName: number;
    email: number;
  };
  storyId: string | null;
}

type ProcessingStage = 'upload' | 'processing' | 'review' | 'playback';

export default function PicPlaybackPage() {
  const [stage, setStage] = useState<ProcessingStage>('upload');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // Handle camera capture
  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    processFile(file);
  };

  // Process file (from upload or camera)
  const processFile = (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB)');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Upload and process form
  const handleUpload = async () => {
    if (!selectedFile) return;

    setStage('processing');
    setProcessingProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('form_image', selectedFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/sketch/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      setExtractedData(result.data);
      setEditedTitle(result.data.title);
      setEditedFirstName(result.data.firstName);
      setEditedEmail(result.data.email);
      setStage('review');

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStage('upload');
    }
  };

  // Generate crankie from sketch
  const handleGenerateCrankie = async () => {
    if (!extractedData) return;
    
    setStage('playback');
    // In a real implementation, this would trigger Replicate generation
    // For now, we'll just display the sketch as the crankie
  };

  // Reset to start over
  const handleReset = () => {
    setStage('upload');
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setError(null);
    setProcessingProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cardboard via-parchment to-amber/20 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-5xl text-soot mb-4">
            ✨ Visual Reference Playback
          </h1>
          <p className="font-sans text-lg text-soot/70">
            Upload your Ending Care Form to see your drawing come to life
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {['upload', 'processing', 'review', 'playback'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${stage === s ? 'bg-amber text-soot' : 
                    ['upload', 'processing', 'review', 'playback'].indexOf(stage) > i 
                      ? 'bg-soot text-cardboard' 
                      : 'bg-soot/20 text-soot/40'}`}
                >
                  {i + 1}
                </div>
                {i < 3 && (
                  <div className={`w-16 h-1 ${
                    ['upload', 'processing', 'review', 'playback'].indexOf(stage) > i 
                      ? 'bg-soot' 
                      : 'bg-soot/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STAGE 1: Upload */}
          {stage === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="bg-white rounded-2xl shadow-2xl p-12"
            >
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl text-soot mb-2">
                  Upload Your Form
                </h2>
                <p className="text-soot/60">
                  Take a photo or scan your completed Ending Care Form
                </p>
              </div>

              {/* Upload/Camera Buttons */}
              {!previewUrl ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Camera Button */}
                  <button
                    onClick={() => setShowCamera(true)}
                    className="border-4 border-dashed border-soot/20 rounded-xl p-12
                               hover:border-amber hover:bg-amber/5 transition-all
                               flex flex-col items-center justify-center group"
                  >
                    <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">📷</div>
                    <p className="text-xl font-serif text-soot mb-2">
                      Use Camera
                    </p>
                    <p className="text-sm text-soot/60">
                      Take photo now
                    </p>
                  </button>

                  {/* File Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-soot/20 rounded-xl p-12
                               hover:border-amber hover:bg-amber/5 transition-all
                               flex flex-col items-center justify-center group"
                  >
                    <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">📁</div>
                    <p className="text-xl font-serif text-soot mb-2">
                      Choose File
                    </p>
                    <p className="text-sm text-soot/60">
                      Upload JPG or PNG
                    </p>
                  </button>
                </div>
              ) : (
                /* Preview */
                <div className="border-4 border-soot/20 rounded-xl p-8 bg-soot/5">
                  <div className="text-center">
                    <img
                      src={previewUrl}
                      alt="Form preview"
                      className="max-h-96 mx-auto rounded-lg shadow-lg mb-4"
                    />
                    <p className="text-sm text-soot/60 mb-4">
                      📄 {selectedFile?.name}
                    </p>
                    <button
                      onClick={handleReset}
                      className="text-sm text-soot/60 hover:text-soot underline"
                    >
                      ← Choose different file or take new photo
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                  {error}
                </motion.div>
              )}

              {selectedFile && !error && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleUpload}
                  className="w-full mt-8 py-4 bg-amber text-soot rounded-xl font-bold text-lg
                             hover:bg-amber/90 transition-all shadow-lg hover:shadow-xl
                             transform hover:scale-105"
                >
                  🎨 Process Form with AI
                </motion.button>
              )}
            </motion.div>
          )}

          {/* STAGE 2: Processing */}
          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-12"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-8xl mb-8 inline-block"
                >
                  🎨
                </motion.div>
                
                <h2 className="font-serif text-3xl text-soot mb-4">
                  Processing Your Form...
                </h2>
                
                <div className="max-w-md mx-auto">
                  <div className="h-4 bg-soot/10 rounded-full overflow-hidden mb-4">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber to-soot"
                      initial={{ width: 0 }}
                      animate={{ width: `${processingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  
                  <p className="text-soot/60 text-sm">
                    {processingProgress < 30 && 'Extracting sketch...'}
                    {processingProgress >= 30 && processingProgress < 60 && 'Reading text with OCR...'}
                    {processingProgress >= 60 && processingProgress < 90 && 'Processing image...'}
                    {processingProgress >= 90 && 'Almost done!'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: Review Extracted Data */}
          {stage === 'review' && extractedData && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-12"
            >
              <h2 className="font-serif text-3xl text-soot mb-8 text-center">
                ✨ Review Extracted Information
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Sketch Preview */}
                <div>
                  <h3 className="font-serif text-xl text-soot mb-4">
                    Your Sketch
                  </h3>
                  <div className="bg-white border-4 border-soot rounded-xl p-4">
                    <img
                      src={extractedData.processedSketchUrl}
                      alt="Extracted sketch"
                      className="w-full rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-soot/60 mt-2 text-center">
                    Processed silhouette (ready for crankie)
                  </p>
                </div>

                {/* Extracted Text Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-soot mb-2">
                      Title {extractedData.confidence.title < 0.7 && '⚠️ Low confidence'}
                    </label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-soot/20 rounded-lg
                                 focus:border-amber focus:outline-none font-serif text-lg"
                      placeholder="Title of your drawing"
                    />
                    <p className="text-xs text-soot/60 mt-1">
                      Confidence: {Math.round(extractedData.confidence.title * 100)}%
                      {extractedData.confidence.title < 0.7 && ' - Please verify'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-soot mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editedFirstName}
                      onChange={(e) => setEditedFirstName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-soot/20 rounded-lg
                                 focus:border-amber focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-soot mb-2">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-soot/20 rounded-lg
                                 focus:border-amber focus:outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="pt-4 border-t border-soot/10">
                    <button
                      onClick={handleGenerateCrankie}
                      className="w-full py-4 bg-amber text-soot rounded-xl font-bold text-lg
                                 hover:bg-amber/90 transition-all shadow-lg hover:shadow-xl
                                 transform hover:scale-105"
                    >
                      🎬 Create Shadow Puppet Show
                    </button>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full py-2 text-soot/60 hover:text-soot text-sm"
                  >
                    ← Start over with different form
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: Playback */}
          {stage === 'playback' && extractedData && (
            <motion.div
              key="playback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-3xl text-soot mb-2">
                    {editedTitle || 'Your Shadow Puppet Story'}
                  </h2>
                  {editedFirstName && (
                    <p className="text-soot/60">by {editedFirstName}</p>
                  )}
                </div>

                {/* Crankie Player with sketch as single frame */}
                <CrankiePlayer
                  panorama={{
                    scenes: [{
                      sequence: 1,
                      image_url: extractedData.processedSketchUrl,
                      beat: {
                        moment: editedTitle || 'Your memory',
                        mood: 'contemplative',
                        timestamp_percent: 0.5
                      }
                    }],
                    total_width: 1024,
                    scroll_duration: 10,
                    generated_at: Date.now()
                  }}
                  autoPlay={false}
                  hideControls={false}
                />
              </div>

              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-soot text-cardboard rounded-xl font-bold
                             hover:bg-soot/90 transition-all"
                >
                  ← Upload Another Form
                </button>
              </div>
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
    </div>
  );
}
