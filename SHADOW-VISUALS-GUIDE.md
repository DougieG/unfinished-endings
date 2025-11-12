# Shadow Puppet Visual System - Complete Guide

## How It Works: The Full Pipeline

```
1. Person records story (audio)
   "My grandmother kept a drawer full of thread spools..."

2. Audio → Transcript (OpenAI Whisper)
   "My grandmother kept a drawer full of thread spools, red and blue, 
    from her sewing days. She'd touch them gently with her weathered hands..."

3. Transcript → Keywords (OpenAI GPT or TF-IDF)
   ["grandmother", "thread", "sewing", "hands", "touch", "red", "blue"]

4. Keywords → Motif Categories (rule-based mapping)
   Keywords contain "thread" → FABRIC motif
   Keywords contain "hands" → HAND motif
   
   Primary motif: FABRIC (first match)
   Secondary: HAND (could be used later)

5. Motif → Visual Animation (Canvas drawing)
   FABRIC motif triggers drawFabricMotif()
   → Draws wavering ribbon silhouette that breathes and flows

6. Display
   Canvas renders at 20fps with gentle, organic animation
   Shown during story playback on projection/screen
```

---

## The 7 Visual Motifs (What You'll Actually See)

### 1. **FABRIC** - Wavering Ribbon

**Triggered by keywords:** sock, thread, fabric, cloth, dress, shirt, blanket, ribbon

**Visual Description:**
- Organic, flowing ribbon shape
- Undulates like fabric in gentle breeze
- Vertical wave motion (breathing up and down)
- Horizontal ripple (side to side drift)
- Think: silk scarf floating, grandmother's dress hem

**Animation:**
```
    ╱╲╱╲╱╲
   ╱      ╲
  ╱        ╲     ← Gentle wave
 ╱          ╲
╱            ╲
```

**Code behavior:**
- 30 points around an oval path
- Each point oscillates based on time + position
- Compressed vertically (60% height) for ribbon effect
- Slow drift up/down (sin wave at 0.5 speed)

---

### 2. **HAND** - Articulated Fingers

**Triggered by keywords:** hand, touch, finger, palm, grasp, hold, reach

**Visual Description:**
- Silhouette of palm with 5 fingers
- Fingers slowly curl and uncurl (like grasping)
- Central ellipse (palm)
- Radiating rectangles (fingers)
- Think: reaching hand, gentle touch, letting go

**Animation:**
```
   | | | | |    ← Fingers
   |||||||||
   \_______/    ← Palm
```

**Code behavior:**
- Palm: 60×80 ellipse
- 5 fingers spread at angles (-0.6 to +0.6 radians)
- Each finger rotates slightly (curl) based on sin(time)
- Slow, breathing curl motion

---

### 3. **PORTAL** - Drifting Doorway/Window

**Triggered by keywords:** window, door, key, gate, threshold, frame, opening

**Visual Description:**
- Rectangular frame (like window or doorway)
- Entire frame drifts slowly (floating feeling)
- Inner frame creates depth
- Think: looking through a window, threshold between worlds

**Animation:**
```
┌────────────┐
│            │
│  ┌──────┐  │  ← Inner frame (lighter)
│  │      │  │
│  └──────┘  │
│            │
└────────────┘
    ↓↗↖↙      ← Slow drift in circular path
```

**Code behavior:**
- Outer rect: 200×280 pixels
- Drifts in small circle (sin/cos at different speeds)
- Semi-transparent inner frame (30% opacity)
- Creates parallax/depth effect

---

### 4. **BIRD** - Wing Flap

**Triggered by keywords:** bird, crane, wing, feather, flight, nest

**Visual Description:**
- Simple bird silhouette from above
- Wings flap up and down
- Oval body with two curved wings
- Think: crane in flight, mourning dove, soul departing

**Animation:**
```
  ╱─╲   ╱─╲     ← Wings up
 ╱   ⚫   ╲     ← Body
  ╲─╱   ╲─╱     ← Wings down
```

**Code behavior:**
- Central ellipse body (30×50)
- Two bezier curve wings (left and right)
- Wing tips move up/down ±30 pixels
- Rapid flap (sin at 3× speed)

---

### 5. **LIGHT** - Flickering Candle

**Triggered by keywords:** candle, light, flame, glow, shadow, lamp, shine

**Visual Description:**
- Candle with flame on top
- Flame flickers organically (multi-frequency)
- Rectangular candle base
- Teardrop/almond flame shape
- Think: memorial candle, vigil light, fading glow

**Animation:**
```
     ▲         ← Flame (flickers)
    ╱ ╲
   ╱   ╲
  │     │      ← Candle base (stable)
  │     │
  │     │
  └─────┘
```

**Code behavior:**
- Base: 30×100 rectangle
- Flame: bezier curve teardrop
- Flicker: combination of fast (4×) and very fast (7×) sin waves
- 70% opacity for flame translucency
- Irregular movement feels organic

---

### 6. **NATURE** - Swaying Tree

**Triggered by keywords:** tree, flower, leaf, garden, water, sky, rain, wind

**Visual Description:**
- Tree silhouette with trunk and branches
- Branches sway gently in wind
- 5 horizontal branches at different heights
- Top branches sway more than bottom (natural)
- Think: willow tree, garden branches, growth

**Animation:**
```
      ─┬─       ← Top (sways most)
     ──┼──
    ───┼───
   ────┼────    ← Bottom (sways least)
  ─────┼─────
       ┃
       ┃        ← Trunk (stable)
       ┃
```

**Code behavior:**
- Trunk: 40×150 rectangle (vertical)
- 5 branches extending left/right
- Each branch rotates slightly (±0.1 radians)
- Sway amplitude varies by branch height
- Slow, gentle breathing motion

---

### 7. **ABSTRACT** - Drifting Particles (Fallback)

**Triggered when:** No keywords match any category

**Visual Description:**
- 8 circles drifting in orbital pattern
- Circles pulse in size (breathing)
- Low opacity (ghostly, memory-like)
- Organic, Perlin noise-like movement
- Think: dust motes, memory fragments, the ineffable

**Animation:**
```
    ○     ○
        ●         ← Circles orbit slowly
  ○           ○
    ○     ○
        ○
```

**Code behavior:**
- 8 circles in circular arrangement
- Each orbits around center point
- Radius varies per circle (100-130 pixels)
- Size pulses (20-40 pixels diameter)
- Very low opacity (15%) - subtle, layered effect
- Each circle offset in time for organic feel

---

## Example Story Flows

### Example 1: "Grandmother's Sewing Box"

**Story:** 
> "I found my grandmother's sewing box after she passed. Inside was a single red thread wound around a spool..."

**Keywords extracted:** `["grandmother", "sewing", "thread", "spool", "red"]`

**Motifs matched:** 
- `thread` → **FABRIC**
- (No other matches)

**Visual displayed:** 
→ **Wavering ribbon silhouette** in black (soot color)
→ Gentle undulation like fabric breathing
→ Plays during entire 23-second story

---

### Example 2: "Window Ritual"

**Story:**
> "Every morning my father would stand at the kitchen window with his coffee..."

**Keywords extracted:** `["father", "morning", "window", "coffee", "ritual"]`

**Motifs matched:**
- `window` → **PORTAL**

**Visual displayed:**
→ **Rectangular doorway/window frame**
→ Slowly drifts in place (floating feeling)
→ Inner frame creates depth
→ Plays during 28-second story

---

### Example 3: "Paper Cranes"

**Story:**
> "We used to fold paper cranes together... if I made a thousand, I could make a wish..."

**Keywords extracted:** `["crane", "paper", "folding", "wish", "thousand"]`

**Motifs matched:**
- `crane` → **BIRD**

**Visual displayed:**
→ **Bird silhouette with flapping wings**
→ Gentle wing motion (like origami crane in flight)
→ Plays during 25-second story

---

## Visual Settings & Aesthetics

**Canvas:** 800×600 pixels (4:3 aspect ratio)

**Color:** 
- Only black (#1A1A1A - "soot" color)
- No gradients, no color
- Pure silhouette

**Animation speed:**
- Updates 20 times per second (50ms interval)
- Slow, breathing movements (300-800ms periods)
- Never jarring or fast

**Mood:**
- Contemplative
- Gentle
- Meditative
- Shadow-theater traditional
- Respectful of memory

---

## How to Improve/Customize the Visuals

### Easy Changes

**1. Add more trigger words:**
```typescript
// In lib/keywords.ts
{
  category: 'fabric',
  keywords: ['sock', 'thread', 'fabric', /* ADD: */ 'scarf', 'quilt', 'lace']
}
```

**2. Adjust animation speed:**
```typescript
// In components/ShadowPuppet.tsx
setInterval(() => {
  setTime(t => t + 0.02); // Was 0.01 (slower) → 0.02 (faster)
}, 50);
```

**3. Change canvas size:**
```typescript
<canvas
  width={1200}  // Was 800 (wider)
  height={900}  // Was 600 (taller)
/>
```

### Advanced Enhancements

**1. Add particle effects:**
```typescript
function drawParticles(ctx, time) {
  // Floating dust motes
  for (let i = 0; i < 20; i++) {
    const x = (time * 10 + i * 100) % canvas.width;
    const y = 100 + Math.sin(time + i) * 50;
    ctx.globalAlpha = 0.1;
    ctx.fillRect(x, y, 2, 2);
  }
}
```

**2. Layer multiple motifs:**
```typescript
// Instead of just primary motif, draw all matched motifs
motifs.forEach((motif, index) => {
  ctx.globalAlpha = 1 / (index + 1); // Fade secondary motifs
  drawMotif(motif, ctx, time);
});
```

**3. Add subtle color:**
```typescript
// Instead of pure black, use very dark sepia
ctx.fillStyle = '#2A2520'; // Dark sepia
// Or semi-transparent amber glow
ctx.fillStyle = 'rgba(244, 162, 89, 0.1)'; // Very faint amber
```

**4. Sound-reactive visuals:**
```typescript
// If you have audio playback, analyze waveform
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
// Use analyser.getByteFrequencyData() to drive animation intensity
```

---

## Technical Flow Diagram

```
┌─────────────────────────────────────────────┐
│  STORY PAGE (/story/[id])                   │
│  ┌──────────────────────────────────────┐   │
│  │ StoryPlayer Component                 │   │
│  │                                       │   │
│  │  [Audio Player]                       │   │
│  │  [ShadowPuppet Component]             │   │
│  │  [Transcript]                         │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
           │
           ├─ Props passed: keywords, motifs
           │
           ▼
┌─────────────────────────────────────────────┐
│  SHADOWPUPPET.TSX                           │
│  ┌──────────────────────────────────────┐   │
│  │  1. Receive keywords & motifs         │   │
│  │  2. Start time ticker (setInterval)   │   │
│  │  3. Each frame:                       │   │
│  │     - Clear canvas                    │   │
│  │     - Get primary motif               │   │
│  │     - Call draw function              │   │
│  │  4. Render canvas + keyword labels    │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
           │
           ├─ Motif determines which draw function
           │
           ▼
┌─────────────────────────────────────────────┐
│  DRAW FUNCTIONS                             │
│  ┌──────────────────────────────────────┐   │
│  │  drawFabricMotif()                    │   │
│  │  drawHandMotif()                      │   │
│  │  drawPortalMotif()                    │   │
│  │  drawBirdMotif()                      │   │
│  │  drawLightMotif()                     │   │
│  │  drawNatureMotif()                    │   │
│  │  drawAbstractMotif()                  │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
           │
           ├─ Each uses Canvas 2D API
           │
           ▼
┌─────────────────────────────────────────────┐
│  CANVAS OUTPUT                              │
│  ╔══════════════════════════════════════╗   │
│  ║                                      ║   │
│  ║     [Black silhouette animating]    ║   │
│  ║     [Gentle, breathing motion]       ║   │
│  ║                                      ║   │
│  ║  Keywords: thread · sewing · hands   ║   │
│  ╚══════════════════════════════════════╝   │
└─────────────────────────────────────────────┘
```

---

## Questions to Help You Decide

**1. Are these visuals too simple?**
   - Current: Very minimal, pure black silhouettes
   - Option: Add subtle sepia tones, light particles, depth
   
**2. Should visuals be more literal or more abstract?**
   - Current: Somewhat literal (hand looks like hand, bird like bird)
   - Option: Go more abstract (all become flowing particles/forms)

**3. How fast should they move?**
   - Current: Very slow, meditative (1-3 second cycles)
   - Option: Faster, more dynamic (but might feel less sacred)

**4. Should they respond to audio?**
   - Current: No audio reactivity, just time-based
   - Option: Pulse with voice volume, react to speech cadence

**5. Multiple motifs or just one?**
   - Current: Only shows primary (first matched) motif
   - Option: Layer all matched motifs (more complex but richer)

**What would feel most right for the "sacred, gentle" mood you want?**

---

## Next Steps

**To see these visuals in action:**

1. Open http://localhost:3000/admin
2. Look at existing stories from seed data
3. Click on a story ID to view `/story/[id]` page
4. Shadow puppet will animate based on its keywords

**To customize:**

1. Edit motif mappings in `lib/keywords.ts`
2. Edit draw functions in `components/ShadowPuppet.tsx`
3. Adjust colors in `tailwind.config.ts`
4. Test with different projection materials (muslin, rice paper, etc)

**Questions I can help with:**

- Want to add new motif categories?
- Want to make animations more complex/organic?
- Want to add particle systems or layers?
- Want visuals to respond to audio amplitude?
- Want to test what it looks like rear-projected?

Tell me what changes would feel right for your vision!
