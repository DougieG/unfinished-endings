# Intricate Shadow Puppet System v2.0
## Architecture for Paper-Cut Style Visuals

Inspired by your reference images (Lotte Reiniger / scherenschnitte style)

---

## Three-Part System

### 1. **SVG Element Library** (100+ hand-crafted pieces)

`lib/svg-library.ts` - Collection of intricate SVG paths:

**Categories:**
- **Figures** (30+): reaching hands, embracing couples, solitary silhouettes, children, elderly
- **Flora** (25+): ornate trees, vines, flowers, leaves with decorative cutouts
- **Frames** (20+): arched doorways, windows, garden gates, theatrical prosceniums
- **Objects** (20+): books, candles, chairs, clocks, mirrors - each with interior patterns
- **Creatures** (15+): birds, butterflies, fish, moths - with wing/scale cutouts
- **Patterns** (20+): decorative borders, lattice work, filigree, geometric frames

**Each element includes:**
- Decorative cutout holes (circles, diamonds, organic shapes)
- Layering information (foreground/mid/background)
- Keyword triggers
- Transform/scale metadata

---

### 2. **Procedural Composition Engine** (Smart assembly)

`lib/composition-engine.ts` - Intelligently combines SVG elements:

```typescript
compose({
  keywords: ['grandmother', 'thread', 'hands', 'window'],
  sentiment: 'melancholic',
  duration: 165
})
→ Returns layered scene:
  [background] ornate_window_frame + vine_border
  [midground] elderly_figure_seated
  [foreground] hands_holding_thread + decorative_spool
```

**Rules:**
- Always include decorative frame (arch, trees, border)
- Match 2-4 elements to keywords
- Balance composition (don't overcrowd)
- Ensure visual hierarchy (foreground larger than background)
- Add ambient patterns (floating leaves, light rays, particles)

---

### 3. **Evolution/Animation System** (Living scenes)

Instead of static images, scenes **subtly evolve**:

**Techniques:**
- **Slow morphing**: SVG paths interpolate (tree branches grow/sway)
- **Layered parallax**: Foreground/background move at different speeds
- **Emerging details**: Cutout patterns slowly appear (fade in over 30s)
- **Particle overlay**: Floating elements (leaves, dust, light particles)
- **Breathing motion**: Entire composition scales 0.98 ↔ 1.02
- **Light animation**: Warm amber glow pulses gently

**Timeline example (2min story):**
```
0:00 - Initial composition fades in
0:10 - Decorative patterns emerge
0:30 - Subtle morphing begins (branches sway)
1:00 - Particle layer activates
1:30 - Elements subtly shift position
2:00 - Slow fade out with lingering glow
```

---

## Visual Aesthetic

**Color Palette:**
- Primary: Pure black silhouettes (#000000)
- Cutouts: Warm cardboard glow (#E8DCC4) 40-60% opacity
- Backlight: Amber gradient (#F4A259 → #D4A574)
- Accents: Pale teal highlights (#B8D4D4) 20% opacity (rare)

**Effects:**
- Inner glow on cutout holes
- Soft drop shadows for depth
- Gaussian blur on background layers (1-2px)
- Warm color temperature filter

**Frame rate:**
- 60fps for smooth motion
- Subtle animations (nothing jarring)
- All motion uses easing curves

---

## Implementation Status

✅ **Phase 1 (Complete):** Basic canvas system
🔨 **Phase 2 (In Progress):** SVG library foundation
⏳ **Phase 3 (Next):** Build 100+ SVG elements
⏳ **Phase 4:** Composition engine
⏳ **Phase 5:** Evolution/animation system

---

## Next Steps

I'll create in this order:

1. **10 sample intricate SVG elements** (one per category) → Test aesthetic
2. **Basic composition engine** → Prove it can combine elements
3. **Animation system prototype** → Show morphing/evolution
4. **Expand to 100+ elements** → Full library
5. **Polish & optimize** → Performance, beauty, variety

Want me to proceed with Step 1 (create 10 beautiful SVG elements)?
