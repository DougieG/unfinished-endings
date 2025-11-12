/**
 * Intricate SVG Shadow Puppet Library v2
 * Lotte Reiniger / scherenschnitte inspired
 */

export type IntricateSVG = {
  id: string;
  category: 'figure' | 'flora' | 'frame' | 'object' | 'creature' | 'pattern';
  keywords: string[];
  viewBox: string;
  paths: string;
  cutouts: string; // Amber glow holes
  layer: number; // 1=background, 2=mid, 3=foreground
};

// Library will grow to 100+ elements
export const INTRICATE_LIBRARY: IntricateSVG[] = [
  
  // FIGURES
  {
    id: 'elderly_woman_seated',
    category: 'figure',
    keywords: ['grandmother', 'woman', 'elderly', 'sitting', 'memory', 'mother', 'father', 'parent', 'person', 'figure'],
    viewBox: '0 0 200 300',
    layer: 2,
    paths: `
      <!-- Dress with ornate hem -->
      <path d="M100,80 Q85,120 80,180 L60,280 Q60,285 65,285 L135,285 Q140,285 140,280 L120,180 Q115,120 100,80 Z" fill="currentColor"/>
      <!-- Bodice -->
      <path d="M100,40 L90,80 L110,80 Z" fill="currentColor"/>
      <!-- Head with detailed hair -->
      <path d="M95,20 Q90,15 90,25 Q88,35 95,38 Q102,35 100,25 Q100,15 95,20" fill="currentColor"/>
      <!-- Arms -->
      <path d="M85,100 Q70,110 65,125 L68,128 Q75,118 85,105" fill="currentColor"/>
      <path d="M115,100 Q130,110 135,125 L132,128 Q125,118 115,105" fill="currentColor"/>
      <!-- Hands in lap -->
      <ellipse cx="100" cy="160" rx="15" ry="8" fill="currentColor"/>
    `,
    cutouts: `
      <!-- Dress pattern holes -->
      <circle cx="100" cy="200" r="4" fill="#E8DCC4" opacity="0.6"/>
      <circle cx="85" cy="220" r="3" fill="#E8DCC4" opacity="0.6"/>
      <circle cx="115" cy="220" r="3" fill="#E8DCC4" opacity="0.6"/>
      <circle cx="90" cy="240" r="2.5" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="110" cy="240" r="2.5" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="100" cy="260" r="3" fill="#E8DCC4" opacity="0.6"/>
    `
  },

  {
    id: 'reaching_hands',
    category: 'figure',
    keywords: ['hand', 'hands', 'reach', 'touch', 'grasp', 'hold', 'holding', 'touching', 'gesture'],
    viewBox: '0 0 250 200',
    layer: 3,
    paths: `
      <!-- Left hand reaching -->
      <path d="M50,100 Q45,90 40,85 L35,83 Q32,85 35,88 Q40,95 45,100 L50,105" fill="currentColor"/>
      <path d="M50,100 L48,120 Q47,125 50,126 L52,125 Q54,120 53,115 Z" fill="currentColor"/>
      <!-- Palm -->
      <ellipse cx="48" cy="108" rx="12" ry="18" transform="rotate(-15 48 108)" fill="currentColor"/>
      <!-- Fingers with detail -->
      <path d="M42,95 L40,75 Q39,72 41,71 L43,72 Q44,75 43,85 Z" fill="currentColor"/>
      <path d="M48,92 L47,70 Q46,67 48,66 L50,67 Q51,70 50,80 Z" fill="currentColor"/>
      <path d="M54,95 L54,75 Q53,72 55,71 L57,72 Q58,75 57,85 Z" fill="currentColor"/>
      <!-- Right hand -->
      <path d="M200,100 Q205,90 210,85 L215,83 Q218,85 215,88 Q210,95 205,100 L200,105" fill="currentColor"/>
      <ellipse cx="202" cy="108" rx="12" ry="18" transform="rotate(15 202 108)" fill="currentColor"/>
    `,
    cutouts: `
      <circle cx="48" cy="108" r="3" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="202" cy="108" r="3" fill="#E8DCC4" opacity="0.5"/>
    `
  },

  // FLORA
  {
    id: 'weeping_willow',
    category: 'flora',
    keywords: ['tree', 'willow', 'weeping', 'branches', 'nature', 'garden', 'plant', 'growing'],
    viewBox: '0 0 400 500',
    layer: 1,
    paths: `
      <!-- Trunk -->
      <path d="M180,500 L185,300 Q190,100 200,50 Q210,100 215,300 L220,500 Q220,505 200,505 Q180,505 180,500" fill="currentColor"/>
      <!-- Cascading branches with leaves -->
      <path d="M200,100 Q150,120 120,180 Q115,190 120,195 L130,185 Q160,140 200,110" fill="currentColor"/>
      <path d="M200,100 Q250,120 280,180 Q285,190 280,195 L270,185 Q240,140 200,110" fill="currentColor"/>
      <path d="M200,150 Q130,180 100,250 Q95,260 100,265 L110,255 Q140,200 200,160" fill="currentColor"/>
      <path d="M200,150 Q270,180 300,250 Q305,260 300,265 L290,255 Q260,200 200,160" fill="currentColor"/>
      <!-- More tendrils -->
      <path d="M200,200 Q140,240 110,320 L115,325 Q150,260 200,215" fill="currentColor"/>
      <path d="M200,200 Q260,240 290,320 L285,325 Q250,260 200,215" fill="currentColor"/>
    `,
    cutouts: `
      <!-- Leaf patterns -->
      <ellipse cx="120" cy="180" rx="3" ry="5" fill="#E8DCC4" opacity="0.4"/>
      <ellipse cx="280" cy="180" rx="3" ry="5" fill="#E8DCC4" opacity="0.4"/>
      <ellipse cx="100" cy="250" rx="2.5" ry="4" fill="#E8DCC4" opacity="0.4"/>
      <ellipse cx="300" cy="250" rx="2.5" ry="4" fill="#E8DCC4" opacity="0.4"/>
      <ellipse cx="110" cy="320" rx="2" ry="3" fill="#E8DCC4" opacity="0.4"/>
      <ellipse cx="290" cy="320" rx="2" ry="3" fill="#E8DCC4" opacity="0.4"/>
      <circle cx="200" cy="80" r="4" fill="#E8DCC4" opacity="0.5"/>
    `
  },

  {
    id: 'vine_border',
    category: 'flora',
    keywords: ['vine', 'leaf', 'border', 'frame', 'garden', 'growth', 'flower', 'flowers'],
    viewBox: '0 0 800 100',
    layer: 1,
    paths: `
      <!-- Winding vine -->
      <path d="M0,50 Q100,30 200,50 T400,50 T600,50 T800,50" fill="none" stroke="currentColor" stroke-width="3"/>
      <!-- Leaves along vine -->
      <path d="M100,35 Q90,30 95,25 Q100,20 105,25 Q110,30 100,35" fill="currentColor"/>
      <path d="M200,55 Q190,60 195,65 Q200,70 205,65 Q210,60 200,55" fill="currentColor"/>
      <path d="M300,35 Q290,30 295,25 Q300,20 305,25 Q310,30 300,35" fill="currentColor"/>
      <path d="M400,55 Q390,60 395,65 Q400,70 405,65 Q410,60 400,55" fill="currentColor"/>
      <path d="M500,35 Q490,30 495,25 Q500,20 505,25 Q510,30 500,35" fill="currentColor"/>
      <path d="M600,55 Q590,60 595,65 Q600,70 605,65 Q610,60 600,55" fill="currentColor"/>
      <path d="M700,35 Q690,30 695,25 Q700,20 705,25 Q710,30 700,35" fill="currentColor"/>
    `,
    cutouts: `
      <circle cx="100" cy="30" r="2" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="200" cy="60" r="2" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="300" cy="30" r="2" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="400" cy="60" r="2" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="500" cy="30" r="2" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="600" cy="60" r="2" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="700" cy="30" r="2" fill="#E8DCC4" opacity="0.5"/>
    `
  },

  // FRAMES
  {
    id: 'gothic_arch',
    category: 'frame',
    keywords: ['window', 'door', 'arch', 'doorway', 'portal', 'threshold', 'kitchen window', 'hall', 'room'],
    viewBox: '0 0 400 600',
    layer: 1,
    paths: `
      <!-- Gothic arch frame -->
      <path d="M100,600 L100,200 Q100,100 200,50 Q300,100 300,200 L300,600" 
            fill="none" stroke="currentColor" stroke-width="15"/>
      <!-- Inner decorative arch -->
      <path d="M130,580 L130,210 Q130,120 200,80 Q270,120 270,210 L270,580" 
            fill="none" stroke="currentColor" stroke-width="8"/>
      <!-- Columns -->
      <rect x="95" y="500" width="20" height="100" fill="currentColor"/>
      <rect x="285" y="500" width="20" height="100" fill="currentColor"/>
      <!-- Decorative top -->
      <path d="M200,45 L195,55 L205,55 Z" fill="currentColor"/>
      <!-- Lattice pattern in arch -->
      <line x1="150" y1="150" x2="250" y2="150" stroke="currentColor" stroke-width="2"/>
      <line x1="150" y1="200" x2="250" y2="200" stroke="currentColor" stroke-width="2"/>
      <line x1="150" y1="250" x2="250" y2="250" stroke="currentColor" stroke-width="2"/>
    `,
    cutouts: `
      <!-- Diamond cutouts -->
      <polygon points="200,100 195,105 200,110 205,105" fill="#E8DCC4" opacity="0.6"/>
      <polygon points="170,180 165,185 170,190 175,185" fill="#E8DCC4" opacity="0.5"/>
      <polygon points="230,180 225,185 230,190 235,185" fill="#E8DCC4" opacity="0.5"/>
      <polygon points="200,220 195,225 200,230 205,225" fill="#E8DCC4" opacity="0.6"/>
      <!-- Circular cutouts -->
      <circle cx="150" cy="400" r="5" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="250" cy="400" r="5" fill="#E8DCC4" opacity="0.5"/>
    `
  },

  // OBJECTS
  {
    id: 'ornate_candle',
    category: 'object',
    keywords: ['candle', 'light', 'flame', 'glow', 'vigil', 'memorial', 'morning light', 'lighting'],
    viewBox: '0 0 100 200',
    layer: 3,
    paths: `
      <!-- Candle base -->
      <path d="M30,180 L35,140 L40,100 L60,100 L65,140 L70,180 Q70,185 50,185 Q30,185 30,180" fill="currentColor"/>
      <!-- Decorative wax drips -->
      <path d="M35,120 Q33,125 35,130" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M65,115 Q67,120 65,125" fill="none" stroke="currentColor" stroke-width="2"/>
      <!-- Flame -->
      <path d="M50,95 Q45,85 45,75 Q45,65 50,55 Q55,65 55,75 Q55,85 50,95" fill="currentColor"/>
      <!-- Inner flame glow -->
      <path d="M50,90 Q48,83 48,76 Q48,69 50,62 Q52,69 52,76 Q52,83 50,90" fill="#F4A259" opacity="0.8"/>
    `,
    cutouts: `
      <!-- Candle body patterns -->
      <circle cx="50" cy="110" r="3" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="45" cy="130" r="2" fill="#E8DCC4" opacity="0.4"/>
      <circle cx="55" cy="130" r="2" fill="#E8DCC4" opacity="0.4"/>
      <circle cx="50" cy="150" r="2.5" fill="#E8DCC4" opacity="0.5"/>
      <ellipse cx="50" cy="170" rx="4" ry="2" fill="#E8DCC4" opacity="0.4"/>
    `
  },

  {
    id: 'antique_clock',
    category: 'object',
    keywords: ['clock', 'time', 'watch', 'hour', 'waiting', 'moment', 'morning', 'day', 'years'],
    viewBox: '0 0 150 200',
    layer: 2,
    paths: `
      <!-- Clock case -->
      <rect x="40" y="20" width="70" height="160" rx="5" fill="currentColor"/>
      <!-- Clock face -->
      <circle cx="75" cy="80" r="30" fill="currentColor"/>
      <!-- Inner face -->
      <circle cx="75" cy="80" r="25" fill="#E8DCC4" opacity="0.3"/>
      <!-- Hour markers -->
      <circle cx="75" cy="58" r="2" fill="currentColor"/>
      <circle cx="75" cy="102" r="2" fill="currentColor"/>
      <circle cx="53" cy="80" r="2" fill="currentColor"/>
      <circle cx="97" cy="80" r="2" fill="currentColor"/>
      <!-- Hands -->
      <line x1="75" y1="80" x2="75" y2="65" stroke="currentColor" stroke-width="2"/>
      <line x1="75" y1="80" x2="85" y2="80" stroke="currentColor" stroke-width="2"/>
      <!-- Pendulum -->
      <line x1="75" y1="120" x2="75" y2="155" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="75" cy="160" r="8" fill="currentColor"/>
    `,
    cutouts: `
      <circle cx="75" cy="160" r="3" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="60" cy="140" r="2" fill="#E8DCC4" opacity="0.4"/>
      <circle cx="90" cy="140" r="2" fill="#E8DCC4" opacity="0.4"/>
    `
  },

  // CREATURES
  {
    id: 'butterfly_detailed',
    category: 'creature',
    keywords: ['butterfly', 'moth', 'wings', 'flight', 'transformation', 'soul'],
    viewBox: '0 0 200 150',
    layer: 3,
    paths: `
      <!-- Body -->
      <ellipse cx="100" cy="75" rx="5" ry="20" fill="currentColor"/>
      <!-- Antennae -->
      <path d="M95,60 Q90,50 88,45" fill="none" stroke="currentColor" stroke-width="1"/>
      <path d="M105,60 Q110,50 112,45" fill="none" stroke="currentColor" stroke-width="1"/>
      <circle cx="88" cy="43" r="2" fill="currentColor"/>
      <circle cx="112" cy="43" r="2" fill="currentColor"/>
      <!-- Left upper wing -->
      <path d="M95,65 Q50,50 30,60 Q20,70 25,85 Q35,95 60,90 Q80,85 95,75" fill="currentColor"/>
      <!-- Left lower wing -->
      <path d="M95,85 Q70,100 55,110 Q50,115 55,120 Q65,125 80,115 Q90,105 95,95" fill="currentColor"/>
      <!-- Right upper wing -->
      <path d="M105,65 Q150,50 170,60 Q180,70 175,85 Q165,95 140,90 Q120,85 105,75" fill="currentColor"/>
      <!-- Right lower wing -->
      <path d="M105,85 Q130,100 145,110 Q150,115 145,120 Q135,125 120,115 Q110,105 105,95" fill="currentColor"/>
    `,
    cutouts: `
      <!-- Wing patterns -->
      <circle cx="50" cy="75" r="5" fill="#E8DCC4" opacity="0.6"/>
      <circle cx="150" cy="75" r="5" fill="#E8DCC4" opacity="0.6"/>
      <circle cx="65" cy="68" r="3" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="135" cy="68" r="3" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="70" cy="105" r="3" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="130" cy="105" r="3" fill="#E8DCC4" opacity="0.5"/>
      <ellipse cx="45" cy="80" rx="2" ry="3" fill="#E8DCC4" opacity="0.4"/>
      <ellipse cx="155" cy="80" rx="2" ry="3" fill="#E8DCC4" opacity="0.4"/>
    `
  },

  {
    id: 'songbird',
    category: 'creature',
    keywords: ['bird', 'song', 'sparrow', 'robin', 'wing', 'feather', 'flight'],
    viewBox: '0 0 180 120',
    layer: 2,
    paths: `
      <!-- Body -->
      <ellipse cx="90" cy="70" rx="25" ry="30" fill="currentColor"/>
      <!-- Head -->
      <circle cx="90" cy="45" r="15" fill="currentColor"/>
      <!-- Beak -->
      <path d="M105,45 L115,43 L105,48 Z" fill="currentColor"/>
      <!-- Eye -->
      <circle cx="95" cy="43" r="2" fill="#E8DCC4" opacity="0.8"/>
      <!-- Tail -->
      <path d="M65,80 Q50,85 40,90 L42,93 Q53,88 65,85" fill="currentColor"/>
      <path d="M65,85 Q50,92 38,100 L40,103 Q52,95 65,90" fill="currentColor"/>
      <!-- Wing -->
      <path d="M90,60 Q70,55 55,65 Q50,70 55,75 Q70,80 90,75" fill="currentColor"/>
      <!-- Wing feather detail -->
      <path d="M75,65 L72,68" stroke="currentColor" stroke-width="1"/>
      <path d="M70,68 L67,71" stroke="currentColor" stroke-width="1"/>
      <path d="M65,71 L62,74" stroke="currentColor" stroke-width="1"/>
      <!-- Legs -->
      <line x1="85" y1="95" x2="85" y2="105" stroke="currentColor" stroke-width="2"/>
      <line x1="95" y1="95" x2="95" y2="105" stroke="currentColor" stroke-width="2"/>
      <path d="M85,105 L80,108 M85,105 L90,108" stroke="currentColor" stroke-width="1"/>
      <path d="M95,105 L90,108 M95,105 L100,108" stroke="currentColor" stroke-width="1"/>
    `,
    cutouts: `
      <circle cx="90" cy="70" r="3" fill="#E8DCC4" opacity="0.4"/>
      <circle cx="75" cy="75" r="2" fill="#E8DCC4" opacity="0.4"/>
    `
  },

  // PATTERNS
  {
    id: 'filigree_corner',
    category: 'pattern',
    keywords: ['decoration', 'ornate', 'pattern', 'border', 'frame'],
    viewBox: '0 0 150 150',
    layer: 1,
    paths: `
      <!-- Corner flourish -->
      <path d="M0,0 Q30,0 50,20 Q70,40 70,70" fill="none" stroke="currentColor" stroke-width="3"/>
      <path d="M0,0 Q0,30 20,50 Q40,70 70,70" fill="none" stroke="currentColor" stroke-width="3"/>
      <!-- Inner detail -->
      <path d="M15,15 Q25,15 35,25 Q45,35 45,45" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <!-- Decorative swirls -->
      <path d="M40,10 Q45,8 48,12 Q50,16 46,18 Q42,20 40,16" fill="currentColor"/>
      <path d="M10,40 Q8,45 12,48 Q16,50 18,46 Q20,42 16,40" fill="currentColor"/>
    `,
    cutouts: `
      <circle cx="35" cy="35" r="3" fill="#E8DCC4" opacity="0.5"/>
      <circle cx="50" cy="20" r="2" fill="#E8DCC4" opacity="0.4"/>
      <circle cx="20" cy="50" r="2" fill="#E8DCC4" opacity="0.4"/>
    `
  }
];

export function getSVGsByKeywords(keywords: string[]): IntricateSVG[] {
  const matches: IntricateSVG[] = [];
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
  
  for (const svg of INTRICATE_LIBRARY) {
    const hasMatch = svg.keywords.some(k => keywordSet.has(k.toLowerCase()));
    if (hasMatch) {
      matches.push(svg);
    }
  }
  
  return matches;
}
