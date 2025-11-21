'use client';

/**
 * WEBCAM CAPTURE COMPONENT
 * Capture photos directly from device camera for form upload
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WebcamCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export default function WebcamCapture({ onCapture, onCancel }: WebcamCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isFrontCamera]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsReady(false);

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment', // Back camera preferred
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError(
        'Camera access denied. Please allow camera permissions or use file upload instead.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageDataUrl);

    // Stop camera preview
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = async () => {
    if (!capturedImage) return;

    // Convert data URL to File
    const response = await fetch(capturedImage);
    const blob = await response.blob();
    const file = new File(
      [blob], 
      `ending-care-form-${Date.now()}.jpg`, 
      { type: 'image/jpeg' }
    );

    onCapture(file);
  };

  const flipCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Camera View or Captured Preview */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {!capturedImage ? (
          <>
            {/* Live camera feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Camera not ready overlay */}
            {!isReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-6xl"
                >
                  📸
                </motion.div>
              </div>
            )}

            {/* Guides overlay */}
            {isReady && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Center guide lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[80%] max-w-2xl aspect-[8.5/11] border-4 border-amber/60 rounded-lg">
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {/* Rule of thirds grid */}
                      {[...Array(2)].map((_, i) => (
                        <div key={`v${i}`} className="border-r border-white/20" />
                      ))}
                      {[...Array(2)].map((_, i) => (
                        <div key={`h${i}`} className="border-b border-white/20" />
                      ))}
                    </div>
                    <div className="absolute top-2 left-2 right-2 text-center">
                      <p className="text-white text-sm bg-black/60 px-3 py-1 rounded inline-block">
                        📄 Align form within guides
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Preview captured image
          <img
            src={capturedImage}
            alt="Captured form"
            className="w-full h-full object-contain bg-black"
          />
        )}

        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-8">
            <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6 max-w-md text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-white text-black rounded-lg font-bold"
              >
                Use File Upload Instead
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      {!error && (
        <div className="bg-black/90 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-4xl mx-auto p-6">
            {!capturedImage ? (
              // Camera controls
              <div className="flex items-center justify-between gap-4">
                {/* Cancel */}
                <button
                  onClick={onCancel}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg font-bold
                           hover:bg-white/20 transition-all"
                >
                  ✕ Cancel
                </button>

                {/* Capture button */}
                <button
                  onClick={capturePhoto}
                  disabled={!isReady}
                  className={`w-20 h-20 rounded-full border-4 flex items-center justify-center
                             transition-all transform ${
                               isReady
                                 ? 'border-white bg-white/20 hover:scale-110 active:scale-95'
                                 : 'border-white/20 bg-white/10 cursor-not-allowed'
                             }`}
                >
                  <div className="w-14 h-14 rounded-full bg-white" />
                </button>

                {/* Flip camera */}
                <button
                  onClick={flipCamera}
                  disabled={!isReady}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg font-bold
                           hover:bg-white/20 transition-all disabled:opacity-50"
                >
                  🔄 Flip
                </button>
              </div>
            ) : (
              // Preview controls
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={retakePhoto}
                  className="px-8 py-4 bg-white/10 text-white rounded-xl font-bold text-lg
                           hover:bg-white/20 transition-all"
                >
                  🔄 Retake
                </button>
                <button
                  onClick={confirmPhoto}
                  className="px-8 py-4 bg-amber text-soot rounded-xl font-bold text-lg
                           hover:bg-amber/90 transition-all shadow-lg"
                >
                  ✓ Use This Photo
                </button>
              </div>
            )}
          </div>

          {/* Tips */}
          {isReady && !capturedImage && (
            <div className="text-center pb-4">
              <p className="text-white/60 text-sm">
                💡 Keep form flat and well-lit • Use back camera for best quality
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
