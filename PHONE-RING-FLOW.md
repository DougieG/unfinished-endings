# 📞 Phone Ring Interaction Flow

**Status:** ✅ Implemented  
**Last Updated:** November 22, 2025

---

## New User Experience

### The Flow

1. **Pick up phone** → Intro message plays
2. **Record story** → Speak your story
3. **Hang up phone** → Recording stops & saves silently
4. **Phone RINGS** 🔔 → Ring tone plays on loop
5. **Pick up phone again** → Outro/thank you message plays
6. **Hang up** → Returns to idle (ready for next person)

---

## Why This Is Better

**Before:**
- User hangs up
- Outro plays immediately while they're putting phone down
- Might miss the message
- No time for background save

**Now:**
- User hangs up
- Recording saves in background
- Phone rings (like a callback!)
- User picks up to hear complete message
- More theatrical, natural interaction
- Gives system time to process

---

## Technical Implementation

### States
```typescript
'idle'       → Waiting for pickup
'intro'      → Playing intro message
'recording'  → Actively recording
'processing' → Saving recording
'ringing'    → Phone is ringing (pick up for outro)
'outro'      → Playing outro message
'error'      → Something went wrong
```

### User Actions
```typescript
// When phone is IDLE
pickup → startSession() → plays intro → starts recording

// When RECORDING
hangup → endSession() → saves recording → startRinging()

// When RINGING
pickup → answerForOutro() → stops ring → plays outro

// When OUTRO playing
hangup → resetToIdle() → back to idle
```

---

## Required Setup

### 1. Upload Ring Tone to Supabase

You need to upload a `phone-ring.mp3` file to your Supabase storage:

**Expected path:**
```
https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/phone-ring.mp3
```

**Steps:**
1. Go to Supabase dashboard
2. Navigate to Storage → `stories` bucket
3. Upload a file named `phone-ring.mp3`
4. Or use custom path and update line 161 in `app/phone/recording/page.tsx`

**Ring tone suggestions:**
- Classic telephone ring (2 rings, pause, repeat)
- Duration: 3-5 seconds per ring cycle
- Volume: moderate (script sets to 70%)
- Format: MP3, 128kbps

---

## Configuration

### Ring Audio Settings

**File:** `app/phone/recording/page.tsx` (lines 154-170)

```typescript
const ringUrl = 'https://brwwqmdxaowvrxqwsvig.supabase.co/storage/v1/object/public/stories/phone-ring.mp3';
ringAudio.current = new Audio(ringUrl);
ringAudio.current.loop = true;      // Rings continuously
ringAudio.current.volume = 0.7;     // 70% volume
```

**To customize:**
- Change `ringUrl` to your ring sound file
- Adjust `volume` (0.0 to 1.0)
- Keep `loop = true` so it rings until answered

### Pause Between Save and Ring

**File:** `app/phone/recording/page.tsx` (line 483)

```typescript
await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
```

**Default:** 1 second pause between "Recording saved!" and ring starts

**To customize:**
- Increase to 2000 for 2 seconds
- Decrease to 500 for faster ring
- Remove entirely for instant ring

---

## Testing Instructions

### Full Flow Test

1. **Start recording**
   - Open `/phone/recording`
   - Pick up phone (keyup event)
   - Hear intro message
   - Recording starts

2. **Make recording**
   - Speak for 10-15 seconds
   - Console shows recording duration

3. **Hang up**
   - Replace phone (keydown event)
   - Console shows "📴 Manual hangup - stopping recording..."
   - Recording saves
   - Console shows "📞 Phone is ringing..."

4. **Observe ringing**
   - UI shows "📞 Ringing... Pick up!"
   - Ring tone plays on loop
   - Status message: "Phone is ringing - pick up to hear message"

5. **Answer ringing phone**
   - Pick up phone again (keyup event)
   - Ring stops
   - Console shows "📞 Answered ringing phone - playing outro..."
   - Outro message plays
   - Status message changes to "Thank you! Hang up when ready."

6. **Hang up after outro**
   - Replace phone (keydown event)
   - Returns to idle state
   - Ready for next recording

### Console Logs to Watch For

```bash
# Recording phase
Key up: c
🎵 Playing INTRO audio: [url]
Recording with mimeType: audio/mp4
⚠️ SILENCE DETECTION DISABLED - recording will only stop on manual hangup

# Hangup and save
Key down: c
📴 Manual hangup - stopping recording...
💾 Saving recording: {size: 123456, ...}
📦 Recording queued for upload: [id]
Recording saved!

# Ringing
📞 Phone is ringing...

# Answer
Key up: c
📞 Answered ringing phone - playing outro...
🎵 Playing OUTRO audio: [url]
Thank you! Hang up when ready.

# Final hangup
Key down: c
(Returns to idle)
```

---

## Troubleshooting

### Ring doesn't play

**Problem:** No sound when ringing starts

**Solutions:**
1. Check if `phone-ring.mp3` exists at the URL
2. Check browser console for audio playback errors
3. Verify audio format is supported (MP3 works everywhere)
4. Check browser audio permissions
5. Visual state should still show "Ringing" even if audio fails

---

### Ring doesn't stop

**Problem:** Ring continues after pickup

**Solutions:**
1. Check console for "Answered ringing phone" message
2. Verify keyup event is firing (log shows "Key up: c")
3. Check if state changed from 'ringing' to 'outro'
4. Manually: page reload will stop it

---

### Can't pick up during ring

**Problem:** Pickup doesn't work when phone is ringing

**Solutions:**
1. Verify state is 'ringing' (check UI or console)
2. Check keyup event handler (line 85-91)
3. Look for console errors
4. Try different key if keyboard mapping changed

---

### Outro plays twice

**Problem:** Outro message plays during hangup AND during ring answer

**Check:** Both `saveRecording` and `saveRecordingAndPlayOutro` should call `startRinging()` not `playClosingMessage()`

---

## Alternative Implementations

### Option 1: No Ring, Just Flash UI
```typescript
const startRinging = () => {
  setState('ringing');
  setStatusMessage('Pick up phone to hear message');
  // No audio, just visual indicator
};
```

### Option 2: Web Audio API Ring
Generate ring tone instead of playing file:
```typescript
const startRinging = () => {
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  oscillator.frequency.value = 440; // A note
  // ... configure ring pattern
};
```

### Option 3: Vibration API (mobile)
```typescript
if ('vibrate' in navigator) {
  navigator.vibrate([500, 200, 500, 200, 500]); // Ring pattern
}
```

---

## Future Enhancements

- [ ] Add ring count (stop ringing after 3-5 rings, return to idle)
- [ ] Volume fade in for ring
- [ ] Custom ring patterns per installation
- [ ] Visual ring indicator (animated icon)
- [ ] Skip ring if outro upload failed (go straight to error)
- [ ] Ring timeout: auto-play outro after 30s if not picked up

---

## Summary

The phone now creates a **callback-style interaction**:

1. User tells story
2. User hangs up (story saved)
3. **Phone calls them back** 📞
4. User answers to hear thank you message
5. Complete!

This is more intuitive, theatrical, and gives the system time to save properly.

**Next step:** Upload `phone-ring.mp3` to complete the experience! 🎵
