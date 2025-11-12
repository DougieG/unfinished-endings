'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

interface ArchiveCardProps {
  storyId: string;
  onClose: () => void;
}

export default function ArchiveCard({ storyId, onClose }: ArchiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const shortId = storyId.substring(0, 8).toUpperCase();
  const storyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/story/${storyId}`;

  useEffect(() => {
    QRCode.toDataURL(storyUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1A1A1A',
        light: '#E8DCC4',
      },
    }).then(setQrDataUrl);
  }, [storyUrl]);

  const printCard = () => {
    if (!cardRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Archive Card - UE-${shortId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=Inter:wght@400;600&display=swap');
            
            body {
              margin: 0;
              padding: 40px;
              font-family: 'Inter', sans-serif;
              background: #E8DCC4;
            }
            .card {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border: 2px solid #1A1A1A;
              text-align: center;
            }
            .title {
              font-family: 'Cormorant Garamond', serif;
              font-size: 32px;
              margin-bottom: 20px;
              color: #1A1A1A;
            }
            .claim-number {
              font-size: 24px;
              font-weight: 600;
              margin: 20px 0;
              color: #1A1A1A;
            }
            .qr {
              margin: 30px 0;
            }
            .footer {
              font-size: 14px;
              color: #666;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          ${cardRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const downloadPNG = async () => {
    if (!cardRef.current) return;

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#E8DCC4',
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = `UE-${shortId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg p-8 shadow-2xl"
    >
      <div
        ref={cardRef}
        className="max-w-md mx-auto bg-cardboard border-2 border-soot p-8 text-center"
      >
        <h1 className="text-4xl font-serif text-soot mb-6">
          Unfinished Endings
        </h1>
        
        <div className="my-8">
          <div className="text-sm font-sans text-soot/60 mb-2">CLAIM NUMBER</div>
          <div className="text-3xl font-sans font-semibold text-soot">
            UE-{shortId}
          </div>
        </div>

        {qrDataUrl && (
          <div className="my-8">
            <img 
              src={qrDataUrl} 
              alt="QR Code" 
              className="mx-auto w-48 h-48"
            />
          </div>
        )}

        <div className="text-xs font-sans text-soot/50 mt-6">
          Scan to witness this tale
        </div>
      </div>

      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={printCard}
          className="px-6 py-3 bg-soot text-cardboard font-sans rounded-sm
                     hover:bg-soot/90 transition-all duration-400"
        >
          Print Card
        </button>
        <button
          onClick={downloadPNG}
          className="px-6 py-3 bg-amber text-soot font-sans rounded-sm
                     hover:bg-amber/90 transition-all duration-400"
        >
          Download PNG
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-soot/20 text-soot font-sans rounded-sm
                     hover:bg-soot/30 transition-all duration-400"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}
