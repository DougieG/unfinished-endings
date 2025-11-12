# Phone Installation - Final Checklist

Track progress from ordering to opening night.

---

## Week 1: Order & Receive

- [ ] Order Arduino Nano 33 IoT ($25)
- [ ] Order 2× RJ11 cables ($10)
- [ ] Order breadboard kit ($10)
- [ ] Parts arrive (2-5 days)

---

## Week 1: Setup (30 min)

- [ ] Install Arduino IDE
- [ ] Install board support (SAMD + WiFiNINA)
- [ ] Get computer IP address: `ipconfig getifaddr en0`
- [ ] Edit Arduino code with WiFi credentials
- [ ] Upload code to Arduino
- [ ] See "WiFi connected" in Serial Monitor

---

## Week 1: Wiring (15 min)

- [ ] Strip/identify RJ11 wires (green=hook, yellow=ground)
- [ ] Connect Phone 1 green → Pin 2, yellow → GND
- [ ] Connect Phone 2 green → Pin 3, yellow → GND
- [ ] Verify connections with multimeter (optional)

---

## Week 1: Testing (15 min)

- [ ] Start Next.js: `npm run dev`
- [ ] Open Serial Monitor (9600 baud)
- [ ] Pick up Phone 1 → See OFF-HOOK message
- [ ] Hang up Phone 1 → See ON-HOOK message
- [ ] Pick up Phone 2 → See OFF-HOOK message
- [ ] Hang up Phone 2 → See ON-HOOK message
- [ ] Check Next.js logs show hook events

---

## Week 2: Audio Setup

- [ ] Configure audio devices in system preferences
- [ ] Test recording from Phone 1 microphone
- [ ] Test playback through Phone 2 speaker
- [ ] Adjust audio levels (not too quiet/loud)
- [ ] Record test story and verify it saves

---

## Week 2: Physical Installation

- [ ] Mount Arduino in enclosure
- [ ] Hide/secure all cables
- [ ] Position Phone 1 (Recording station)
- [ ] Position Phone 2 (Playback station)
- [ ] Add signage: "Share Your Story" / "Listen to a Voice"
- [ ] Add lighting (warm amber for Phone 1, pale blue for Phone 2)

---

## Week 2-3: Final Testing

- [ ] Test recording full 2:45 story
- [ ] Test playback of multiple stories
- [ ] Verify random selection working
- [ ] Test repeatedly (10+ times each phone)
- [ ] Check database entries
- [ ] Test in actual exhibition space
- [ ] Verify acoustics/audio quality

---

## Before Opening

Day before:
- [ ] Test both phones
- [ ] Clean handsets
- [ ] Check cable connections
- [ ] Verify WiFi connection
- [ ] Check Arduino power
- [ ] Review troubleshooting procedures

Opening day:
- [ ] Test both phones at setup
- [ ] Verify Next.js server running
- [ ] Arduino Serial Monitor shows "Monitoring phones"
- [ ] Have backup plan ready (web recording)
- [ ] Post troubleshooting contact info

---

## Daily Maintenance

- [ ] Test phones at exhibition opening
- [ ] Monitor for errors in logs
- [ ] Check database for recordings
- [ ] Clean handsets

---

## Emergency Contacts

- Arduino not responding: Press reset button
- WiFi disconnected: Type 'r' in Serial Monitor
- Next.js crashed: `npm run dev` to restart
- Phones not working: Switch to web recording

---

**Timeline: 2-3 weeks from order to opening**
