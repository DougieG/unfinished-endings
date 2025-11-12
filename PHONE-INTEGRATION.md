# Physical Phone Integration Guide

## Overview

This guide explains how to connect two traditional push button phones to the **Unfinished Endings** installation for:
- **Phone 1 (Interior/Recording)**: Pick up to record your loss story
- **Phone 2 (Exterior/Playback)**: Pick up to hear a random story from the archive

---

## Hardware Options

### Option A: USB Phone Adapters (Recommended)

**Equipment:**
- 2× **Grandstream HT801** ATA adapters ($50 each)
- OR 2× **Sangoma U100** USB phone adapters ($80 each)
- 2× RJ11 cables
- Mac/PC running the Next.js app

**Setup:**
1. Connect each phone to an ATA via RJ11
2. Connect ATAs to computer via USB or Ethernet
3. Configure each ATA to register to your app (see SIP configuration below)

**Pros:**
- Clean, professional setup
- Reliable hook switch detection
- Proper impedance matching
- No soldering required

---

### Option B: Audio Interface + DIY

**Equipment:**
- Audio interface with 2+ inputs (e.g., Focusrite Scarlett 2i2)
- 2× RJ11 breakout cables or jacks
- Raspberry Pi (for hook switch detection)
- 2× 600Ω audio transformers (optional, for impedance matching)
- Jumper wires, breadboard

**Phone Wiring (Standard RJ11):**
```
Pin 1 (Yellow) - Not used
Pin 2 (Black)  - Tip (-) → Audio signal
Pin 3 (Red)    - Ring (+) → Audio signal
Pin 4 (Green)  - Hook switch → GPIO detection
```

**Audio Path:**
```
Phone Handset Mic → Tip/Ring → Transformer → Audio Interface Input
Audio Interface Output → Transformer → Tip/Ring → Phone Handset Speaker
```

**Hook Switch Detection:**
- Connect Pin 4 (green) to Raspberry Pi GPIO
- When phone is on-hook: circuit is OPEN
- When phone is off-hook: circuit is CLOSED (grounded)

**Pros:**
- More control over audio processing
- Lower cost if you already have equipment
- Educational/DIY satisfaction

**Cons:**
- Requires soldering and basic electronics
- More troubleshooting potential

---

## Software Architecture

### System Flow

```
┌─────────────────────────────────────────────────────┐
│                   Mac/PC Computer                    │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │           Next.js App (localhost:3000)        │  │
│  │                                                │  │
│  │  ┌────────────────┐    ┌─────────────────┐  │  │
│  │  │ Phone Manager  │◄──►│  Hook Detector  │  │  │
│  │  └────────┬───────┘    └─────────────────┘  │  │
│  │           │                                   │  │
│  │           ├──► Recording API                  │  │
│  │           ├──► Playback API                   │  │
│  │           └──► Audio Stream Router            │  │
│  │                                                │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
└─────────────────┬────────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
   ┌────▼────┐         ┌─────▼────┐
   │ Phone 1 │         │ Phone 2  │
   │(Record) │         │(Playback)│
   └─────────┘         └──────────┘
```

### Components

1. **Phone Audio Manager** (`lib/phone-audio.ts`)
   - Manages audio streams from/to phone devices
   - Handles audio device selection
   - Routes audio to recording or playback systems

2. **Hook Switch Monitor** (Raspberry Pi or USB adapter)
   - Detects phone off-hook/on-hook events
   - Sends HTTP requests to Next.js API
   - Triggers recording start/stop or playback

3. **API Routes:**
   - `POST /api/phone/hook` - Hook state changes
   - `POST /api/phone/record/start` - Start phone recording
   - `POST /api/phone/record/stop` - Stop and save recording
   - `POST /api/phone/playback/start` - Start playing random story
   - `POST /api/phone/playback/stop` - Stop playback

---

## Setup Instructions

### Step 1: Install Additional Dependencies

```bash
cd /Users/douglasgoldstein/Documents/unfinished-endings
npm install node-audioworklet ws @types/ws
```

### Step 2: Configure Audio Devices

#### For USB Phone Adapters:
1. Connect both phones via USB/Ethernet
2. Open **Audio MIDI Setup** (macOS) or **Sound Settings** (Windows)
3. Identify the two phone devices (e.g., "USB Phone 1", "USB Phone 2")
4. Set default input/output or note device names for code

#### For Audio Interface:
1. Connect phones to Line In 1 and Line In 2
2. Set Audio Interface as default input device
3. Install hook switch monitoring script on Raspberry Pi (see below)

### Step 3: Environment Variables

Add to `.env.local`:

```env
# Phone Configuration
PHONE_1_DEVICE_NAME="USB Phone 1"  # Recording phone
PHONE_2_DEVICE_NAME="USB Phone 2"  # Playback phone

# Optional: Raspberry Pi Hook Monitor
PHONE_HOOK_MONITOR_URL=http://192.168.1.100:3001
```

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Test Phones

1. **Test Recording Phone:**
   - Pick up Phone 1
   - Should auto-start recording
   - Speak for up to 2:45
   - Hang up → auto-saves to database

2. **Test Playback Phone:**
   - Pick up Phone 2
   - Should start playing random story
   - Hang up → stops playback

---

## Hook Switch Detection

### Option A: USB Phone Adapter (Built-in)

Most USB phone adapters handle hook detection automatically and present it as an audio device state.

### Option B: Raspberry Pi + GPIO

**Hardware Setup:**
```
Phone Pin 4 (Green) → RPi GPIO 17
Phone Ground → RPi Ground
```

**Install on Raspberry Pi:**

```bash
# Install Node.js on Pi
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create hook monitor script
mkdir ~/phone-hook-monitor
cd ~/phone-hook-monitor
npm init -y
npm install rpio axios
```

**Create monitoring script** (`~/phone-hook-monitor/index.js`):

```javascript
const rpio = require('rpio');
const axios = require('axios');

const PHONE_1_PIN = 17; // BCM GPIO 17
const PHONE_2_PIN = 27; // BCM GPIO 27
const API_URL = 'http://YOUR_COMPUTER_IP:3000/api/phone/hook';

rpio.open(PHONE_1_PIN, rpio.INPUT, rpio.PULL_UP);
rpio.open(PHONE_2_PIN, rpio.INPUT, rpio.PULL_UP);

let phone1State = 'on-hook';
let phone2State = 'on-hook';

function checkPhones() {
  // LOW = off-hook (circuit closed), HIGH = on-hook (circuit open)
  const phone1Current = rpio.read(PHONE_1_PIN) === rpio.LOW ? 'off-hook' : 'on-hook';
  const phone2Current = rpio.read(PHONE_2_PIN) === rpio.LOW ? 'off-hook' : 'on-hook';

  if (phone1Current !== phone1State) {
    phone1State = phone1Current;
    axios.post(API_URL, { phone: 1, state: phone1State })
      .then(() => console.log(`Phone 1: ${phone1State}`))
      .catch(err => console.error('Error:', err.message));
  }

  if (phone2Current !== phone2State) {
    phone2State = phone2Current;
    axios.post(API_URL, { phone: 2, state: phone2State })
      .then(() => console.log(`Phone 2: ${phone2State}`))
      .catch(err => console.error('Error:', err.message));
  }
}

// Check every 100ms
setInterval(checkPhones, 100);
console.log('Phone hook monitor started');
```

**Run on startup:**

```bash
# Create systemd service
sudo nano /etc/systemd/system/phone-monitor.service
```

Add:
```ini
[Unit]
Description=Phone Hook Monitor
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/phone-hook-monitor
ExecStart=/usr/bin/node index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable phone-monitor
sudo systemctl start phone-monitor
```

---

## Audio Routing Configuration

### macOS Audio MIDI Setup

1. Open **Audio MIDI Setup** (`/Applications/Utilities/`)
2. Create **Aggregate Device**:
   - Click `+` → Create Aggregate Device
   - Name it "Phone Recording System"
   - Check both phone input devices
   - Set Clock Source to one of the phones
3. Create **Multi-Output Device**:
   - Click `+` → Create Multi-Output Device
   - Name it "Phone Playback System"
   - Check both phone output devices

### Use in Code

Your app will now select these aggregate/multi-output devices by name.

---

## Testing & Troubleshooting

### Test Audio Input
```bash
# Record from Phone 1 for 5 seconds
ffmpeg -f avfoundation -i "USB Phone 1" -t 5 test_phone1.wav

# Play it back
afplay test_phone1.wav
```

### Test Hook Detection

**Check GPIO on Pi:**
```bash
# Install gpio utility
sudo apt-get install -y wiringpi

# Watch GPIO 17
watch -n 0.1 gpio read 17
# Should toggle between 0 (off-hook) and 1 (on-hook)
```

### Debug Checklist

- [ ] Phone wiring is correct (tip/ring/ground)
- [ ] Audio devices appear in system preferences
- [ ] Hook switch changes GPIO state
- [ ] API receives hook events (check server logs)
- [ ] Audio levels are appropriate (not too quiet/loud)
- [ ] No feedback loop between speaker and mic

---

## Production Considerations

### 1. Audio Quality
- Use **balanced audio** connections if possible
- Add **noise filtering** in software (see `audio-worklet` processing)
- Consider **AGC** (Automatic Gain Control) for consistent levels

### 2. Reliability
- Add **watchdog** to restart services on crash
- Log all hook events for debugging
- Set up **alerts** if phones go offline

### 3. Security
- If exposing to internet, add authentication to hook endpoint
- Rate-limit API calls
- Sanitize all audio uploads

### 4. User Experience
- Add **dial tone** when phone is picked up
- Add **"beep"** to signal recording start
- Add **"thank you"** message when hanging up
- Add **ring tone** before playback starts (optional)

---

## Aesthetic Details

### Audio Prompts (Pre-recorded)

Create these audio files and place in `/public/audio/`:

- `pickup-tone.mp3` - Dial tone when picking up recording phone
- `recording-beep.mp3` - Short beep to signal recording start
- `thank-you.mp3` - "Thank you for sharing your story"
- `ringing.mp3` - Ring sound before playback starts
- `silence-comfort.mp3` - Gentle ambient noise (avoid dead silence)

### Physical Installation

**Phone 1 (Recording):**
- Label: "Share Your Story"
- Signage: "Pick up to record"
- Lighting: Warm amber glow

**Phone 2 (Playback):**
- Label: "Listen to a Voice"
- Signage: "Pick up to witness"
- Lighting: Pale blue glow

---

## Next Steps

1. Review the code files created:
   - `lib/phone-audio.ts`
   - `app/api/phone/hook/route.ts`
   - `app/api/phone/record/start/route.ts`
   - `app/api/phone/playback/start/route.ts`

2. Configure your hardware (USB adapters or audio interface)

3. Test hook detection and audio routing

4. Create pre-recorded audio prompts

5. Deploy and install in exhibition space

---

## Cost Breakdown

### Option A (USB Adapters):
- 2× Grandstream HT801: $100
- 2× RJ11 cables: $10
- **Total: ~$110**

### Option B (Audio Interface):
- Focusrite Scarlett 2i2: $160 (if you don't have)
- Raspberry Pi 4: $35
- 2× Transformers: $20
- Cables/parts: $15
- **Total: ~$230** (or ~$70 if you have interface)

---

## Support

For questions about this integration:
- Check Next.js API route logs
- Test audio devices in Audio MIDI Setup
- Review Raspberry Pi hook monitor logs
- Consult Grandstream/Sangoma documentation for ATA setup

**Ready to connect the physical world to the digital archive.**
