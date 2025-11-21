# 📷 External Webcam Setup Guide
## Optimized for Fixed Installation Camera

---

## Overview

The sketch processing system works perfectly with external USB webcams mounted in a fixed position above the form placement area.

---

## Hardware Setup

### Recommended Equipment

**Webcam:**
- **Resolution:** 1080p minimum (1920×1080)
- **Connection:** USB 2.0 or higher
- **Focus:** Auto-focus or fixed focus at 12-24"
- **Field of view:** Wide enough for 8.5"×11" paper

**Examples:**
- Logitech C920/C922 (excellent quality)
- Logitech C270 (budget option)
- Any 1080p USB webcam

**Mounting:**
- Desk mount arm (flexible positioning)
- Tripod above table
- Wall/ceiling mount (permanent install)

**Lighting:**
- Two LED desk lamps at 45° angles
- Or: Single overhead LED panel
- Daylight temperature (5000-6500K)

---

## Physical Installation

### Station Layout

```
        Computer Monitor
┌─────────────────────────────┐
│  Interface visible to user  │
│  [Camera preview shown]     │
└─────────────────────────────┘
              ↓
       ┌─────────────┐
       │   Webcam    │  ← 12-24" above
       │   (USB)     │
       └─────────────┘
              ↓
    ┌──────────────────────┐
    │   Placement Area     │  ← Flat surface
    │   [Form goes here]   │
    │                      │
    │   8.5" × 11"        │
    └──────────────────────┘
```

### Webcam Height & Angle

**Height:** 12-24 inches above surface
- Lower = larger form in frame
- Higher = more workspace, slightly smaller form

**Angle:**
- **Straight down** (90°) = Best for flat forms
- **Slight tilt** (75-80°) = Easier to position, less glare

**Test position:**
1. Place form on surface
2. Check preview - all edges visible?
3. Ensure text readable
4. Adjust height/angle as needed

### Surface Preparation

**Best surface:**
- ✅ White or light gray
- ✅ Matte finish (not glossy)
- ✅ Flat and level
- ✅ Good contrast with form

**Optional enhancements:**
- Mark corners with tape (placement guides)
- Add "Place form here" label
- Use contrasting mat/backdrop

### Lighting Setup

**Option A: Two-Light Setup (Recommended)**
```
    Light 1              Light 2
       ↘                  ↙
         ┌──────────┐
         │  Camera  │
         └──────────┘
              ↓
         [Form area]
```
- Two lamps at 45° angles
- Equal brightness
- No shadows on form

**Option B: Overhead Light**
```
         [Overhead LED panel]
                ↓
         ┌──────────┐
         │  Camera  │
         └──────────┘
              ↓
         [Form area]
```
- Single overhead light
- Diffused (not direct)
- Even coverage

**Test lighting:**
- Capture test photo
- Check for shadows
- Verify text readability
- Adjust position/brightness

---

## Software Configuration

### Browser Camera Selection

**First time setup:**

1. Navigate to `/playback/pic`
2. Click "📷 Use Camera"
3. Browser prompts: "Allow camera access?"
   - Click **Allow**
4. Browser prompts: "Which camera?"
   - Select your **external USB webcam**
   - Click **Allow**

5. **Browser remembers this choice** ✅

**Subsequent uses:**
- Browser automatically uses external webcam
- No selection needed each time

### Verify Camera Selection

**Check which camera is active:**

In browser dev console (F12):
```javascript
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    devices.forEach(device => {
      console.log(device.kind, device.label);
    });
  });
```

Look for your webcam name in the list.

---

## Alignment & Calibration

### Form Placement

**On-screen guides help users position form:**

```
┌────────────────────────────────┐
│  Camera Preview                │
│  ┌──────────────────────────┐  │
│  │ Alignment Rectangle      │  │ ← Form should fill this
│  │                          │  │
│  │ "Place form within box"  │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

### Visual Alignment Aids

**On table/surface:**
- Corner markers (tape or dots)
- Rectangle outline
- "Place here" label

**On screen:**
- Guide rectangle (shows ideal position)
- Grid overlay (rule of thirds)
- Real-time preview

### Testing Alignment

**Checklist:**
- [ ] Full form visible in preview
- [ ] All corners within guide rectangle
- [ ] Form parallel to camera
- [ ] No shadows on form
- [ ] Text clearly readable
- [ ] Even lighting

---

## User Workflow

### Staff/Visitor Flow

```
1. Staff opens /playback/pic
         ↓
2. Click "📷 Use Camera"
         ↓
3. Camera preview appears
         ↓
4. Place form on marked surface
         ↓
5. Align within guide rectangle
         ↓
6. Click ⬤ CAPTURE
         ↓
7. Review captured image
         ↓
8. Retake if needed, or ✓ Confirm
         ↓
9. Wait 15-30 seconds for processing
         ↓
10. Review/edit extracted data
         ↓
11. Submit → Story created!
```

### No Device Handling

**Benefits of fixed camera:**
- Visitor doesn't hold anything
- Both hands free for form
- No shaky images
- Consistent quality
- Accessible for all users

---

## Optimizations for Fixed Setup

### Simplified Interface

Since camera doesn't move, remove unnecessary controls:

**Hide:**
- ~~🔄 Flip camera~~ (only one camera)
- ~~Zoom controls~~ (fixed position)

**Show:**
- ✅ Large capture button
- ✅ Alignment guides
- ✅ Preview/retake
- ✅ Cancel option

### Persistent Alignment Guide

**Static overlay since camera doesn't move:**
- Guide rectangle matches form size
- Positioned based on calibration
- Always visible during capture
- Helps users place form perfectly

### Quick Capture Mode

**Optional enhancement:**
```typescript
// Auto-capture when form is well-positioned
if (formDetected && wellAligned) {
  startCountdown(3); // "3... 2... 1... Capture!"
  autoCapture();
}
```

This could be added later if desired.

---

## Troubleshooting

### Camera Not Detected

**Check:**
1. USB cable connected?
2. Camera powered on?
3. Try different USB port
4. Check system device manager
5. Restart browser

**Solution:**
- Replug webcam
- Restart computer if needed
- Update webcam drivers
- Try different browser

### Wrong Camera Selected

**Browser remembers previous choice:**

**Reset camera selection:**
1. Browser settings → Privacy & Security
2. Camera permissions → Find your site
3. "Reset permissions"
4. Refresh page
5. Select correct camera

### Blurry/Out of Focus

**External webcam focus issues:**

**Auto-focus cameras:**
- Point at form for 2 seconds
- Camera auto-focuses
- Then capture

**Fixed-focus cameras:**
- Adjust height to focus distance
- Usually 12-24" is sweet spot
- Test at different heights

**Manual focus:**
- Some webcams have focus ring
- Adjust until form is sharp

### Lighting Issues

**Too dark:**
- Add more light sources
- Increase lamp brightness
- Move lights closer

**Too bright / Glare:**
- Reduce lamp brightness
- Angle lights more to sides
- Use diffusers on lamps
- Move lights farther away

**Shadows:**
- Add second light source
- Use overhead instead of side lights
- Increase room ambient light

### Form Not Fully Visible

**Edges cut off:**

**Solution:**
- Raise camera higher
- Switch to wider FOV webcam
- Zoom out if webcam has zoom
- Adjust camera angle

---

## Recommended Webcam Settings

### Via Webcam Software (if available)

**Brightness:** Auto or 60-70%  
**Contrast:** Auto or 50-60%  
**Saturation:** Low (text clarity more important than color)  
**White Balance:** Auto or Daylight  
**Focus:** Auto (or manual at installation distance)  
**Exposure:** Auto  

### Browser Settings

Usually browser auto-detects best settings, but advanced users can adjust via:

```javascript
const constraints = {
  video: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    brightness: { ideal: 65 },
    contrast: { ideal: 55 }
  }
};
```

---

## Installation Checklist

### Physical Setup

- [ ] External webcam connected via USB
- [ ] Camera mounted 12-24" above surface
- [ ] Angle adjusted (straight down or slight tilt)
- [ ] Flat surface prepared for forms
- [ ] Lighting installed (2 lights at 45° or overhead)
- [ ] Test form placed and fully visible
- [ ] No shadows on form
- [ ] Text clearly readable in preview

### Software Setup

- [ ] Browser allows camera access
- [ ] External webcam selected (not built-in)
- [ ] Camera choice remembered
- [ ] Test capture successful
- [ ] Image quality sufficient for OCR
- [ ] Processing completes successfully

### User Testing

- [ ] Staff trained on workflow
- [ ] Test with multiple forms
- [ ] Alignment guides clear
- [ ] Processing time acceptable (15-30s)
- [ ] OCR accuracy good (85%+)
- [ ] Errors handled gracefully

---

## Maintenance

### Daily
- Check camera is connected
- Verify lighting works
- Test one capture
- Clean camera lens if needed

### Weekly
- Clean surface area
- Check alignment guides still visible
- Test with challenging form (light pencil, etc.)

### Monthly
- Full system test
- Update browser if needed
- Check webcam drivers
- Verify OCR accuracy still high

---

## Advantages vs iPad/Mobile

| Feature | iPad/Mobile | External Webcam |
|---------|-------------|-----------------|
| **Position** | Handheld (varies) | Fixed (consistent) |
| **Quality** | Good | Excellent |
| **Stability** | Can shake | Rock solid |
| **Lighting** | Varies | Optimized |
| **Accessibility** | Hold device | Hands-free |
| **User friction** | Need to lift phone | Just place form |
| **Setup time** | None | One-time setup |
| **Consistency** | Variable results | Perfect every time |

**Winner:** External webcam for installation! 🏆

---

## Sample Shopping List

### Budget Setup (~$50)

- **Webcam:** Logitech C270 ($25)
- **Desk mount:** Basic clamp arm ($15)
- **Lighting:** 2× LED desk lamps ($10)

### Recommended Setup (~$150)

- **Webcam:** Logitech C920 ($70)
- **Desk mount:** Adjustable arm mount ($30)
- **Lighting:** LED panel with dimmer ($50)

### Professional Setup (~$300)

- **Webcam:** Logitech Brio 4K ($150)
- **Boom arm:** Professional mount ($75)
- **Lighting:** 2× studio LED panels ($75)

---

## Summary

### ✅ Perfect for Installation

External webcam setup provides:
- **Consistent results** every time
- **Higher quality** captures
- **Easier workflow** for visitors
- **Professional appearance**
- **Hands-free** operation

### 🚀 Ready to Deploy

The webcam integration already supports external cameras - **no code changes needed!**

Just:
1. Connect external webcam
2. Select it in browser
3. Position & calibrate once
4. Start capturing!

---

**The external webcam setup is the ideal solution for your installation!** 📷✨

**Let me know if you want me to add any specific optimizations for the fixed-camera setup!**
