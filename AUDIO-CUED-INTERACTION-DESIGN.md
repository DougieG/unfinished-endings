# Audio-Cued, Touch-Free Interaction Design

## Philosophy

Create an installation where **physical presence and voice** are the only interfaces. No screens to touch, no buttons to press (except phone dial pads), no digital interfaces to navigate.

---

## Core Interaction Vocabulary

### 1. Proximity Detection
**Sensors detect presence → trigger audio cues**

```
PIR Motion Sensor → Arduino → Web API → Audio playback
```

### 2. Voice Commands
**Simple phrase recognition for navigation**

```
"Yes" / "No" / "Again" / "Next" / [Claim Number]
```

### 3. Physical Gestures
**Traditional phone interactions + simple buttons**

```
- Pick up phone
- Hang up phone
- Press dial pad numbers
- Push large tactile buttons
```

### 4. Audio Feedback
**All system responses are auditory**

```
- Ambient soundscape (constant)
- Voice prompts (clear, calm)
- Confirmation tones (beeps, chimes)
- Story playback (human voice)
```

---

## Installation Flow (Touch-Free)

### Station 1: Arrival / Ambient Zone

**Hardware:**
- Speakers playing ambient soundscape
- Proximity sensors at entrance
- No screens, no signage with instructions

**Experience:**
```
Visitor enters space
  ↓
Proximity sensor detects movement
  ↓
Ambient sound shifts (subtle acknowledgment)
  ↓
After 5 seconds of stillness:
  Voice: "Welcome. This is a place for unfinished stories.
          If you'd like to share yours, approach the phone inside.
          To witness others' stories, pick up any phone on the wall."
  ↓
Visitor explores naturally
```

**No touch required.** Presence alone triggers orientation.

---

### Station 2: Recording Phone (Interior)

**Hardware:**
- Vintage push-button phone
- Arduino hook switch detection
- Dial pad (for number entry)
- Warm overhead lamp (visual cue, no instructions)

**Experience:**
```
Visitor approaches phone area
  ↓
Proximity sensor detects approach (3ft range)
  ↓
Audio (from phone speaker): *soft ringing tone*
  ↓
Visitor picks up phone
  ↓
Arduino detects off-hook → triggers recording flow
  ↓
Voice: "Thank you for approaching. 
        This phone records unfinished stories—
        things left unsaid, rituals interrupted, 
        moments suspended.
        
        You'll have two minutes and forty-five seconds.
        
        Press 1 when you're ready to begin.
        Hang up at any time to exit."
  ↓
Visitor presses 1
  ↓
Voice: "Begin speaking after the tone..."
  *beep*
  ↓
Recording starts (visual: lamp brightness increases)
  ↓
At 2:30, soft chime (15 seconds remaining)
  ↓
At 2:45, recording stops
  ↓
Voice: "Thank you. Your story is being archived.
        Your claim number is [number].
        Please remember it.
        
        If you'd like a printed archive card,
        approach the printer station to your left."
  ↓
Visitor hangs up
  ↓
Lamp dims back to ambient
```

**Touch required:** Picking up phone, pressing 1. **No screen.**

---

### Station 3: Witness Wall (Exterior Phones)

**Hardware:**
- 2-4 vintage phones mounted on wall
- Arduino hook detection per phone
- Individual speakers per phone
- Soft glow lamps above phones

**Experience:**
```
Visitor approaches wall
  ↓
Proximity sensor (optional) causes lamps to glow brighter
  ↓
Visitor picks up any phone
  ↓
Arduino detects off-hook → requests random story from API
  ↓
Story begins playing immediately (no menu, no prompt)
  ↓
Story ends
  ↓
Voice: "Press 1 to hear another story.
        Or simply hang up."
  ↓
Visitor presses 1 OR hangs up
  ↓
If pressed 1: new random story begins
If hung up: lamp dims, system resets
```

**Touch required:** Pick up phone, optional dial pad press. **No screen.**

---

### Station 4: Archive Card Printer

**Option A: Voice-Activated**

**Hardware:**
- Thermal receipt printer
- Microphone + voice recognition (Web Speech API or Whisper)
- Proximity sensor
- Speaker

**Experience:**
```
Visitor approaches printer
  ↓
Proximity sensor detects presence (2ft range)
  ↓
Voice: "Welcome to the archive.
        To print your claim card, speak your claim number
        or press the button and enter it on the dial pad."
  ↓
Visitor speaks: "Seven four three two"
  ↓
Voice recognition → transcribes → validates number
  ↓
Voice: "Printing claim card for story 7432..."
  ↓
Thermal printer outputs card with QR code
  ↓
Voice: "Your card is printing. Thank you for sharing."
```

**Option B: Physical Dial Pad Entry**

**Hardware:**
- Physical 0-9 keypad (large, tactile buttons)
- LED display showing entered numbers
- Big "PRINT" button

**Experience:**
```
Visitor approaches
  ↓
Voice: "Enter your claim number using the keypad,
        then press the green button to print."
  ↓
Visitor types 7-4-3-2 on keypad
  ↓
LED shows: 7432
  ↓
Visitor presses green PRINT button
  ↓
Card prints
  ↓
Voice: "Thank you."
```

**Option C: Fully Automatic**

If you track user sessions:

```
Visitor who just recorded approaches printer
  ↓
System recognizes recent recording (proximity + timing)
  ↓
Voice: "Would you like to print your archive card?"
  ↓
Visitor says "Yes" or presses single YES button
  ↓
Card prints automatically with their claim number
```

**Touch required:** Dial pad OR single button OR voice only.

---

### Station 5: Shadow Puppet Display

**Hardware:**
- Large rear-projection screen or frosted monitor
- Speakers for ambient sound
- No interactive elements

**Experience:**
```
Display cycles through shadow puppet animations
  ↓
Ambient soundscape (no narration, just texture)
  ↓
Animations shift based on currently playing stories
  ↓
Purely observational—no interaction needed
```

**Touch required:** None. **Passive viewing.**

---

## Technical Implementation

### Arduino Expansions

Add to your existing phone hook detection:

```cpp
// PROXIMITY SENSORS
const int ENTRANCE_PIR = 4;
const int PRINTER_ULTRASONIC_TRIG = 5;
const int PRINTER_ULTRASONIC_ECHO = 6;

void setup() {
  pinMode(ENTRANCE_PIR, INPUT);
  pinMode(PRINTER_ULTRASONIC_TRIG, OUTPUT);
  pinMode(PRINTER_ULTRASONIC_ECHO, INPUT);
}

void loop() {
  // Entrance detection
  if (digitalRead(ENTRANCE_PIR) == HIGH) {
    sendEvent("entrance", "visitor_detected");
  }
  
  // Printer proximity (ultrasonic)
  long distance = getDistance();
  if (distance < 60) { // 60cm = ~2 feet
    sendEvent("printer", "approach");
  }
}

long getDistance() {
  digitalWrite(PRINTER_ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PRINTER_ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PRINTER_ULTRASONIC_TRIG, LOW);
  
  long duration = pulseIn(PRINTER_ULTRASONIC_ECHO, HIGH);
  return duration * 0.034 / 2; // Convert to cm
}
```

### Voice Recognition Options

**Option 1: Web Speech API (Browser-based)**

For printer station, run on hidden Raspberry Pi:

```typescript
// printer-voice.ts
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  
  // Parse claim number from speech
  const claimNumber = parseSpokenNumber(transcript);
  
  if (claimNumber) {
    printClaimCard(claimNumber);
  }
};

function parseSpokenNumber(text: string): string | null {
  // "seven four three two" → "7432"
  const digitMap = {
    'zero': '0', 'one': '1', 'two': '2', 
    'three': '3', 'four': '4', 'five': '5',
    'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
  };
  
  const words = text.toLowerCase().split(' ');
  return words.map(w => digitMap[w]).join('');
}
```

**Option 2: OpenAI Whisper (More Robust)**

```python
# printer-whisper.py (on Raspberry Pi)
import whisper
import sounddevice as sd

model = whisper.load_model("base")

def listen_for_number():
    audio = sd.rec(duration=5, samplerate=16000)
    result = model.transcribe(audio)
    
    claim_number = parse_number(result['text'])
    print_card(claim_number)
```

**Option 3: Simple Button Press (Most Reliable)**

Giant buttons work perfectly and are immediate:

```
┌─────────────────────────────┐
│  [   1   ]  [   2   ]       │
│  [   3   ]  [   4   ]       │
│  [   5   ]  [   6   ]       │
│  [   7   ]  [   8   ]       │
│  [   9   ]  [   0   ]       │
│                             │
│      [  PRINT CARD  ]       │
│         (Green LED)         │
└─────────────────────────────┘
```

### Audio Playback System

**For voice prompts, use pre-recorded audio:**

```typescript
// audio-cues.ts
const AUDIO_LIBRARY = {
  welcome: '/audio/prompts/welcome.mp3',
  recording_start: '/audio/prompts/recording-start.mp3',
  recording_end: '/audio/prompts/recording-end.mp3',
  printer_approach: '/audio/prompts/printer-prompt.mp3',
  print_complete: '/audio/prompts/print-complete.mp3',
  ambient_loop: '/audio/ambient/installation-drone.mp3'
};

async function playAudioCue(cue: keyof typeof AUDIO_LIBRARY) {
  const audio = new Audio(AUDIO_LIBRARY[cue]);
  await audio.play();
}

// Or use text-to-speech
async function speak(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.voice = getCalm FemaleVoice();
  
  speechSynthesis.speak(utterance);
}
```

**For installation, pre-record prompts with a voice actor** for higher quality than TTS.

---

## Ambient Soundscape Design

Create a **constant audio environment** that shifts based on activity:

```
Base Layer (always playing):
  - Low drone (50Hz-200Hz)
  - Subtle field recording (wind, distant room tone)
  - Very quiet
  
Recording Activity:
  + Add gentle heartbeat rhythm
  + Slight brightness increase in drone
  
Playback Activity:
  + Layer in soft textural sounds per story theme
    (thread → fabric rustle, window → glass harmonics)
  
Idle State:
  - Return to base layer
  - Very slow evolution (20-minute cycle)
```

**Implementation:**

```typescript
// ambient-controller.ts
import { Howl } from 'howler';

const ambientLayers = {
  base: new Howl({ src: ['/audio/ambient/base-drone.mp3'], loop: true }),
  recording: new Howl({ src: ['/audio/ambient/heartbeat.mp3'], loop: true }),
  playback: new Howl({ src: ['/audio/ambient/texture-layer.mp3'], loop: true })
};

function setAmbientState(state: 'idle' | 'recording' | 'playback') {
  ambientLayers.base.volume(state === 'idle' ? 0.3 : 0.2);
  ambientLayers.recording.volume(state === 'recording' ? 0.4 : 0);
  ambientLayers.playback.volume(state === 'playback' ? 0.3 : 0);
}
```

---

## Complete Hardware BOM (Touch-Free Addition)

| Component | Purpose | Qty | Cost |
|-----------|---------|-----|------|
| PIR motion sensor | Entrance detection | 2 | $10 |
| Ultrasonic sensor (HC-SR04) | Printer proximity | 1 | $5 |
| USB microphone | Voice recognition | 1 | $30 |
| Large arcade buttons | Printer input | 12 | $30 |
| LED display (7-segment) | Number feedback | 1 | $15 |
| Speaker (full-range, 5W) | Audio prompts | 4 | $80 |
| Audio amplifier | Speaker power | 1 | $20 |
| **Total** | | | **$190** |

**Add to your existing Arduino/phone setup (~$50) = ~$240 total for touch-free system.**

---

## Design Benefits

### Why Touch-Free Works Better

1. **Ritual quality** - Physical gestures (picking up phone) feel more ceremonial than tapping a screen
2. **Accessibility** - Voice and physical buttons accommodate more abilities
3. **Focus** - No UI to decode, just simple audio instructions
4. **Intimacy** - Speaking into a phone feels private vs. typing on a public screen
5. **Timelessness** - No dated UI design, just human voice and physical objects

### Considerations

**Voice Recognition Challenges:**
- Accents and speech patterns
- Background noise in installation
- **Fallback:** Always offer button/dial pad alternative

**Audio Prompt Design:**
- Keep instructions under 15 seconds
- Use calm, unhurried pacing
- Repeat key info ("Press 1 to begin")
- Offer "Press 0 for help" on all menus

**Physical Buttons:**
- Large (50mm+ diameter)
- Tactile feedback (satisfying click)
- Clear labeling (engraved, not printed)
- Backlit in low-light installation

---

## Implementation Plan

### Phase 1: Existing Phone System (Done)
✅ Arduino hook detection  
✅ Recording phone API  
✅ Playback phone API  

### Phase 2: Proximity Detection (1 day)
- [ ] Add PIR sensors to Arduino
- [ ] Wire entrance + printer zones
- [ ] Test trigger events
- [ ] Create API endpoints for proximity events

### Phase 3: Audio Cues (2 days)
- [ ] Write all prompt scripts
- [ ] Record with voice actor OR use quality TTS
- [ ] Build audio playback system
- [ ] Test timing and flow

### Phase 4: Printer Station (1 day)
- [ ] Choose input method (voice vs. buttons)
- [ ] Wire hardware (keypad or mic)
- [ ] Build number entry logic
- [ ] Test print workflow

### Phase 5: Ambient Soundscape (1 day)
- [ ] Compose/select ambient audio
- [ ] Build layered playback system
- [ ] Link to installation state
- [ ] Mix and test levels

### Phase 6: Integration Testing (2 days)
- [ ] Full walkthrough of visitor flow
- [ ] Timing adjustments
- [ ] Volume balancing
- [ ] Edge case handling (hung phones, interruptions)

**Total: ~1 week of focused work**

---

## Sample Audio Script

Here's how a complete visitor journey sounds:

```
[Visitor enters]
[5 seconds of silence with ambient drone]

VOICE (speakers): "Welcome. This is a place for unfinished stories.
                   If you'd like to share yours, approach the phone inside.
                   To witness others' stories, pick up any phone on the wall."

[Visitor approaches recording phone]
[Phone begins soft ringing]

[Visitor picks up phone]

VOICE (phone): "Thank you for approaching. 
                This phone records unfinished stories—
                things left unsaid, rituals interrupted, moments suspended.
                
                You'll have two minutes and forty-five seconds.
                Press 1 when you're ready to begin.
                Hang up at any time to exit."

[Visitor presses 1]

VOICE: "Begin speaking after the tone..."
       [BEEP]

[Visitor speaks for 2:45]
[At 2:30, soft chime plays]

[Recording stops at 2:45]

VOICE: "Thank you. Your story is being archived.
        Your claim number is seven-four-three-two.
        Please remember it.
        
        If you'd like a printed archive card,
        approach the printer station to your left."

[Visitor hangs up]
[Lamp dims]

[Visitor walks to printer]
[Proximity sensor detects approach]

VOICE (printer speaker): "Welcome to the archive.
                          Enter your claim number on the keypad,
                          then press the green button."

[Visitor presses 7-4-3-2]
[LED displays: 7432]

[Visitor presses PRINT button]

VOICE: "Printing claim card for story 7432..."
       [Printer sounds]
       "Thank you for sharing."

[Card emerges from printer]
```

**No screen touched. No menu navigated. Just presence, voice, and physical objects.**

---

## Questions to Consider

1. **Do you want voice recognition or prefer physical buttons?**
   - Voice is more "magical" but less reliable
   - Buttons are immediate and accessible

2. **Should ambient sound be constant or triggerable?**
   - Constant creates atmosphere
   - Triggered only when visitors present saves energy

3. **Pre-recorded prompts or live TTS?**
   - Pre-recorded sounds more professional
   - TTS allows dynamic content (e.g., claim numbers)

4. **How much silence vs. guidance?**
   - More silence = meditative, exploratory
   - More prompts = clear, accessible

5. **Entrance audio: welcoming or mysterious?**
   - Welcoming: "Welcome. This is..."
   - Mysterious: Just ambient shifts, no words until approach

---

## Next Steps

Would you like me to:

1. **Build the proximity detection system** - Arduino code for PIR/ultrasonic sensors
2. **Create the audio prompt library** - Scripts and playback logic
3. **Design the button-based printer interface** - Hardware wiring and entry system
4. **Compose the ambient soundscape** - Layered audio system

Which component interests you most?
