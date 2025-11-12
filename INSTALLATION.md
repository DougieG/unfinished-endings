# Unfinished Endings - Physical Installation Guide

## Overview

The complete installation consists of:
1. **Interior Phone Station** - Recording booth where people share stories
2. **Exterior Phone Station(s)** - Witness wall where people listen to random stories
3. **Shadow Puppet Display** - Projection or screen showing animated visuals
4. **Archive Card Printer** - Physical claim tickets
5. **Operator Dashboard** - Hidden admin station

---

## 1. Interior Phone Station (Recording)

### Hardware Components

**Phone:**
- **Option A**: Vintage rotary phone (converted to VoIP)
  - More atmospheric, requires Twilio adapter
  - Companies: Obihai, Grandstream HT801
  
- **Option B**: Standard VoIP desk phone
  - Easier setup, less romantic
  - Yealink T46S or similar

- **Option C**: Push-button vintage phone (1970s-80s style)
  - Best of both worlds
  - Western Electric 2500 series + VoIP adapter

**Signage:**
- Brass plaque or wooden sign: "Pick up to share an unfinished tale"
- Instructions: "Press 1 to begin. Speak for up to 2 minutes 45 seconds."
- LED indicator when recording (optional)

**Booth/Enclosure:**
- Semi-private recording space
- Sound dampening panels
- Warm lighting (amber/candlelight tone)
- Optional: Confessional-style lattice or curtain

### Twilio VoIP Setup

```bash
# Hardware needed:
# 1. Analog phone
# 2. ATA (Analog Telephone Adapter) - e.g., Grandstream HT801
# 3. Ethernet connection
# 4. Twilio phone number

# Configuration:
1. Register ATA with Twilio SIP credentials
2. Configure phone number to hit /api/twilio/voice/inbound
3. Set recording callback to /api/twilio/recording/complete
4. Enable caller ID, call waiting OFF
```

**Web-Only Alternative (No Phone):**
- iPad/tablet mounted in kiosk mode
- Shows ArchiveCore interface
- Headphones with mic
- More reliable, less atmospheric

---

## 2. Exterior Phone Station (Playback)

### Hardware Components

**Phone(s):**
- 1-4 vintage phones mounted on wall
- Each phone loops random stories
- No dialing needed - just pick up

**Options:**

**A. Twilio VoIP (Cloud-based)**
```
Phones → ATA → Internet → Twilio → Web App API
- Auto-answers on pickup
- Plays random story via /api/stories/random
- Hangs up after story ends
```

**B. Raspberry Pi Local (Offline capable)**
```
Phones → USB audio → Raspberry Pi → Local audio files
- More reliable
- No internet dependency during playback
- Syncs stories periodically
```

**C. Web Browser (Simplest)**
- Tablet/touchscreen per "phone"
- Shows WitnessWall interface
- Touch to activate (instead of picking up)

### Display Integration

**Shadow Puppet Projection:**
- Small projector behind translucent screen
- Raspberry Pi running Chromium in kiosk mode
- Points to `/story/[id]` with visual playing
- Muslin or rice paper screen for shadow effect

**Hardware:**
- Mini projector (Anker Nebula, AAXA)
- Raspberry Pi 4 (2GB+)
- HDMI cable
- Frame with translucent material

**Alternative: LCD Screen**
- Vertical monitor mounted behind semi-opaque acrylic
- Backlit for shadow puppet effect
- More reliable than projection

---

## 3. Shadow Puppet Display System

### Display Options

**Option A: Rear Projection**
```
[Projector] → [Translucent Screen] → [Viewer]
- Most "shadow puppet" authentic
- Requires depth (2-3 feet behind screen)
- Materials: muslin, tracing paper, thin fabric
```

**Option B: Front-Lit Screen**
```
[LCD Display] → [Frosted Acrylic/Film] → [Viewer]
- Thinner installation
- Easier to maintain
- Use monitor privacy film or frosted acrylic overlay
```

**Option C: E-Ink (Low Power)**
```
[E-Ink Display] → [Viewer]
- Slow refresh (not great for animation)
- Ultra low power
- Unique aesthetic
```

### Animation Enhancement Ideas

Current `ShadowPuppet.tsx` does basic SVG animation. You could:

**1. Add Particle Systems**
- Floating dust motes
- Candle flicker particles
- Memory fragments

**2. Depth/Parallax**
- Multiple shadow layers
- Foreground/midground/background
- Subtle drift on scroll or time

**3. Physical Shadow Objects**
- Actual shadow puppets on sticks
- Controlled by servos
- Driven by keyword motifs
- Hybrid digital/physical

**4. Projection Mapping**
- Project onto 3D objects (books, fabric, hands)
- More immersive than flat screen

---

## 4. Archive Card Printer Station

### Hardware

**Printer Options:**

**A. Thermal Receipt Printer** (Atmospheric)
- Epson TM-T88VI or similar
- USB or network connection
- Prints on roll paper
- Vintage ticket aesthetic
- QR code + claim number

**B. Label Printer**
- Brother QL-820NWB
- Adhesive labels
- Can stick to objects
- More compact

**C. Polaroid/Instant Camera** (Experimental)
- Fujifilm Instax printer
- Print screenshot of archive card
- Most tangible artifact
- Higher cost per print

### Print Flow

```
User records story
  ↓
Web app generates archive card (ArchiveCard.tsx)
  ↓
html2canvas captures card as image
  ↓
Send to printer via:
  - Browser Print API (simplest)
  - Node print server (more control)
  - Raspberry Pi print daemon
  ↓
Physical card prints
  ↓
User takes card with QR → /story/[id]
```

### QR Code Enhancement

Make QR codes more beautiful:
- Add frame/border
- Embed small icon in center
- Use error correction level H
- Print on textured paper (cardstock, parchment)

---

## 5. Network Architecture

```
┌─────────────────────────────────────────────┐
│  INTERNET CLOUD                             │
│  ┌─────────────┐      ┌──────────────┐     │
│  │  Supabase   │      │   Twilio     │     │
│  │  Database   │◄────►│   Voice      │     │
│  └─────────────┘      └──────────────┘     │
│         ▲                     ▲             │
└─────────┼─────────────────────┼─────────────┘
          │                     │
          │                     │
┌─────────┼─────────────────────┼─────────────┐
│  LOCAL  │                     │             │
│  ┌──────▼──────┐      ┌───────▼────────┐   │
│  │  Web App    │      │  VoIP Gateway  │   │
│  │  (Vercel or │      │  (ATAs)        │   │
│  │   Local Pi) │      └────────┬───────┘   │
│  └──────┬──────┘               │           │
│         │                      │           │
│    ┌────▼────┐          ┌──────▼─────┐    │
│    │Displays │          │   Phones   │    │
│    │(Shadow) │          │ (Interior/ │    │
│    │         │          │  Exterior) │    │
│    └─────────┘          └────────────┘    │
│                                            │
│    ┌────────────┐                          │
│    │  Printer   │                          │
│    │ (Tickets)  │                          │
│    └────────────┘                          │
└─────────────────────────────────────────────┘
```

---

## 6. Raspberry Pi Setup (Recommended Local Controller)

### Why Raspberry Pi?

- Runs displays in kiosk mode
- Controls printers locally
- Can handle audio playback without Twilio
- Offline fallback
- Cheap ($35-75)

### Pi Setup Script

```bash
# Install on Raspberry Pi OS

# 1. Install Chromium for kiosk mode
sudo apt update
sudo apt install chromium-browser unclutter

# 2. Auto-start browser on boot
cat > ~/.config/autostart/kiosk.desktop << EOF
[Desktop Entry]
Type=Application
Exec=chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:3000
EOF

# 3. Optional: Run local Next.js app
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
# Clone repo, npm install, npm run build, npm start

# 4. Printer setup (if USB thermal printer)
sudo apt install cups
sudo usermod -a -G lp pi
# Configure printer via CUPS web interface
```

---

## 7. Bill of Materials (BOM)

### Minimal Setup (~$500)

| Item | Qty | Cost | Notes |
|------|-----|------|-------|
| Raspberry Pi 4 (4GB) | 2 | $110 | Display + phone controller |
| 7" touchscreen | 1 | $80 | Recording interface |
| USB speakerphone | 1 | $50 | Recording mic/speaker |
| Mini projector | 1 | $100 | Shadow display |
| Translucent fabric | 1yd | $20 | Projection screen |
| Thermal printer | 1 | $100 | Archive cards |
| Misc (cables, frame) | - | $40 | - |

### Full Installation (~$2000)

| Item | Qty | Cost | Notes |
|------|-----|------|-------|
| Vintage phones | 4 | $200 | 1 interior, 3 exterior |
| VoIP ATAs | 4 | $400 | Grandstream HT801 |
| Raspberry Pi 4 (4GB) | 3 | $165 | Controllers |
| 27" monitor | 1 | $200 | Shadow display |
| Frosted acrylic sheet | 1 | $80 | Screen overlay |
| Thermal printer | 1 | $150 | Epson TM-T88 |
| Network switch | 1 | $50 | PoE if needed |
| Sound dampening | - | $150 | Recording booth |
| Lighting (warm LED) | - | $100 | Ambiance |
| Frame/carpentry | - | $300 | Custom build |
| Misc installation | - | $205 | Cables, mounts, etc |

---

## 8. Installation Layouts

### Compact (Gallery/Museum)

```
┌─────────────────────────────────┐
│                                 │
│   ┌─────────┐    ┌──────────┐  │
│   │ Shadow  │    │ Interior │  │
│   │ Display │    │  Phone   │  │
│   │ (Rear   │    │ (Record) │  │
│   │  Proj)  │    │          │  │
│   └─────────┘    └──────────┘  │
│                                 │
│   ┌──────────────────────────┐ │
│   │ Exterior Phones (3x)     │ │
│   │ (Listen)                 │ │
│   └──────────────────────────┘ │
│                                 │
│   [Printer Station]             │
│                                 │
└─────────────────────────────────┘
    10ft x 12ft footprint
```

### Immersive (Dedicated Room)

```
        ┌──────────────────────┐
        │   Shadow Projection  │
        │   (Large Screen)     │
        └──────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │                             │
┌───▼───┐                     ┌───▼───┐
│Ext    │                     │Ext    │
│Phone 1│                     │Phone 2│
└───────┘                     └───────┘
    
    
            ┌─────────────┐
            │  Interior   │
            │  Recording  │
            │   Booth     │
            │  (Private)  │
            └─────────────┘
            
            
    [Archive Card Station]
    [Operator Console (hidden)]
    
    20ft x 20ft room
```

---

## 9. Next Physical Tasks

### What You Can Build Now (No credentials needed):

1. **Design the booth/enclosure**
   - Sketch layout
   - Choose materials (wood, fabric, metal)
   - Plan sound dampening

2. **Source hardware**
   - Order Raspberry Pis
   - Find vintage phones (eBay, estate sales)
   - Choose display (projector vs monitor)
   - Get thermal printer

3. **Build projection screen**
   - Frame construction
   - Test translucent materials
   - Test projector placement

4. **Create signage**
   - Design instructions
   - Choose typography (matches web serif font)
   - Print or engrave

5. **Test shadow animations**
   - Edit `ShadowPuppet.tsx`
   - Add more motifs
   - Test different projection materials

6. **Build physical mockup**
   - Cardboard prototype
   - Test ergonomics (phone height, screen placement)
   - Visitor flow

---

## 10. Code Tasks (Can Do Now)

I can help you enhance these components while you wait:

### Animation Improvements
- Add more shadow motifs
- Particle effects
- Smooth transitions between keywords

### UI Polish
- Refine colors/typography
- Add loading states
- Improve mobile responsive

### Admin Features
- Bulk story management
- Analytics dashboard
- Export to CSV

### Testing
- Add more unit tests
- E2E tests with Playwright
- Load testing

What would you like to focus on? Physical design, animation enhancement, or more code features?
