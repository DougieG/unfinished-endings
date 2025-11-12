# Arduino Phone Integration

This directory contains everything needed to connect two traditional push button phones to your Unfinished Endings installation.

---

## 📁 Files

- **`phone_hook_monitor/phone_hook_monitor.ino`** - Arduino code (upload this)
- **`SHOPPING_LIST.md`** - What to buy (~$50)
- **`SETUP_INSTRUCTIONS.md`** - Step-by-step setup (30 min)

---

## 🚀 Quick Start

### 1. Order Hardware (~$50)
See `SHOPPING_LIST.md`

**Minimum:**
- Arduino Nano 33 IoT ($25)
- 2× RJ11 phone cables ($10)
- Breadboard + wires ($10)

### 2. Install & Configure
See `SETUP_INSTRUCTIONS.md`

**Steps:**
1. Install Arduino IDE
2. Edit WiFi credentials in `.ino` file
3. Upload code to Arduino
4. Wire phones to pins 2 & 3
5. Test!

### 3. Detailed Reference
See `/PHONE-ARDUINO-SETUP.md` (in project root)

---

## 🔌 Wiring

```
Phone 1 (Recording)
  Green wire (hook) → Arduino Pin 2
  Yellow wire (gnd) → Arduino GND

Phone 2 (Playback)
  Green wire (hook) → Arduino Pin 3
  Yellow wire (gnd) → Arduino GND
```

---

## 🧪 Testing

**Serial Monitor Commands:**
```
1 - Test Phone 1 OFF-HOOK
2 - Test Phone 1 ON-HOOK
3 - Test Phone 2 OFF-HOOK
4 - Test Phone 2 ON-HOOK
r - Reconnect WiFi
s - Show status
h - Help
```

---

## 📞 How It Works

1. Phone picked up → Arduino detects pin goes LOW
2. Arduino sends HTTP POST to `/api/phone/hook`
3. Next.js triggers recording or playback
4. Phone hung up → Arduino detects pin goes HIGH
5. Arduino sends HTTP POST to stop

---

## 🛠 Troubleshooting

**WiFi won't connect:**
- Check SSID/password (case-sensitive)
- Ensure 2.4GHz WiFi (not 5GHz)
- Move closer to router

**HTTP requests fail:**
- Check `npm run dev` is running
- Verify SERVER_IP in code
- Test: `ping <arduino-ip>`

**Hook not detecting:**
- Check wiring to pins 2/3
- Test continuity with multimeter
- Try different phone

See `SETUP_INSTRUCTIONS.md` for detailed troubleshooting.

---

## ✅ Success Checklist

- [ ] Hardware ordered/arrived
- [ ] Arduino IDE installed
- [ ] Code uploaded successfully
- [ ] WiFi connected (see Serial Monitor)
- [ ] Phones wired correctly
- [ ] Next.js server running
- [ ] Phone 1 pickup triggers message
- [ ] Phone 2 pickup triggers message
- [ ] Both phones hang up correctly

---

## 📚 Documentation

- `SHOPPING_LIST.md` - What to buy
- `SETUP_INSTRUCTIONS.md` - Step by step
- `/PHONE-ARDUINO-SETUP.md` - Complete reference
- `/PHONE-INTEGRATION.md` - System architecture
- `/PHONE-QUICKSTART.md` - Overview

---

**Ready to make phones magical. ✨📞**
