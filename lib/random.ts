import type { Story } from './supabase';

/**
 * Weighted random selection with LRU anti-repeat and recency bias
 */

export interface RandomOptions {
  excludeIds?: string[];
  recencyBias?: number; // 0-1, higher = stronger bias toward recent stories
}

/**
 * Calculate softmax weights with recency bias
 */
function calculateWeights(stories: Story[], recencyBias: number = 0.3): number[] {
  if (stories.length === 0) return [];

  const now = Date.now();
  const weights = stories.map((story) => {
    const ageMs = now - new Date(story.created_at).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    
    // Exponential decay: newer stories get higher weight
    // recencyBias controls the decay rate
    const recencyWeight = Math.exp(-recencyBias * ageDays);
    
    // Anti-popularity: stories played less often get slightly higher weight
    const playWeight = 1 / (1 + story.play_count * 0.1);
    
    return recencyWeight * playWeight;
  });

  // Normalize to sum to 1
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / sum);
}

/**
 * Select random story using weighted sampling
 */
export function selectRandomStory(
  stories: Story[],
  options: RandomOptions = {}
): Story | null {
  const { excludeIds = [], recencyBias = 0.3 } = options;

  // Filter out excluded IDs
  const candidates = stories.filter(s => !excludeIds.includes(s.id) && s.consent);

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const weights = calculateWeights(candidates, recencyBias);
  
  // Weighted random selection
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < candidates.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return candidates[i];
    }
  }

  // Fallback (shouldn't happen with proper normalization)
  return candidates[candidates.length - 1];
}

/**
 * Get LRU list from cookie string
 */
export function parseLRU(cookieValue: string | undefined): string[] {
  if (!cookieValue) return [];
  try {
    return JSON.parse(cookieValue);
  } catch {
    return [];
  }
}

/**
 * Update LRU list (keep last N items)
 */
export function updateLRU(current: string[], newId: string, maxSize: number = 3): string[] {
  const updated = [newId, ...current.filter(id => id !== newId)];
  return updated.slice(0, maxSize);
}

/**
 * Serialize LRU for cookie
 */
export function serializeLRU(ids: string[]): string {
  return JSON.stringify(ids);
}
