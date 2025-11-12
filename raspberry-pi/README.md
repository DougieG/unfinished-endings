# Raspberry Pi Phone Monitor

Simple Python script for monitoring phone hook switches.

---

## Quick Start (5 minutes)

### 1. Copy to Raspberry Pi

```bash
# On your Mac
scp -r raspberry-pi/ pi@raspberrypi.local:~/phone-monitor/

# SSH to Pi
ssh pi@raspberrypi.local
cd ~/phone-monitor
```

### 2. Run Setup

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Configure Server IP

```bash
# Edit phone_monitor.py
nano phone_monitor.py

# Change this line to your Mac's IP:
SERVER_URL = "http://192.168.1.100:3000"  # YOUR IP HERE
```

**Find your Mac's IP:**
```bash
# On Mac
ipconfig getifaddr en0
```

### 4. Wire Phones

```
Phone 1:
  Green wire → GPIO 17 (Physical Pin 11)
  Yellow wire → GND (Physical Pin 6)

Phone 2:
  Green wire → GPIO 27 (Physical Pin 13)
  Yellow wire → GND (Physical Pin 9)
```

**Pi GPIO Layout:**
```
     3.3V  (1) (2)  5V
    GPIO2  (3) (4)  5V
    GPIO3  (5) (6)  GND ← Phone 1 Yellow
    GPIO4  (7) (8)  GPIO14
      GND  (9) (10) GPIO15 ← Phone 2 Yellow
GPIO17 (11) (12) GPIO18 ← Phone 1 Green
  GPIO27 (13) (14) GND ← Phone 2 Green
```

### 5. Run Monitor

```bash
python3 phone_monitor.py
```

You should see:
```
==================================================
  Unfinished Endings - Phone Hook Monitor
  Raspberry Pi Edition
==================================================

Server: http://192.168.1.100:3000
API Endpoint: http://192.168.1.100:3000/api/phone/hook

✓ GPIO pins configured
  Phone 1: GPIO 17
  Phone 2: GPIO 27

✓ Monitoring phones...
  Press Ctrl+C to stop
```

### 6. Test

Pick up Phone 1:
```
[2025-11-11 16:05:23] Phone 1: OFF-HOOK
  ✓ Server acknowledged
```

Hang up Phone 1:
```
[2025-11-11 16:05:45] Phone 1: ON-HOOK
  ✓ Server acknowledged
```

---

## Run on Startup

Make it start automatically when Pi boots:

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
WorkingDirectory=/home/pi/phone-monitor
ExecStart=/usr/bin/python3 /home/pi/phone-monitor/phone_monitor.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable phone-monitor
sudo systemctl start phone-monitor
```

Check status:
```bash
sudo systemctl status phone-monitor
```

View logs:
```bash
sudo journalctl -u phone-monitor -f
```

---

## Troubleshooting

### "Cannot connect to server"
- Check SERVER_URL in phone_monitor.py
- Verify Next.js is running: `npm run dev`
- Test connection: `curl http://YOUR_IP:3000`
- Check firewall isn't blocking port 3000

### "Permission denied" on GPIO
- Run with sudo: `sudo python3 phone_monitor.py`
- Or add user to gpio group: `sudo usermod -a -G gpio pi`

### Hook state not changing
- Check wiring (green to GPIO, yellow to GND)
- Test with multimeter (continuity mode)
- Try different GPIO pins if needed

### Pi not on network
- Check WiFi credentials: `sudo raspi-config`
- Test connection: `ping google.com`
- Check IP: `hostname -I`

---

## Why Raspberry Pi?

vs Arduino Nano:
- ✅ WiFi built-in
- ✅ Easier to program (Python)
- ✅ SSH for debugging
- ✅ Can run 24/7
- ✅ More powerful
- ✅ Logs to file

---

## Cost

- Raspberry Pi Zero W: $15 (if you need to buy)
- You already have one: **$0**
- Wires: $2

**Total: $0-17** (vs $25 for Arduino Nano 33 IoT)

---

**Start monitoring phones in 5 minutes! 🍓📞**
