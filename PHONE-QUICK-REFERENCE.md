# Phone Integration - Quick Reference Card

Print this and keep near your setup station.

---

## 🔌 Hardware

**Arduino:** Nano 33 IoT  
**Wiring:** Phone 1 green→Pin 2, Phone 2 green→Pin 3, both yellow→GND  
**Power:** USB to computer  
**WiFi:** 2.4GHz only

---

## 💻 Software Commands

**Start server:**
```bash
cd ~/Documents/unfinished-endings
npm run dev
```

**Check Arduino:**
- Arduino IDE → Tools → Serial Monitor
- Set to 9600 baud
- Should see "Monitoring phones..."

**Serial test commands:**
```
1 = Test Phone 1 OFF-HOOK
2 = Test Phone 1 ON-HOOK  
3 = Test Phone 2 OFF-HOOK
4 = Test Phone 2 ON-HOOK
r = Reconnect WiFi
s = Show status
```

---

## 🧪 Testing

1. **WiFi:** Look for "✓ WiFi connected" in Serial Monitor
2. **Phone 1:** Pick up → See "📞 OFF-HOOK"
3. **Phone 2:** Pick up → See "📞 OFF-HOOK"
4. **Next.js:** Check terminal for "[Phone X] off-hook" logs

---

## 🚨 Troubleshooting

| Problem | Fix |
|---------|-----|
| **WiFi not connecting** | Check SSID/password, use 2.4GHz, type `r` |
| **HTTP requests fail** | Verify `npm run dev` running, check SERVER_IP |
| **Hook not detecting** | Check wiring, test with multimeter |
| **Arduino offline** | Press reset button (white), check USB |
| **Phones not working** | Switch to web recording backup |

---

## 📞 What Should Happen

**Phone 1 (Recording):**
1. User picks up → Arduino detects
2. Browser starts recording
3. User speaks (max 2:45)
4. User hangs up → Saves to database

**Phone 2 (Playback):**
1. User picks up → Arduino detects
2. Random story selected
3. Audio plays through phone speaker
4. User hangs up → Playback stops

---

## 🔧 Emergency Procedures

**Arduino frozen:**
- Press reset button on board
- Or unplug/replug USB

**Next.js crashed:**
```bash
# Kill and restart
npm run dev
```

**Complete failure:**
- Unplug phones
- Use web recording interface
- Place "Under Repair" sign

---

## 📋 Daily Checklist

- [ ] Test both phones at opening
- [ ] Check Serial Monitor shows "Monitoring"
- [ ] Verify `npm run dev` running
- [ ] Clean handsets if needed
- [ ] Check for loose cables

---

## 📞 Phone Behavior Reference

```
ON-HOOK = Phone down = Pin HIGH = Idle
OFF-HOOK = Phone up = Pin LOW = Active
```

---

## 🌐 Network Info

**Computer IP:** `ipconfig getifaddr en0`  
**Arduino IP:** See Serial Monitor on boot  
**Server:** http://localhost:3000  
**API endpoint:** POST /api/phone/hook

---

## 📁 File Locations

```
/arduino/phone_hook_monitor/*.ino   ← Arduino code
/arduino/SETUP_INSTRUCTIONS.md      ← Full setup
/PHONE-ARDUINO-SETUP.md             ← Technical docs
/app/api/phone/hook/route.ts        ← API endpoint
```

---

**Keep this card handy during exhibition! 📌**
