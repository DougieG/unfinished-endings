/**
 * Intricate SVG Shadow Puppet Library
 * Inspired by Lotte Reiniger / scherenschnitte style
 */

export type SVGElement = {
  id: string;
  category: 'figure' | 'flora' | 'frame' | 'object' | 'creature' | 'pattern';
  keywords: string[];
  svg: string;
  layer: 'foreground' | 'midground' | 'background';
};

export const SVG_LIBRARY: SVGElement[] = [
  {
    id: 'figure_reaching',
    category: 'figure',
    keywords: ['hand', 'reach', 'touch', 'grasp'],
    layer: 'foreground',
    svg: `
      <g transform="translate(200, 150)">
        <!-- Ornate reaching figure -->
        <path d="M0,0 Q-20,30 -30,60 L-35,80 Q-33,85 -28,83 L-20,75 Q-15,70 -10,75 L0,90" 
              fill="currentColor" stroke="none"/>
        <!-- Hand with decorative cutouts -->
        <circle cx="-15" cy="80" r="3" fill="#E8DCC4" opacity="0.6"/>
        <circle cx="-25" cy="75" r="2" fill="#E8DCC4" opacity="0.6"/>
      </g>
    `
  },
  {
    id: 'tree_ornate',
    category: 'flora',
    keywords: ['tree', 'branch', 'garden', 'nature', 'growth'],
    layer: 'background',
    svg: `
      <g transform="translate(400, 300)">
        <!-- Trunk with pattern -->
        <path d="M0,0 L-10,150 Q-12,160 -8,165 L8,165 Q12,160 10,150 L0,0" fill="currentColor"/>
        <!-- Intricate branches with cutout leaves -->
        <path d="M0,30 Q-30,25 -50,20 L-55,18 Q-58,20 -56,23 L-52,25 Q-48,22 -45,25 L-40,30" 
              fill="currentColor"/>
        <circle cx="-50" cy="22" r="2" fill="#E8DCC4" opacity="0.5"/>
        <circle cx="-45" cy="27" r="1.5" fill="#E8DCC4" opacity="0.5"/>
      </g>
    `
  }
];
