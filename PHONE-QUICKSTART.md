# Physical Phone Quick Start

Get your two traditional phones connected in 30 minutes.

---

## What You'll Build

- **Phone 1 (Left)**: "Share Your Story" - Pick up to record
- **Phone 2 (Right)**: "Listen to a Voice" - Pick up to hear random story

---

## Shopping List

### Option A: Plug-and-Play (~$110)
- [ ] 2× **Grandstream HT801** ATA adapters ($50 each) [Amazon]
- [ ] 2× RJ11 phone cables ($5 each)
- **Setup time: 20 minutes**

### Option B: DIY (~$70 if you have audio interface)
- [ ] Audio interface (e.g., Focusrite Scarlett 2i2)
- [ ] Raspberry Pi 4 ($35)
- [ ] 2× RJ11 breakout cables ($10)
- [ ] Jumper wires, breadboard ($5)
- **Setup time: 2-3 hours**

---

## Quick Setup (Option A - Recommended)

### 1. Physical Connections (5 min)

```
Phone 1 → RJ11 cable → Grandstream HT801 #1 → USB/Ethernet → Computer
Phone 2 → RJ11 cable → Grandstream HT801 #2 → USB/Ethernet → Computer
```

### 2. Configure Audio Devices (5 min)

**macOS:**
1. Open **System Settings → Sound**
2. You should see "USB Phone 1" and "USB Phone 2" in devices
3. Open **Audio MIDI Setup** (`/Applications/Utilities/`)
4. Create **Aggregate Device**:
   - Click `+` → Create Aggregate Device
   - Check both phone input devices
   - Name it "Phone Recording System"

**Windows:**
1. Open **Settings → System → Sound**
2. Verify both phones appear in device list
3. Set as additional input/output devices

### 3. Configure Environment (2 min)

Add to `.env.local`:

```env
# Phone Device Names (check Audio MIDI Setup for exact names)
PHONE_1_DEVICE_NAME="USB Phone 1"  # Recording phone
PHONE_2_DEVICE_NAME="USB Phone 2"  # Playback phone
```

### 4. Test the System (5 min)

```bash
# Start dev server
npm run dev
```

**Test Recording Phone:**
1. Pick up Phone 1
2. Browser console should show: `[Phone 1] off-hook`
3. Speak for a few seconds
4. Hang up
5. Check database for new story

**Test Playback Phone:**
1. Pick up Phone 2
2. Should hear a random story
3. Hang up to stop

---

## Troubleshooting

### "Phone devices not showing up"

**macOS:**
```bash
# List audio devices
system_profiler SPAudioDataType
```

**Check USB connections:**
- Disconnect and reconnect ATAs
- Try different USB ports
- Restart computer

### "No audio from phone speaker"

1. Check volume levels in Audio MIDI Setup
2. Test with: `afplay /System/Library/Sounds/Ping.aiff`
3. Verify correct output device selected

### "Recording not starting"

1. Check browser console for errors
2. Grant microphone permission when prompted
3. Verify device name matches `.env.local`

### "Hook detection not working"

For USB phone adapters:
- Check ATA web interface (usually `http://192.168.x.x`)
- Verify hook flash settings
- May need firmware update

---

## Installation Aesthetics

### Physical Setup

**Phone 1 - Recording Station**
```
┌─────────────────────────┐
│  [Warm amber LED]       │
│                         │
│  "Share Your Story"     │
│                         │
│  Pick up to record      │
│  your memory of loss    │
│                         │
│      📞 [Phone 1]       │
│                         │
└─────────────────────────┘
```

**Phone 2 - Listening Station**
```
┌─────────────────────────┐
│  [Pale blue LED]        │
│                         │
│  "Listen to a Voice"    │
│                         │
│  Pick up to witness     │
│  a stranger's story     │
│                         │
│      📞 [Phone 2]       │
│                         │
└─────────────────────────┘
```

### Signage Design

**Materials:**
- Cardboard (#E8DCC4)
- Black ink
- Simple sans-serif font
- Gentle lighting from below

**Text:**
- Keep instructions minimal
- Use soft, inviting language
- Avoid technical jargon

---

## Audio Prompts (Optional)

Create comfort audio for better UX:

1. **Dial tone** when picking up recording phone
2. **Beep** to signal recording start
3. **"Thank you"** message when hanging up
4. **Ringing** before playback starts

Place MP3 files in `/public/audio/`:
- `pickup-tone.mp3`
- `recording-beep.mp3`
- `thank-you.mp3`
- `ring.mp3`

---

## Production Checklist

Before exhibition opening:

- [ ] Test both phones 10+ times
- [ ] Verify audio quality (clear, not too quiet/loud)
- [ ] Check database saving correctly
- [ ] Test playback randomization
- [ ] Clean phone handsets
- [ ] Hide all cables neatly
- [ ] Add "Out of Order" sign as backup
- [ ] Have troubleshooting contact info posted
- [ ] Test in actual exhibition space (acoustics)
- [ ] Add ambient sound if space is too silent

---

## Maintenance

**Daily:**
- Test both phones at opening
- Check for stuck recordings
- Verify playback working

**Weekly:**
- Clean handsets with disinfectant wipes
- Check cable connections
- Review any error logs

**Monthly:**
- Backup database
- Clear old recordings (if storage limited)
- Update software if needed

---

## Advanced: Raspberry Pi Hook Monitor (DIY)

If using audio interface instead of USB phone adapters, you'll need external hook detection.

**Quick setup:**

```bash
# On Raspberry Pi
curl -fsSL https://raw.githubusercontent.com/your-repo/phone-hook-monitor/main/install.sh | bash
```

See `PHONE-INTEGRATION.md` for full DIY instructions.

---

## Cost Summary

| Item | Option A | Option B |
|------|----------|----------|
| Phone adapters | $100 | - |
| Audio interface | - | $0-160 |
| Raspberry Pi | - | $35 |
| Cables/parts | $10 | $15 |
| **Total** | **$110** | **$50-210** |

---

## Support

**Common issues:**
- See `PHONE-INTEGRATION.md` for detailed troubleshooting
- Check Next.js API logs: `npm run dev`
- Test audio devices in system preferences
- Verify environment variables in `.env.local`

**Emergency fallback:**
- Unplug phones, revert to web-only recording
- Place "Under Repair" sign
- Use tablet/computer for recording instead

---

**Ready to give voices a physical home. 📞**
