# Phone Web Interface - Quick Start

Simple web buttons to control phones immediately. No Arduino needed.

---

## What's Included

Three new files for instant phone control:

1. **`components/PhoneControls.tsx`** - Phone interface component
2. **`components/PhoneRecorder.tsx`** - Recording + upload logic
3. **`app/phones/page.tsx`** - Standalone phone page

---

## Quick Start

### 1. View the Phone Interface

```bash
npm run dev
```

Open: **http://localhost:3000/phones**

### 2. Use Phone 1 (Recording)

1. Click "📞 Pick Up Phone"
2. Speak your story (max 2:45)
3. Click "📵 Hang Up"
4. Story auto-uploads to database

### 3. Use Phone 2 (Playback)

1. Click "📞 Pick Up Phone"
2. Random story plays
3. Click "📵 Hang Up" to stop

---

## Features

✅ **Phone 1 (Recording)**
- Click to start recording
- Shows live duration timer
- Max 2:45 recording time
- Auto-uploads to Supabase
- Shows success message

✅ **Phone 2 (Playback)**
- Click to play random story
- Uses existing random selection algorithm
- Auto-stops when story ends
- Can hang up early

✅ **Visual Feedback**
- Recording indicator (🔴)
- Duration timer (MM:SS)
- Playback indicator (🔊)
- Upload progress overlay

---

## Integration Options

### Option A: Standalone Page

Visit `/phones` for dedicated phone interface

### Option B: Add to Home Page

```tsx
// app/page.tsx
import { PhoneRecorder } from '@/components/PhoneRecorder';

export default function Home() {
  return (
    <div>
      <PhoneRecorder />
      {/* rest of your home page */}
    </div>
  );
}
```

### Option C: Add to Any Page

```tsx
import { PhoneControls } from '@/components/PhoneControls';

<PhoneControls
  onRecordingComplete={(blob, duration) => {
    console.log('Recording complete:', duration);
    // Handle upload
  }}
  onPlaybackStart={() => {
    console.log('Playback started');
  }}
/>
```

---

## Customization

### Change Colors

Edit `components/PhoneControls.tsx`:

```tsx
// Phone 1 button (currently amber)
className="... bg-amber ..."

// Phone 2 button (currently teal)
className="... bg-teal ..."
```

### Change Max Duration

```tsx
// Currently 165 seconds (2:45)
new AudioRecorder(165)

// Change to 180 seconds (3:00)
new AudioRecorder(180)
```

### Add Sound Effects

```tsx
// Play dial tone when picking up
const dialTone = new Audio('/audio/dial-tone.mp3');
dialTone.play();

// Play beep when starting recording
const beep = new Audio('/audio/beep.mp3');
beep.play();
```

---

## Connecting to Shadow Puppets

The recorded stories automatically integrate with your visual system:

1. Story uploads to database
2. Admin can approve (set `consent = true`)
3. Keywords extract via OpenAI (if configured)
4. Shadow puppet auto-generates on playback
5. Visual appears in `/story/[id]` page

---

## Physical Phone Integration

These buttons can be triggered by physical phones later:

### Option 1: Hide Buttons, Add Physical Touch
- Mount touchscreen behind phone base
- User picks up phone → touches hidden button
- Button triggers same `handlePhone1Pickup()`

### Option 2: USB Foot Pedals
- Add foot pedals under each phone
- Pedal press triggers button click via keyboard event

### Option 3: Arduino (Future)
- Arduino detects hook switch
- Sends HTTP request to trigger button action
- All the API routes are already created

---

## Testing Checklist

- [ ] Visit http://localhost:3000/phones
- [ ] Click Phone 1 "Pick Up" button
- [ ] Grant microphone permission
- [ ] See recording timer counting up
- [ ] Click "Hang Up" after speaking
- [ ] See "Saving your story..." overlay
- [ ] See success message with story ID
- [ ] Click Phone 2 "Pick Up" button
- [ ] Hear random story playing
- [ ] Click "Hang Up" to stop
- [ ] Check database for new story entry

---

## Troubleshooting

**"Could not access microphone"**
- Grant permission in browser
- Check System Settings → Privacy → Microphone
- Try different browser (Chrome/Firefox)

**"No stories available"**
- Need at least one story with `consent = true`
- Run `npm run seed` to add sample stories
- Or record a story and approve in admin

**Recording not saving**
- Check Next.js dev server logs
- Verify Supabase credentials in `.env.local`
- Check storage bucket exists

**Playback not working**
- Check browser console for errors
- Verify audio URLs are accessible
- Check `/api/stories/random` returns data

---

## Next Steps

1. **Test the interface** - Record and play stories
2. **Generate puppet shows** - Stories auto-create visuals
3. **Add Arduino later** - For automatic hook detection
4. **Style to match** - Customize colors and layout

---

**You can start recording and generating puppet shows RIGHT NOW! 🎭**
