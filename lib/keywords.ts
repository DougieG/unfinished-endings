/**
 * Simple keyword extraction fallback (TF-IDF style)
 * Use when OpenAI extraction is unavailable
 */

// Common stop words to exclude
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'was',
  'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you',
  'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its',
  'our', 'their', 'this', 'that', 'these', 'those', 'is', 'are', 'am',
]);

export function extractKeywords(text: string, maxKeywords: number = 8): string[] {
  if (!text) return [];

  // Tokenize and clean
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !STOP_WORDS.has(word) &&
      !/^\d+$/.test(word) // Exclude pure numbers
    );

  // Count frequencies
  const freq: Record<string, number> = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  // Sort by frequency and take top N
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return sorted;
}

/**
 * Extract keywords using OpenAI API
 */
export async function extractKeywordsWithAI(
  transcript: string,
  apiKey: string
): Promise<string[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Extract 5-8 evocative keywords from this personal story about loss. Focus on concrete objects, sensory details, and emotional touchstones. Return only the keywords as a JSON array.'
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in response');
    }

    // Parse JSON array from response
    const keywords = JSON.parse(content);
    return Array.isArray(keywords) ? keywords : [];

  } catch (error) {
    console.error('AI keyword extraction failed:', error);
    // Fallback to simple extraction
    return extractKeywords(transcript);
  }
}

/**
 * Categorize keywords into visual motifs
 */
export type MotifCategory = 
  | 'fabric' 
  | 'hand' 
  | 'portal' 
  | 'bird' 
  | 'light'
  | 'nature'
  | 'object'
  | 'abstract';

export interface MotifMapping {
  category: MotifCategory;
  keywords: string[];
}

const MOTIF_MAPPINGS: MotifMapping[] = [
  {
    category: 'fabric',
    keywords: ['sock', 'thread', 'fabric', 'cloth', 'dress', 'shirt', 'blanket', 'ribbon']
  },
  {
    category: 'hand',
    keywords: ['hand', 'touch', 'finger', 'palm', 'grasp', 'hold', 'reach']
  },
  {
    category: 'portal',
    keywords: ['window', 'door', 'key', 'gate', 'threshold', 'frame', 'opening']
  },
  {
    category: 'bird',
    keywords: ['bird', 'crane', 'wing', 'feather', 'flight', 'nest']
  },
  {
    category: 'light',
    keywords: ['candle', 'light', 'flame', 'glow', 'shadow', 'lamp', 'shine']
  },
  {
    category: 'nature',
    keywords: ['tree', 'flower', 'leaf', 'garden', 'water', 'sky', 'rain', 'wind']
  },
];

export function keywordsToMotifs(keywords: string[]): MotifCategory[] {
  const motifs: MotifCategory[] = [];
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()));

  for (const mapping of MOTIF_MAPPINGS) {
    const hasMatch = mapping.keywords.some(k => keywordSet.has(k));
    if (hasMatch) {
      motifs.push(mapping.category);
    }
  }

  // If no matches, use abstract
  if (motifs.length === 0) {
    motifs.push('abstract');
  }

  return motifs;
}
