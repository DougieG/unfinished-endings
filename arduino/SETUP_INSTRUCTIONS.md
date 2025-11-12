# Arduino Setup Instructions - Step by Step

Complete setup from unboxing to working phones: **30 minutes**

---

## Part 1: Install Software (10 min)

### 1.1 Install Arduino IDE

**macOS:**
```bash
# Download from Arduino.cc
open https://www.arduino.cc/en/software

# Or install via Homebrew
brew install --cask arduino
```

**Windows:**
- Download installer from https://www.arduino.cc/en/software
- Run installer, accept defaults
- Reboot if prompted

### 1.2 Install Board Support

1. Open Arduino IDE
2. Go to **Tools → Board → Boards Manager**
3. Search: `Arduino SAMD Boards`
4. Click **Install** (wait 2-3 minutes)
5. Search: `WiFiNINA`
6. Click **Install**

### 1.3 Select Board

1. Plug Arduino into computer via USB
2. Go to **Tools → Board → Arduino SAMD Boards**
3. Select: **Arduino Nano 33 IoT**
4. Go to **Tools → Port**
5. Select: `/dev/cu.usbmodem...` (macOS) or `COM3` (Windows)

---

## Part 2: Configure Code (5 min)

### 2.1 Find Your Computer's IP Address

**macOS:**
```bash
ipconfig getifaddr en0
# Example output: 192.168.1.100
```

**Windows:**
```cmd
ipconfig | findstr IPv4
# Example output: IPv4 Address: 192.168.1.100
```

Write it down: `________________`

### 2.2 Edit Arduino Code

1. Open `/arduino/phone_hook_monitor/phone_hook_monitor.ino`
2. Find these lines at the top:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_IP = "192.168.1.100";  // CHANGE THIS!
```

3. Change to your values:
   - `WIFI_SSID` - Your WiFi network name
   - `WIFI_PASSWORD` - Your WiFi password
   - `SERVER_IP` - Your computer's IP from step 2.1

**Example:**
```cpp
const char* WIFI_SSID = "MyHomeWiFi";
const char* WIFI_PASSWORD = "superSecret123";
const char* SERVER_IP = "192.168.1.100";
```

### 2.3 Upload to Arduino

1. Click the **Upload** button (→ arrow icon)
2. Wait for "Done uploading" message (30 seconds)
3. If error, check:
   - Correct board selected?
   - Correct port selected?
   - USB cable connected?

---

## Part 3: Wire the Phones (10 min)

### 3.1 Identify Phone Wires

**RJ11 cable has 6 wires (not all used):**

```
Looking at RJ11 connector (tab down):

Pin 1: Yellow  - Not used
Pin 2: Black   - Tip (audio)
Pin 3: Red     - Ring (audio)
Pin 4: Green   - HOOK SWITCH ← We need this!
Pin 5: Yellow  - GROUND ← We need this!
Pin 6: Blue    - Not used
```

You only need **green** (hook) and **yellow** (ground).

### 3.2 Connect to Arduino

**Option A: Using Breadboard (recommended for testing)**

```
Phone 1:
  Green wire → Breadboard → Arduino Pin 2
  Yellow wire → Breadboard → Arduino GND

Phone 2:
  Green wire → Breadboard → Arduino Pin 3
  Yellow wire → Breadboard → Arduino GND
```

**Visual:**
```
         Arduino Nano 33 IoT
         ┌──────────────┐
Phone 1  │              │
Green ───┤ Pin 2        │
         │              │  Phone 2
         │         Pin 3├─── Green
         │              │
Both     │              │
Yellow ──┤ GND          │
         └──────────────┘
```

**Option B: Direct Connection (if RJ11 breakout jacks)**

1. Plug phone cables into RJ11 jacks
2. Connect jack pins to Arduino:
   - Jack 1 pin 4 → Arduino Pin 2
   - Jack 2 pin 4 → Arduino Pin 3
   - Both pin 5 → Arduino GND

### 3.3 Test Connections

Use multimeter (if you have one):
1. Set to continuity mode
2. Touch probes to phone hook switch
3. **On-hook** (phone down): No beep (open circuit)
4. **Off-hook** (phone up): Beep! (closed circuit)

---

## Part 4: Test Everything (5 min)

### 4.1 Start Next.js Server

```bash
cd /Users/douglasgoldstein/Documents/unfinished-endings
npm run dev
```

Should see:
```
✓ Ready on http://localhost:3000
```

### 4.2 Open Arduino Serial Monitor

1. In Arduino IDE: **Tools → Serial Monitor**
2. Set baud rate to **9600** (bottom right)
3. Should see:

```
============================================
  Unfinished Endings - Phone Hook Monitor
============================================

Connecting to WiFi: MyHomeWiFi ..... ✓
✓ WiFi connected! IP: 192.168.1.105
✓ Server: 192.168.1.100:3000

✓ Monitoring phones...
  Phone 1 (Recording): Pin 2
  Phone 2 (Playback):  Pin 3

Pick up a phone to test!
```

### 4.3 Test Phone 1 (Recording)

1. **Pick up Phone 1**
2. Serial monitor should show:
```
📞 [PHONE 1] OFF-HOOK (Recording started)
  → Sending to server... ✓ Success!
```

3. **Hang up Phone 1**
4. Serial monitor should show:
```
📵 [PHONE 1] ON-HOOK (Recording stopped)
  → Sending to server... ✓ Success!
```

### 4.4 Test Phone 2 (Playback)

Same process - pick up and hang up Phone 2.

### 4.5 Check Next.js Logs

In terminal running `npm run dev`, should see:
```
[Phone 1] off-hook at 2025-11-11T15:30:45.123Z
[Phone 1] Starting recording session: phone1-1699723845123
[Phone 1] on-hook at 2025-11-11T15:30:50.456Z
[Phone 1] Recording session ended: phone1-1699723845123
```

---

## Troubleshooting

### ❌ "WiFi connection FAILED"

**Check:**
- Is WiFi name exactly correct? (case-sensitive)
- Is WiFi password correct?
- Is WiFi 2.4GHz? (Arduino doesn't support 5GHz)
- Try moving Arduino closer to router

**Fix:**
- Type `r` in Serial Monitor to reconnect
- Or press Arduino reset button (white button on board)

### ❌ "Connection failed!" when sending to server

**Check:**
1. Is Next.js running? (`npm run dev`)
2. Is SERVER_IP correct in code?
3. Are computer and Arduino on same WiFi?
4. Try pinging Arduino:
   ```bash
   ping 192.168.1.105  # Use IP from Serial Monitor
   ```

**Fix:**
- Restart Next.js dev server
- Double-check IP address
- Check firewall isn't blocking port 3000

### ❌ Phone state not changing

**Check:**
- Is hook wire connected to correct pin?
- Is ground wire connected?
- Test with multimeter (continuity mode)
- Try swapping phone cables

**Fix:**
- Check wiring matches diagram
- Type `s` in Serial Monitor to see current states
- Try different phone (hook switch might be broken)

### ❌ Upload failed

**Check:**
- Correct board selected? (Nano 33 IoT)
- Correct port selected?
- USB cable plugged in?
- Try different USB port

**Fix:**
- Unplug Arduino, plug back in
- Close and reopen Arduino IDE
- Try pressing reset button twice quickly (bootloader mode)

---

## Serial Monitor Commands

Type these in Serial Monitor for testing:

```
1 - Test Phone 1 OFF-HOOK
2 - Test Phone 1 ON-HOOK
3 - Test Phone 2 OFF-HOOK
4 - Test Phone 2 ON-HOOK
r - Reconnect WiFi
s - Show status
h - Show help
```

---

## Success Checklist

- [ ] Arduino IDE installed
- [ ] Board support installed
- [ ] WiFi credentials in code
- [ ] Server IP in code
- [ ] Code uploaded to Arduino
- [ ] Phones wired to Arduino
- [ ] Serial Monitor showing WiFi connected
- [ ] Next.js server running
- [ ] Pick up Phone 1 → See "OFF-HOOK" message
- [ ] Hang up Phone 1 → See "ON-HOOK" message
- [ ] Same for Phone 2

**All checked? You're done! 🎉**

---

## Next Steps

1. **Mount Arduino in enclosure** (see PHONE-ARDUINO-SETUP.md)
2. **Hide wires** under table/behind exhibit
3. **Test thoroughly** before exhibition opens
4. **Create signage** for phones
5. **Make backup plan** (web recording if Arduino fails)

---

## Need Help?

**Common issues:** See troubleshooting above  
**Arduino errors:** Check Arduino IDE error messages  
**Next.js errors:** Check terminal running `npm run dev`  
**Wiring help:** See wiring diagram in PHONE-ARDUINO-SETUP.md

**Still stuck?** Check Serial Monitor output - it will tell you what's wrong!

---

**Installation complete! Time to connect those voices. 📞✨**
