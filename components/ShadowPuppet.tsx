'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { MotifCategory } from '@/lib/keywords';

interface ShadowPuppetProps {
  keywords: string[];
  motifs: MotifCategory[];
}

export default function ShadowPuppet({ keywords, motifs }: ShadowPuppetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.01);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw based on primary motif
    const primaryMotif = motifs[0] || 'abstract';

    ctx.fillStyle = '#1A1A1A';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 2;

    const centerX = width / 2;
    const centerY = height / 2;

    switch (primaryMotif) {
      case 'fabric':
        drawFabricMotif(ctx, centerX, centerY, time, width, height);
        break;
      case 'hand':
        drawHandMotif(ctx, centerX, centerY, time, width, height);
        break;
      case 'portal':
        drawPortalMotif(ctx, centerX, centerY, time, width, height);
        break;
      case 'bird':
        drawBirdMotif(ctx, centerX, centerY, time, width, height);
        break;
      case 'light':
        drawLightMotif(ctx, centerX, centerY, time, width, height);
        break;
      case 'nature':
        drawNatureMotif(ctx, centerX, centerY, time, width, height);
        break;
      default:
        drawAbstractMotif(ctx, centerX, centerY, time, width, height);
    }

  }, [time, motifs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="relative w-full h-full"
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />
      {keywords.length > 0 && (
        <div className="absolute bottom-4 left-4 text-xs text-soot/40 font-serif italic">
          {keywords.slice(0, 3).join(' · ')}
        </div>
      )}
    </motion.div>
  );
}

// Motif drawing functions with gentle, breathing animation

function drawFabricMotif(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  w: number,
  h: number
) {
  // Wavering ribbon silhouette
  ctx.beginPath();
  const points = 30;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const radius = 100 + Math.sin(t + i * 0.5) * 20;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius * 0.6 + Math.sin(t * 0.5) * 30;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHandMotif(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  w: number,
  h: number
) {
  // Articulated hand with finger curl
  ctx.save();
  ctx.translate(x, y);
  
  // Palm
  ctx.beginPath();
  ctx.ellipse(0, 0, 60, 80, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fingers
  const fingerCurl = Math.sin(t) * 0.2;
  for (let i = 0; i < 5; i++) {
    ctx.save();
    const angle = (i - 2) * 0.3;
    ctx.rotate(angle);
    ctx.translate(0, -80);
    ctx.rotate(fingerCurl);
    ctx.fillRect(-8, 0, 16, 60);
    ctx.restore();
  }

  ctx.restore();
}

function drawPortalMotif(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  w: number,
  h: number
) {
  // Rectangular portal with drifting grain
  const rectW = 200;
  const rectH = 280;
  const offsetX = Math.sin(t * 0.3) * 10;
  const offsetY = Math.cos(t * 0.2) * 10;

  ctx.fillRect(
    x - rectW / 2 + offsetX,
    y - rectH / 2 + offsetY,
    rectW,
    rectH
  );

  // Inner frame
  ctx.globalAlpha = 0.3;
  ctx.fillRect(
    x - rectW / 2 + 20 + offsetX,
    y - rectH / 2 + 20 + offsetY,
    rectW - 40,
    rectH - 40
  );
  ctx.globalAlpha = 1;
}

function drawBirdMotif(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  w: number,
  h: number
) {
  // Simple wing flap
  const wingFlap = Math.sin(t * 3) * 30;

  ctx.save();
  ctx.translate(x, y);

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left wing
  ctx.beginPath();
  ctx.moveTo(-30, -10);
  ctx.quadraticCurveTo(-80, -40 + wingFlap, -100, -20 + wingFlap);
  ctx.quadraticCurveTo(-80, -10 + wingFlap, -30, 10);
  ctx.closePath();
  ctx.fill();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(30, -10);
  ctx.quadraticCurveTo(80, -40 + wingFlap, 100, -20 + wingFlap);
  ctx.quadraticCurveTo(80, -10 + wingFlap, 30, 10);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawLightMotif(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  w: number,
  h: number
) {
  // Candle flame with flicker
  const flicker = Math.sin(t * 4) * 5 + Math.cos(t * 7) * 3;

  ctx.save();
  ctx.translate(x, y);

  // Candle base
  ctx.fillRect(-15, 50, 30, 100);

  // Flame
  ctx.beginPath();
  ctx.moveTo(0, 50);
  ctx.bezierCurveTo(
    -20, 30 + flicker,
    -25, 0 + flicker,
    0, -40 + flicker
  );
  ctx.bezierCurveTo(
    25, 0 + flicker,
    20, 30 + flicker,
    0, 50
  );
  ctx.closePath();
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawNatureMotif(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  w: number,
  h: number
) {
  // Simple tree with swaying branches
  const sway = Math.sin(t * 0.8) * 10;

  ctx.save();
  ctx.translate(x, y);

  // Trunk
  ctx.fillRect(-20, 0, 40, 150);

  // Branches
  for (let i = 0; i < 5; i++) {
    const branchY = 30 + i * 25;
    const branchLength = 80 - i * 10;
    
    ctx.save();
    ctx.translate(0, branchY);
    ctx.rotate((Math.sin(t + i) * 0.1));
    ctx.fillRect(0, -5, branchLength + sway, 10);
    ctx.fillRect(0, -5, -(branchLength + sway), 10);
    ctx.restore();
  }

  ctx.restore();
}

function drawAbstractMotif(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  w: number,
  h: number
) {
  // Perlin-like noise with drifting circles
  const circles = 8;
  for (let i = 0; i < circles; i++) {
    const angle = (i / circles) * Math.PI * 2 + t * 0.3;
    const radius = 100 + Math.sin(t + i) * 30;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    const size = 30 + Math.sin(t * 2 + i) * 10;

    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
