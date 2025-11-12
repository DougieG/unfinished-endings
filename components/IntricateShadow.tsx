'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { INTRICATE_LIBRARY, getSVGsByKeywords, type IntricateSVG } from '@/lib/intricate-svgs';

interface IntricateShadowProps {
  keywords: string[];
}

export default function IntricateShadow({ keywords }: IntricateShadowProps) {
  const [elements, setElements] = useState<IntricateSVG[]>([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    // Find matching SVG elements
    const matches = getSVGsByKeywords(keywords);
    
    // Select up to 4 elements, prioritizing different categories
    const selected: IntricateSVG[] = [];
    const categories = new Set();
    
    for (const match of matches) {
      if (selected.length >= 4) break;
      if (!categories.has(match.category)) {
        selected.push(match);
        categories.add(match.category);
      }
    }
    
    // Add more from same categories if needed
    for (const match of matches) {
      if (selected.length >= 4) break;
      if (!selected.includes(match)) {
        selected.push(match);
      }
    }
    
    // Sort by layer (background first)
    selected.sort((a, b) => a.layer - b.layer);
    
    // If no matches found, add some default elements for visual interest
    if (selected.length === 0) {
      // Add a default set: frame, tree, figure
      const defaults = INTRICATE_LIBRARY.filter(el => 
        ['gothic_arch', 'weeping_willow', 'filigree_corner'].includes(el.id)
      );
      selected.push(...defaults);
    }
    
    setElements(selected);
  }, [keywords]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.01);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Calculate breathing scale (0.98 to 1.02)
  const breathScale = 1 + Math.sin(time * 0.5) * 0.02;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="relative w-full h-full overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #F4A259 0%, #D4A574 60%, #C89666 100%)',
      }}
    >
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full"
        style={{
          transform: `scale(${breathScale})`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <defs>
          {/* Soft glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Shadow for depth */}
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>

        {/* Render each SVG element */}
        {elements.map((element, index) => {
          // Subtle parallax based on layer
          const parallaxOffset = Math.sin(time * 0.3) * (4 - element.layer) * 5;
          
          return (
            <g
              key={element.id}
              transform={`translate(${parallaxOffset}, 0)`}
              style={{
                filter: element.layer === 1 ? 'url(#shadow)' : 'none',
                opacity: element.layer === 1 ? 0.9 : 1,
              }}
            >
              {/* Main silhouette */}
              <g style={{ color: '#000000' }}>
                <g dangerouslySetInnerHTML={{ __html: element.paths }} />
              </g>
              
              {/* Cutout patterns (amber glow) */}
              <g filter="url(#glow)">
                <g dangerouslySetInnerHTML={{ __html: element.cutouts }} />
              </g>
            </g>
          );
        })}

        {/* Floating particles for ambiance */}
        {[...Array(12)].map((_, i) => {
          const x = ((time * 20 + i * 80) % 800);
          const y = 100 + Math.sin(time + i * 0.8) * 60;
          const size = 1 + Math.sin(time * 2 + i) * 0.5;
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={size}
              fill="#E8DCC4"
              opacity={0.15}
            />
          );
        })}
      </svg>

      {/* Keywords overlay */}
      {keywords.length > 0 && (
        <div className="absolute bottom-4 left-4 text-xs text-soot/30 font-serif italic">
          {keywords.slice(0, 4).join(' · ')}
        </div>
      )}
    </motion.div>
  );
}
