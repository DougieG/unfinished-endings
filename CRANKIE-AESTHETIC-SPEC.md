# Crankie Shadow Puppet Aesthetic Specification
## Production-Ready Image Generation Prompts

---

## Overview

This document defines the **definitive aesthetic** for Brooke's crankie shadow puppet images. These specifications are engineered to eliminate complexity, force minimalism, and lock the model into an exact cardboard-cutout, flat-shadow, children's-puppet-theater look.

---

## 🎯 Core Aesthetic Principle

**Think: Cut-paper shapes taped to chopsticks.**

All images must appear as if:
- Hand-cut from black cardboard or construction paper by a child (ages 5-10)
- Held by thin visible rods
- Backlit by a softly glowing paper screen
- Created at a children's theater craft level, NOT professional illustration

---

## ✅ Visual Requirements (MANDATORY)

### **Overall Look**
- Ultra-minimal, flat, silhouette-only characters
- Shapes appear hand-cut from black cardboard or construction paper
- **No internal details** (no facial features, textures, or interior lines)
- Simple geometry: chunky limbs, blocky heads, rounded or triangular bodies
- 2–4 shapes per scene maximum, never cluttered
- Soft, diffused backlight behind a translucent paper screen
- Characters held by thin visible rods
- No shading, no gradients, no lighting complexity
- Edges slightly imperfect, hand-cut feeling—**NOT vector crisp**
- Children's theater scale, not ornate Javanese or Turkish shadow puppetry

### **Shape Guidelines**
- Chunky, blocky silhouettes
- Basic geometry only: circles, triangles, rectangles, simple curves
- Thick limbs and simple body forms
- No thin or delicate shapes
- Imperfect hand-cut edges (not clean digital edges)

### **Background & Props**
- Minimal scenery: a tree, a moon circle, a hill, a house silhouette
- Very simple forms that read clearly
- Props must be iconic silhouettes recognizable at a glance
- Everything at 5–10 year-old craft level

---

## ❌ Forbidden Elements (NEVER INCLUDE)

The model previously made these mistakes—**eliminate completely**:

- ❌ Filigree
- ❌ Texturing
- ❌ Lacework
- ❌ Rich or ornate costumes
- ❌ Internal cutouts or details
- ❌ Realistic proportions
- ❌ Thin, complex shapes
- ❌ Too many objects (>4 shapes)
- ❌ Dramatic cinematic lighting
- ❌ Complex shadows
- ❌ Realistic perspective
- ❌ Gradient effects
- ❌ Shading or 3D appearance
- ❌ Professional illustration quality
- ❌ Vector-crisp clean edges
- ❌ Decorative elements
- ❌ Facial features
- ❌ Clothing details

---

## 🔥 Master Generation Prompt

**Copy/paste this for Replicate (SDXL, FLUX, or SD3):**

```
Ultra-minimal handmade shadow puppets on a backlit paper screen. 
All characters and objects are solid black silhouettes with no internal details,
as if cut roughly from cardboard by a child. Thick, simple, blocky shapes.
Imperfect hand-cut edges. Figures on thin stick rods. 

The scene should look like a small DIY puppet theater: 
a softly glowing white parchment backdrop, subtle falloff, no gradients, 
no textures, no shading, no complexity. 
Only 2–4 silhouettes per scene, spaced clearly, extremely simple. 
Props and scenery must be basic silhouettes: a round moon, a single tree,
a hill, a house shape, a simple animal. 
No decorative elements. No ornate puppet styles. 
Everything must read as basic paper cutouts placed in front of light.
```

---

## 🚫 Negative Prompts (CRITICAL FOR MINIMALISM)

**Paste into negative prompt field:**

```
high detail, intricate, detailed textures, ornate decoration, filigree, 
gradient lighting, rim light, internal cutouts, facial features, clothing details, 
realistic anatomy, thin delicate shapes, shading, 3D look, 
complex backgrounds, too many objects, realism, photographic realism, 
vector crispness, digital clean edges, dramatic shadows, 
cinematic lighting, depth, perspective, clutter, busy composition
```

---

## 📐 Technical Specifications

### **Image Generation Settings**
```typescript
{
  width: 1024,
  height: 768,
  scheduler: "K_EULER",
  num_inference_steps: 30,
  guidance_scale: 10, // Higher = stricter prompt following
  seed: 42 // Fixed for consistency
}
```

### **Model**
- Stable Diffusion XL (SDXL)
- Model: `stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b`

---

## 🎨 GPT-4 Beat Analysis Guidelines

When extracting narrative beats, GPT-4 must create **ultra-simple visual descriptions**:

### **Good Examples:**
✅ "Chunky figure standing by round moon"  
✅ "Blocky house with triangular roof"  
✅ "Simple tree with rounded crown next to square figure"  
✅ "Two thick silhouettes facing each other"

### **Bad Examples (Too Complex):**
❌ "Ornate figure in flowing robes with intricate patterns"  
❌ "Detailed Victorian house with decorative trim"  
❌ "Elaborate tree with textured bark and delicate leaves"  
❌ "Realistic portrait showing facial expression"

---

## 🎭 Reference Style

### **Think:**
- Elementary school craft project
- Cardboard shapes on chopsticks
- Hand-cut with safety scissors
- Black construction paper on white backdrop
- Kara Walker simplicity
- Chinese shadow puppet minimalism (NOT ornate Indonesian wayang)

### **NOT:**
- Professional shadow puppet artistry
- Javanese/Balinese ornate puppets
- Victorian silhouette portraits with fine detail
- Modern vector graphics
- Professional illustration
- Commercial animation

---

## 📊 Quality Checklist

Before approving a generated image, verify:

- [ ] Only 2-4 distinct shapes visible
- [ ] All shapes are solid black (no internal lines)
- [ ] Edges look hand-cut (slightly imperfect)
- [ ] No decorative patterns or filigree
- [ ] No facial features or clothing details
- [ ] Background is simple white/light
- [ ] Could be recreated by cutting cardboard shapes
- [ ] Readable at children's theater craft level
- [ ] No gradients, shading, or 3D effects
- [ ] Maximum simplicity maintained

---

## 🔧 Implementation Files

The specifications are implemented in:

1. **`lib/narrative-beats.ts`**
   - `BEAT_ANALYZER_PROMPT`: Instructs GPT-4 to create minimal descriptions
   - `beatToSDPrompt()`: Converts beats to SDXL prompts with aesthetic constraints

2. **`lib/crankie-generator.ts`**
   - Replicate API call with negative prompts
   - Image generation parameters
   - Fixed seed for consistency

---

## 💡 Design Philosophy

> "A good shadow puppet image should look like something a creative 8-year-old could make with cardboard, scissors, and tape—evocative through simplicity, not complexity."

The goal is **emotional resonance through minimalism**, not technical prowess.

---

## 🚀 Generation Workflow

```bash
# Generate new crankies with updated aesthetic
npm run generate-crankies
```

All new images will automatically use the updated specifications defined in this document.

---

## 📝 Version History

- **v2.0** (Current) - Ultra-minimal cardboard cutout aesthetic
  - Eliminated all ornate/decorative elements
  - Enforced 2-4 shape maximum
  - Added comprehensive negative prompts
  - Updated GPT-4 beat analyzer for simpler descriptions

- **v1.0** (Previous) - Lotte Reiniger style
  - More detailed, ornate shadow puppet aesthetic
  - Did not prevent filigree and complex patterns

---

## 🎯 Success Metrics

Images should achieve:
- Instant visual readability (< 1 second to understand scene)
- Emotional impact through simplicity
- Consistency across all scenes in a panorama
- Child-like handmade quality
- Zero decorative complexity
- Maximum of 4 shapes per scene
