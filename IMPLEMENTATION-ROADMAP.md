# Narrative Visual System - Implementation Roadmap
## 12-Week Build Plan

---

## Week 1-2: Foundation & Corpus Collection

### Goals
- Set up data infrastructure
- Begin corpus collection
- Create NLP pipeline foundation

### Tasks

**Database Schema**
```sql
-- stories_corpus table (separate from live stories)
CREATE TABLE stories_corpus (
  id uuid PRIMARY KEY,
  source text, -- 'storycorps', 'moth', 'reddit', 'submission'
  raw_text text,
  cleaned_text text,
  word_count int,
  collected_at timestamptz,
  metadata jsonb
);

-- analysis_results table
CREATE TABLE story_analysis (
  id uuid PRIMARY KEY,
  story_id uuid REFERENCES stories_corpus(id),
  themes jsonb,
  metaphors jsonb,
  emotional_arc jsonb,
  objects_mentioned jsonb,
  temporal_markers jsonb,
  analyzed_at timestamptz
);

-- pattern_library table (learned patterns)
CREATE TABLE learned_patterns (
  id uuid PRIMARY KEY,
  pattern_type text, -- 'theme', 'metaphor', 'composition'
  pattern_data jsonb,
  frequency int,
  examples jsonb, -- story IDs that exhibit this pattern
  confidence float,
  discovered_at timestamptz
);

-- symbol_vocabulary table
CREATE TABLE visual_symbols (
  id uuid PRIMARY KEY,
  symbol_name text,
  category text,
  occurrence_count int,
  co_occurrences jsonb,
  svg_variants jsonb,
  priority_score float
);
```

**Corpus Collection Strategy**

1. **Manual curated set (100 stories)**
   - Modern Loss website
   - StoryCorps search API
   - The Moth podcast transcripts
   - Quality over quantity

2. **Reddit scraping (200 stories)**
   - r/GriefSupport top posts
   - r/LastImages story comments
   - Filter for 100-500 word narratives

3. **Solicited submissions (200 stories)**
   - Landing page: "Share your story of loss"
   - Form with prompts
   - Consent for research use

4. **Target: 500+ stories by end of Week 2**

**Deliverables**
- ✅ Supabase tables created
- ✅ Corpus collection script
- ✅ 500+ stories gathered
- ✅ Basic cleaning/normalization

---

## Week 3-4: NLP Analysis Pipeline

### Goals
- Build GPT-4 powered analysis system
- Extract patterns from corpus
- Create pattern database

### Architecture

```typescript
// lib/corpus-analyzer.ts
interface AnalysisResult {
  themes: Theme[];
  metaphors: Metaphor[];
  emotionalArc: EmotionalArc;
  objects: ObjectMention[];
  temporalMarkers: TemporalMarker[];
  rawAnalysis: string;
}

async function analyzeStory(text: string): Promise<AnalysisResult> {
  const prompt = constructAnalysisPrompt(text);
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'system', content: ANALYST_SYSTEM_PROMPT }, 
               { role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  return parseAnalysisResponse(response);
}
```

**Analysis Prompts**

```
SYSTEM PROMPT (Analyst):
You are an expert in grief narratives and metaphor analysis. 
Analyze stories about loss and identify:
1. Primary themes (max 3)
2. Recurring metaphors and symbols
3. Emotional trajectory (sentiment over time)
4. Concrete objects mentioned
5. Temporal language patterns

Return structured JSON for database storage.
```

**Pattern Extraction**

```typescript
// lib/pattern-extractor.ts
async function extractPatternsFromCorpus() {
  const analyses = await getAll AnalysisResults();
  
  // Theme clustering
  const themes = clusterThemes(analyses);
  
  // Metaphor frequency
  const metaphors = aggregateMetaphors(analyses);
  
  // Object co-occurrence
  const coOccurrences = calculateCoOccurrences(analyses);
  
  // Emotional patterns
  const emotionalPatterns = identifyEmotionalPatterns(analyses);
  
  return { themes, metaphors, coOccurrences, emotionalPatterns };
}
```

**Deliverables**
- ✅ All 500+ stories analyzed
- ✅ Pattern database populated
- ✅ Top 50 themes identified
- ✅ Symbol frequency ranked
- ✅ Co-occurrence matrix built

---

## Week 5-6: Symbol Library Expansion

### Goals
- Create 100+ intricate SVG elements
- Map symbols to learned patterns
- Build composition rules

### Symbol Creation Pipeline

**From Pattern Analysis → SVG Creation**

```
Pattern: "hands" (284 occurrences)
Co-occurs with: thread(47), window(31), photograph(28)

Generate:
1. hands_reaching.svg
2. hands_holding_thread.svg
3. hands_clasped.svg
4. hands_open_empty.svg
5. hands_touching_window.svg
6. hands_with_photograph.svg
... (10-15 variations)
```

**Assisted Creation Process**

1. **AI sketch generation**
   ```
   Prompt: "Intricate paper-cut silhouette of reaching hands 
   in the style of Lotte Reiniger, with decorative cutout 
   patterns in the palms, black on white, suitable for shadow 
   puppet theater"
   
   → Stable Diffusion → Trace to SVG → Hand-refine paths
   ```

2. **Procedural variations**
   ```typescript
   function generateHandVariation(params: {
     gesture: 'reaching' | 'open' | 'clasped',
     cutoutDensity: number,
     scale: number
   }): SVGPath {
     // Algorithmic path generation
   }
   ```

3. **Manual crafting (highest quality)**
   - 20-30 core symbols hand-drawn
   - Each with intricate cutout patterns
   - Multiple detail levels

**Target Library: 100-150 SVG elements**
- 25 figure variations
- 20 flora/nature
- 15 architectural frames
- 20 objects
- 10 creatures
- 10 abstract/decorative patterns

**Deliverables**
- ✅ 100+ SVG symbols created
- ✅ Each tagged with keywords
- ✅ Layering hierarchy defined
- ✅ Cutout patterns added
- ✅ All stored in database

---

## Week 7-8: Composition Engine

### Goals
- Build intelligent scene composition
- Implement layout rules
- Create temporal arc system

### Composition Algorithm

```typescript
// lib/composition-engine.ts

interface CompositionPlan {
  frame: SVGElement;
  background: SVGElement[];
  midground: SVGElement[];
  foreground: SVGElement[];
  layout: LayoutRule;
  temporalArc: TimelineEvent[];
}

function composeScene(analysis: AnalysisResult): CompositionPlan {
  // 1. Select frame based on primary theme
  const frame = selectFrame(analysis.themes[0]);
  
  // 2. Select symbols based on frequency + co-occurrence
  const symbols = selectSymbols({
    objects: analysis.objects,
    coOccurrenceWeights: getCoOccurrenceWeights(),
    maxElements: 5
  });
  
  // 3. Distribute across layers
  const layers = distributeToLayers(symbols, analysis.emotionalArc);
  
  // 4. Apply spatial layout rules
  const layout = applyLayoutRules(analysis.themes, symbols);
  
  // 5. Generate temporal animation arc
  const timeline = generateTimeline(analysis.emotionalArc, symbols);
  
  return { frame, ...layers, layout, timeline };
}
```

**Layout Rules (Learned from Patterns)**

```typescript
const COMPOSITION_RULES = {
  'incomplete_ritual': {
    frameStyle: 'partial_arch',
    primaryPosition: 'off_center',
    objectPlacement: 'suspended',
    negativeSpace: 'emphasized',
    symmetry: false
  },
  
  'tactile_memory': {
    frameStyle: 'textile_border',
    primaryPosition: 'centered',
    objectPlacement: 'flowing',
    textureIntensity: 'high',
    symmetry: false
  },
  
  'threshold_moment': {
    frameStyle: 'doorway',
    primaryPosition: 'at_threshold',
    objectPlacement: 'divided',
    depth: 'pronounced',
    symmetry: true
  }
  // ... learned from corpus analysis
};
```

**Temporal Arc System**

```typescript
interface TimelineEvent {
  startTime: number; // seconds
  duration: number;
  element: SVGElement;
  animation: Animation;
}

function generateTimeline(
  emotionalArc: EmotionalArc,
  elements: SVGElement[]
): TimelineEvent[] {
  const storyDuration = 165; // 2:45 average
  
  return [
    // Opening: Establish atmosphere
    { time: 0, duration: 30, element: 'frame', animation: 'fade_in' },
    { time: 10, duration: 40, element: 'background', animation: 'emerge' },
    
    // Development: Introduce elements
    { time: 30, duration: 45, element: 'primary_figure', animation: 'materialize' },
    { time: 50, duration: 40, element: 'key_object', animation: 'appear' },
    
    // Climax: Maximum complexity
    { time: 90, duration: 45, element: 'all', animation: 'peak_intensity' },
    
    // Resolution: Simplification
    { time: 135, duration: 30, element: 'secondary', animation: 'dissolve' },
    { time: 150, duration: 15, element: 'primary', animation: 'linger' }
  ];
}
```

**Deliverables**
- ✅ Composition engine working
- ✅ 10+ layout rule patterns
- ✅ Temporal arc generator
- ✅ Test with 50 stories from corpus

---

## Week 9-10: AI-Assisted Generation

### Goals
- Integrate Stable Diffusion
- Vector tracing pipeline
- Quality filtering system

### Hybrid Generation Flow

```
Story Analysis
    ↓
┌───────────────────────────────┐
│ Is there a good pattern match?│
└───────────┬───────────────────┘
            │
      ┌─────┴─────┐
     YES          NO
      │            │
      ↓            ↓
  Use Library   Generate New
   + Compose    with AI
      │            │
      │            ↓
      │     ┌──────────────┐
      │     │ SD Prompt    │
      │     │ Engineering  │
      │     └──────┬───────┘
      │            ↓
      │     ┌──────────────┐
      │     │ Stable       │
      │     │ Diffusion    │
      │     └──────┬───────┘
      │            ↓
      │     ┌──────────────┐
      │     │ Trace to SVG │
      │     └──────┬───────┘
      │            ↓
      │     ┌──────────────┐
      │     │ Style Check  │
      │     │ & Refinement │
      │     └──────┬───────┘
      │            │
      └────────┬───┘
               ↓
         Final Visual
```

**SD Prompt Engineering**

```typescript
function constructSDPrompt(analysis: AnalysisResult): string {
  const theme = analysis.themes[0];
  const objects = analysis.objects.slice(0, 3);
  const mood = emotionalTone(analysis.emotionalArc);
  
  return `Intricate black paper-cut silhouette shadow puppet in the 
  style of Lotte Reiniger, depicting ${objects.join(' and ')}, 
  conveying ${mood}, with ornate decorative cutout patterns, 
  theatrical composition, suitable for rear projection, 
  high contrast, elegant, ${theme} theme, 
  professional shadow theater aesthetic`;
}
```

**Vector Tracing**

```typescript
async function traceToSVG(imageBuffer: Buffer): Promise<string> {
  // Use potrace or similar
  const traced = await potrace.trace(imageBuffer, {
    threshold: 128,
    turdSize: 2,
    optCurve: true
  });
  
  // Clean and optimize
  const optimized = await svgo.optimize(traced);
  
  // Add cutout patterns programmatically
  const withCutouts = addDecorativeCutouts(optimized);
  
  return withCutouts;
}
```

**Quality Filtering**

```typescript
function meetsQualityStandards(svg: string): boolean {
  return (
    hasAppropriateComplexity(svg) &&
    maintainsStyleConsistency(svg) &&
    hasGoodNegativeSpace(svg) &&
    fitsAestheticGuidelines(svg)
  );
}
```

**Deliverables**
- ✅ SD integration working
- ✅ Prompt engineering refined
- ✅ SVG tracing pipeline
- ✅ Quality filter validated
- ✅ Generated 20 unique visuals

---

## Week 11-12: Integration & Polish

### Goals
- Connect to main app
- Performance optimization
- User testing & refinement

### Main App Integration

```typescript
// Update app/story/[id]/page.tsx

import IntricateShadow from '@/components/IntricateShadow';
import { generateVisualFromAnalysis } from '@/lib/visual-generator';

export default async function StoryPage({ params }) {
  const story = await getStory(params.id);
  
  // Check if visual already generated
  let visual = await getStoredVisual(story.id);
  
  if (!visual) {
    // Analyze story
    const analysis = await analyzeStory(story.transcript);
    
    // Generate visual using learned system
    visual = await generateVisualFromAnalysis(analysis);
    
    // Cache result
    await storeVisual(story.id, visual);
  }
  
  return <IntricateShadow composition={visual} />;
}
```

**Performance Optimization**

- Pre-generate visuals during transcription
- Cache SVG compositions in CDN
- Lazy load animation components
- Optimize SVG file sizes

**Continuous Learning Loop**

```typescript
// scripts/weekly-reanalysis.ts
async function weeklyPatternUpdate() {
  // Get new stories from last week
  const newStories = await getStoriesSince(oneWeekAgo);
  
  // Analyze them
  const analyses = await Promise.all(
    newStories.map(analyzeStory)
  );
  
  // Update pattern database
  await updatePatternFrequencies(analyses);
  await discoverNewPatterns(analyses);
  
  // Regenerate composition rules
  await recomputeCompositionRules();
  
  console.log('Pattern database updated');
}
```

**Deliverables**
- ✅ Full system integrated
- ✅ Performance optimized
- ✅ Tested with 100 test stories
- ✅ Documentation complete
- ✅ Continuous learning active

---

## Success Metrics

### Quantitative
- **Corpus size**: 500+ analyzed stories
- **Pattern library**: 50+ identified patterns
- **Symbol library**: 100+ SVG elements
- **Coverage**: 90%+ of new stories match learned patterns
- **Generation time**: <5 seconds per visual
- **Quality score**: 80%+ pass aesthetic filter

### Qualitative
- Visuals feel emotionally appropriate
- Unexpected/beautiful pattern discoveries
- System surprises us with connections
- Visitors report visual resonance

---

## Budget Estimate

### API Costs
- **GPT-4 Analysis**: 500 stories × $0.50 = $250
- **Stable Diffusion**: 100 generations × $0.10 = $10
- **Monthly re-analysis**: ~$50/month

### Time Investment
- **Development**: 240 hours (30 hrs/week × 8 weeks)
- **SVG Creation**: 60 hours (100 symbols × 36 min each)
- **Testing/Refinement**: 40 hours

### Total: ~$500 + 340 hours over 12 weeks

---

## Risk Mitigation

**Risk 1: Pattern quality**
- Mitigation: Manual review of top 20 patterns
- Fallback: Hand-curated pattern library

**Risk 2: AI generation consistency**
- Mitigation: Strict quality filters
- Fallback: Use library-only mode

**Risk 3: Corpus bias**
- Mitigation: Diverse source collection
- Monitoring: Track demographic/theme coverage

**Risk 4: Processing time**
- Mitigation: Background jobs, caching
- Optimization: Pre-compute common patterns

---

## Next Immediate Steps (This Week)

1. ✅ Create Supabase tables for corpus
2. ✅ Build corpus collection script
3. ✅ Set up GPT-4 analysis pipeline
4. ⏳ Gather first 100 stories
5. ⏳ Test analysis on 10 stories
6. ⏳ Validate pattern extraction logic

**Ready to start?** I can build the data infrastructure right now.
