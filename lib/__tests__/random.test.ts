import { selectRandomStory, updateLRU, parseLRU, serializeLRU } from '../random';
import type { Story } from '../supabase';

describe('Random Story Selection', () => {
  const mockStories: Story[] = [
    {
      id: '1',
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      source: 'interior',
      duration_s: 60,
      audio_url: 'https://example.com/1.mp3',
      transcript: 'Story 1',
      keywords: ['test'],
      visual_url: null,
      consent: true,
      play_count: 0,
      last_played_at: null,
    },
    {
      id: '2',
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      source: 'interior',
      duration_s: 90,
      audio_url: 'https://example.com/2.mp3',
      transcript: 'Story 2',
      keywords: ['test'],
      visual_url: null,
      consent: true,
      play_count: 5,
      last_played_at: null,
    },
    {
      id: '3',
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      source: 'interior',
      duration_s: 120,
      audio_url: 'https://example.com/3.mp3',
      transcript: 'Story 3',
      keywords: ['test'],
      visual_url: null,
      consent: true,
      play_count: 10,
      last_played_at: null,
    },
  ];

  test('selects a story from available pool', () => {
    const story = selectRandomStory(mockStories);
    expect(story).toBeDefined();
    expect(mockStories).toContainEqual(story);
  });

  test('excludes stories in LRU list', () => {
    const excludeIds = ['1', '2'];
    const story = selectRandomStory(mockStories, { excludeIds });
    expect(story?.id).toBe('3');
  });

  test('returns null when no stories available', () => {
    const story = selectRandomStory([]);
    expect(story).toBeNull();
  });

  test('returns null when all stories excluded', () => {
    const excludeIds = ['1', '2', '3'];
    const story = selectRandomStory(mockStories, { excludeIds });
    expect(story).toBeNull();
  });

  test('filters out non-consented stories', () => {
    const storiesWithNonConsent = [
      ...mockStories,
      {
        ...mockStories[0],
        id: '4',
        consent: false,
      },
    ];
    const story = selectRandomStory(storiesWithNonConsent);
    expect(story?.id).not.toBe('4');
  });
});

describe('LRU Management', () => {
  test('updates LRU list correctly', () => {
    const current: string[] = [];
    const updated1 = updateLRU(current, 'a', 3);
    expect(updated1).toEqual(['a']);

    const updated2 = updateLRU(updated1, 'b', 3);
    expect(updated2).toEqual(['b', 'a']);

    const updated3 = updateLRU(updated2, 'c', 3);
    expect(updated3).toEqual(['c', 'b', 'a']);

    const updated4 = updateLRU(updated3, 'd', 3);
    expect(updated4).toEqual(['d', 'c', 'b']);
    expect(updated4.length).toBe(3);
  });

  test('moves existing item to front', () => {
    const current = ['a', 'b', 'c'];
    const updated = updateLRU(current, 'b', 3);
    expect(updated).toEqual(['b', 'a', 'c']);
  });

  test('parses and serializes LRU correctly', () => {
    const ids = ['a', 'b', 'c'];
    const serialized = serializeLRU(ids);
    const parsed = parseLRU(serialized);
    expect(parsed).toEqual(ids);
  });

  test('handles invalid JSON in parseLRU', () => {
    const parsed = parseLRU('invalid json');
    expect(parsed).toEqual([]);
  });
});
