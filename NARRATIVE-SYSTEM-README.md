# Narrative Visual System - Getting Started

## What We've Built

A **learning visual language system** that analyzes loss narratives to discover patterns, then generates intricate shadow puppet visuals that resonate with the themes and metaphors it finds.

**Instead of hand-coding "hand = touch"**, the system discovers that hands appear in 284 out of 1000 stories, often with "thread" (47 co-occurrences), "photograph" (28), and "window" (31).

---

## Architecture Overview

```
Stories → GPT-4 Analysis → Pattern Database → Visual Composition → Shadow Puppet
```

**5 Core Tables:**
1. `stories_corpus` - Collection of loss narratives
2. `story_analysis` - GPT-4 extracted themes, metaphors, emotions
3. `learned_patterns` - Discovered patterns (themes, metaphors, compositions)
4. `visual_symbols` - Symbol vocabulary with frequency & co-occurrence
5. `generated_visuals` - Cached compositions for each story

---

## Quick Start (Week 1-2 Tasks)

### Step 1: Set Up Database

Run the corpus migration in Supabase:

```bash
# In Supabase SQL Editor, run:
supabase/corpus-migration.sql
```

This creates all the tables for pattern learning.

### Step 2: Collect Initial Corpus

```bash
npm run collect-corpus
```

This seeds the database with 10 sample loss stories.

**Output:**
```
📚 Starting corpus collection...
   ✅ Added: modernloss (87 words)
   ✅ Added: submission (71 words)
   ...
✨ Collection complete!
   Added: 10 stories
```

### Step 3: Analyze Stories with GPT-4

**First, add OpenAI API key to `.env.local`:**

```env
OPENAI_API_KEY=sk-your-key-here
```

**Then run:**

```bash
npm run analyze-corpus
```

**What it does:**
1. Fetches unprocessed stories from `stories_corpus`
2. Sends each to GPT-4 with analyst prompt
3. Extracts themes, metaphors, objects, emotional arc
4. Stores in `story_analysis` table
5. Aggregates patterns into `learned_patterns` and `visual_symbols`

**Output:**
```
🔬 Starting corpus analysis...
📊 Found 10 stories to analyze

📝 Analyzing story from modernloss (87 words)...
   ✅ Analysis complete
      Themes: threshold_moment, inherited_behavior
      Objects: 7
      Sentiment: -0.42

📈 Extracting patterns...
   📊 Pattern Summary:
   • 12 unique themes
   • 34 unique objects
   • 8 metaphor types

   🔝 Top Themes:
      incomplete_ritual: 4 (40.0%)
      tactile_memory: 3 (30.0%)
      threshold_moment: 3 (30.0%)
      ...

   🔝 Top Objects:
      hands: 5 occurrences
      window: 4 occurrences
      photograph: 3 occurrences
      ...
```

### Step 4: View Discovered Patterns

Query Supabase to see what the system learned:

```sql
-- Top themes
SELECT pattern_name, occurrence_count, frequency 
FROM learned_patterns 
WHERE pattern_type = 'theme'
ORDER BY frequency DESC
LIMIT 10;

-- Symbol vocabulary
SELECT symbol_name, category, occurrence_count, priority_score
FROM visual_symbols
ORDER BY priority_score DESC
LIMIT 15;

-- Co-occurrences for a symbol
SELECT co_occurrences 
FROM visual_symbols 
WHERE symbol_name = 'hands';
```

**Example results:**

```
symbol_name | occurrence_count | co_occurrences
----------- | ---------------- | --------------
hands       | 5                | {"thread": 2, "photograph": 1, "window": 1}
window      | 4                | {"hands": 1, "light": 2, "morning": 2}
thread      | 3                | {"hands": 2, "grandmother": 2}
```

---

## How Analysis Works

### GPT-4 Analyst Prompt

The system asks GPT-4 to be an expert in grief narratives and extract:

1. **Themes** (1-3): e.g., "incomplete_ritual", "threshold_moment"
2. **Metaphors**: e.g., Time→stopped, Connection→thread
3. **Emotional Arc**: Sentiment trajectory through story
4. **Objects**: Concrete things mentioned (hands, window, coat)
5. **Temporal Markers**: Language about time ("still", "never", "every morning")

### Pattern Extraction

After analyzing all stories, the system:
- Counts theme frequency
- Tallies object mentions
- Tracks which objects appear together
- Ranks symbols by priority (frequency + co-occurrence weight)

---

## Expanding the Corpus

### Add More Sample Stories

Edit `scripts/collect-corpus.ts` and add to `SAMPLE_CORPUS_STORIES` array:

```typescript
{
  source: 'submission',
  text: `Your loss narrative here...`,
  metadata: { year: 2024, theme: 'your_tag' }
}
```

Then run: `npm run collect-corpus`

### Future: Automated Collection

Placeholders exist for:
- **Reddit scraping** (`scrapeReddit()`)
- **StoryCorps API** (`fetchStoryCorps()`)
- **Modern Loss RSS** (`scrapeModernLoss()`)

These would be implemented with proper permissions/APIs.

### Submission Form

Create a public form where people can submit stories:

```typescript
// app/api/submit-story/route.ts
export async function POST(request: Request) {
  const { story, consent } = await request.json();
  
  await supabase.from('stories_corpus').insert({
    source: 'submission',
    raw_text: story,
    metadata: { submitted_at: new Date(), consent }
  });
  
  return Response.json({ success: true });
}
```

---

## Next Steps (Weeks 3-12)

### Week 3-4: Build More SVG Elements
- Create 100+ intricate shadow puppets
- Map to learned symbols
- Use reference images as inspiration
- Store in `visual_symbols.svg_variants`

### Week 5-6: Composition Engine
- Build intelligent scene composition
- Implement layout rules based on themes
- Generate temporal animation arcs

### Week 7-8: AI Generation
- Integrate Stable Diffusion for unique visuals
- Trace generated images to SVG
- Quality filtering

### Week 9-10: Integration
- Connect to main app
- Auto-generate visuals during transcription
- Cache results

### Week 11-12: Continuous Learning
- Weekly pattern re-analysis
- System evolves as corpus grows
- Discovery of emergent patterns

---

## Current Status

✅ **Complete:**
- Database schema
- Corpus collection script (10 sample stories)
- GPT-4 analysis pipeline
- Pattern extraction logic
- Symbol vocabulary builder

⏳ **In Progress:**
- Expanding corpus to 100+ stories
- Creating SVG library (currently 10 elements)

📅 **Next:**
- Run first analysis on sample corpus
- Review discovered patterns
- Build composition engine

---

## Cost Estimates

### GPT-4 Analysis
- **Per story**: ~500 tokens input + 400 tokens output = ~$0.50
- **100 stories**: ~$50
- **500 stories**: ~$250

### Stable Diffusion (later)
- **Per generation**: ~$0.10
- **100 unique visuals**: ~$10

### Monthly Re-analysis
- New stories only
- ~$50/month at scale

---

## Files Created

```
/supabase/corpus-migration.sql     Database schema
/lib/corpus-types.ts               TypeScript types
/lib/corpus-analyzer.ts            GPT-4 analysis engine
/scripts/collect-corpus.ts         Corpus collection
/scripts/analyze-corpus.ts         Pattern extraction
/NARRATIVE-VISUAL-SYSTEM.md        Full architecture doc
/IMPLEMENTATION-ROADMAP.md         12-week build plan
/NARRATIVE-SYSTEM-README.md        This file
```

---

## Troubleshooting

**"Missing OpenAI API key"**
- Add `OPENAI_API_KEY=sk-...` to `.env.local`

**"No stories to analyze"**
- Run `npm run collect-corpus` first
- Check `stories_corpus` table in Supabase

**"Analysis taking too long"**
- Normal: 3 seconds per story (rate limiting)
- 10 stories = ~30 seconds
- 100 stories = ~5 minutes

**"Pattern extraction shows no results"**
- Make sure `npm run analyze-corpus` completed
- Check `story_analysis` table has entries
- Patterns only extract after all stories analyzed

---

## Research & Ethics

This system learns from real narratives of loss. Consider:

1. **Consent**: Always get permission to use stories
2. **Privacy**: Strip identifying information
3. **Respect**: Handle grief narratives with care
4. **Transparency**: Make pattern database public
5. **Community**: Share findings with contributors

---

## Questions?

- Check `NARRATIVE-VISUAL-SYSTEM.md` for architecture details
- Check `IMPLEMENTATION-ROADMAP.md` for week-by-week tasks
- Review code in `/lib` and `/scripts`

**Ready to start learning from loss.**
