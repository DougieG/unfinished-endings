# Arduino Phone Hook Detection

Use an Arduino to monitor phone hook switches and trigger recording/playback.

---

## Why Arduino?

**vs Raspberry Pi:**
- ✅ Cheaper ($10-25 vs $35+)
- ✅ Simpler - no OS to manage
- ✅ Lower power consumption
- ✅ Instant boot (no Linux startup)
- ✅ More reliable for simple GPIO tasks
- ❌ Requires WiFi/Ethernet shield for network

**Perfect for this project**: You only need to detect two hook switches and send HTTP requests.

---

## Hardware Shopping List

### Option 1: Arduino with WiFi (~$25)
- [ ] **Arduino Uno WiFi Rev2** ($45) or **Arduino Nano 33 IoT** ($25)
- [ ] 2× RJ11 breakout cables or jacks ($10)
- [ ] Breadboard + jumper wires ($5)
- [ ] USB cable (probably have one)
- **Total: ~$40**

### Option 2: Arduino + WiFi Shield (~$35)
- [ ] **Arduino Uno** ($25)
- [ ] **ESP8266 WiFi Shield** or **Arduino WiFi Shield** ($10-20)
- [ ] 2× RJ11 breakout cables ($10)
- [ ] Breadboard + jumper wires ($5)
- **Total: ~$60**

### Recommended: Arduino Nano 33 IoT
- Built-in WiFi
- Small form factor
- Low cost
- Perfect for this project

---

## Wiring Diagram

```
Phone 1 RJ11 Wiring:
  Pin 1 (Yellow) - Not used
  Pin 2 (Black)  - Tip (audio, not used here)
  Pin 3 (Red)    - Ring (audio, not used here)
  Pin 4 (Green)  - Hook switch → Arduino Pin 2
  Pin 5 (Yellow) - Ground → Arduino GND

Phone 2 RJ11 Wiring:
  Pin 4 (Green)  - Hook switch → Arduino Pin 3
  Pin 5 (Yellow) - Ground → Arduino GND

Arduino Connections:
  Pin 2 ← Phone 1 hook (with 10kΩ pull-up)
  Pin 3 ← Phone 2 hook (with 10kΩ pull-up)
  GND ← Both phone grounds
  USB ← Computer (power + debugging)
```

### Circuit Diagram

```
              Phone 1                Arduino
           ┌──────────┐           ┌──────────┐
Hook (Grn) │          │           │          │
     ──────┤Pin 4     │───────────┤ Pin 2    │
           │          │           │          │
Ground     │          │           │          │
     ──────┤Pin 5     │───────────┤ GND      │
           └──────────┘           │          │
                                  │  +5V     │
              Phone 2             │   │      │
           ┌──────────┐           │   │      │
Hook (Grn) │          │           │  10kΩ    │
     ──────┤Pin 4     │───────────┤ Pin 3    │
           │          │           │          │
Ground     │          │           │          │
     ──────┤Pin 5     │───────────┤ GND      │
           └──────────┘           └──────────┘
```

**Pull-up resistors:** Use internal pull-ups (easier) or external 10kΩ resistors.

---

## Arduino Code

### Setup Arduino IDE

1. Download Arduino IDE: https://www.arduino.cc/en/software
2. Install board support:
   - **Tools → Board → Boards Manager**
   - Search "Nano 33 IoT" or "Uno WiFi"
   - Install

3. Install WiFiNINA library:
   - **Sketch → Include Library → Manage Libraries**
   - Search "WiFiNINA"
   - Install

### Upload This Code

Save as `phone_hook_monitor.ino`:

```cpp
#include <WiFiNINA.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Your computer's IP and port running Next.js
const char* serverIP = "192.168.1.100";  // Change to your computer's IP
const int serverPort = 3000;

// Pin configuration
const int PHONE_1_PIN = 2;  // Recording phone
const int PHONE_2_PIN = 3;  // Playback phone

// State tracking
int phone1State = HIGH;  // HIGH = on-hook, LOW = off-hook
int phone2State = HIGH;
unsigned long lastDebounceTime1 = 0;
unsigned long lastDebounceTime2 = 0;
const unsigned long debounceDelay = 50;  // 50ms debounce

WiFiClient client;

void setup() {
  Serial.begin(9600);
  while (!Serial) delay(10);
  
  Serial.println("Phone Hook Monitor Starting...");
  
  // Configure pins with internal pull-up resistors
  pinMode(PHONE_1_PIN, INPUT_PULLUP);
  pinMode(PHONE_2_PIN, INPUT_PULLUP);
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  int attempts = 0;
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("Arduino IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
  
  Serial.println("Monitoring phones...");
}

void loop() {
  // Read current pin states
  int current1 = digitalRead(PHONE_1_PIN);
  int current2 = digitalRead(PHONE_2_PIN);
  
  // Check Phone 1
  if (current1 != phone1State) {
    if ((millis() - lastDebounceTime1) > debounceDelay) {
      phone1State = current1;
      lastDebounceTime1 = millis();
      
      // Send hook event
      if (phone1State == LOW) {
        Serial.println("[Phone 1] OFF-HOOK (picked up)");
        sendHookEvent(1, "off-hook");
      } else {
        Serial.println("[Phone 1] ON-HOOK (hung up)");
        sendHookEvent(1, "on-hook");
      }
    }
  }
  
  // Check Phone 2
  if (current2 != phone2State) {
    if ((millis() - lastDebounceTime2) > debounceDelay) {
      phone2State = current2;
      lastDebounceTime2 = millis();
      
      // Send hook event
      if (phone2State == LOW) {
        Serial.println("[Phone 2] OFF-HOOK (picked up)");
        sendHookEvent(2, "off-hook");
      } else {
        Serial.println("[Phone 2] ON-HOOK (hung up)");
        sendHookEvent(2, "on-hook");
      }
    }
  }
  
  delay(10);  // Check every 10ms
}

void sendHookEvent(int phone, const char* state) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, skipping...");
    return;
  }
  
  Serial.print("Sending HTTP request to ");
  Serial.print(serverIP);
  Serial.print(":");
  Serial.println(serverPort);
  
  if (client.connect(serverIP, serverPort)) {
    // Build JSON payload
    String payload = "{\"phone\":";
    payload += phone;
    payload += ",\"state\":\"";
    payload += state;
    payload += "\"}";
    
    // Send HTTP POST request
    client.println("POST /api/phone/hook HTTP/1.1");
    client.print("Host: ");
    client.print(serverIP);
    client.print(":");
    client.println(serverPort);
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(payload.length());
    client.println();
    client.println(payload);
    
    Serial.println("Request sent!");
    
    // Wait for response (timeout after 2 seconds)
    unsigned long timeout = millis();
    while (client.available() == 0) {
      if (millis() - timeout > 2000) {
        Serial.println("Request timeout!");
        client.stop();
        return;
      }
    }
    
    // Print response
    while (client.available()) {
      String line = client.readStringUntil('\r');
      Serial.print(line);
    }
    
    client.stop();
    Serial.println("\nRequest complete");
  } else {
    Serial.println("Connection failed!");
  }
}
```

---

## Setup Instructions

### 1. Configure WiFi (2 min)

Edit these lines in the code:

```cpp
const char* ssid = "YOUR_WIFI_SSID";        // Your WiFi network name
const char* password = "YOUR_WIFI_PASSWORD"; // Your WiFi password
const char* serverIP = "192.168.1.100";      // Your computer's IP
```

**Find your computer's IP:**

**macOS:**
```bash
ipconfig getifaddr en0  # WiFi
# or
ifconfig | grep "inet "
```

**Windows:**
```cmd
ipconfig | findstr IPv4
```

### 2. Wire the Phones (10 min)

1. Cut and strip two RJ11 cables (or use breakout jacks)
2. Identify the hook wire (usually green, pin 4)
3. Connect:
   - Phone 1 hook → Arduino Pin 2
   - Phone 2 hook → Arduino Pin 3
   - Both grounds → Arduino GND

### 3. Upload Code (2 min)

1. Connect Arduino to computer via USB
2. Open Arduino IDE
3. Select: **Tools → Board → Arduino Nano 33 IoT**
4. Select: **Tools → Port → /dev/cu.usbmodem...** (your Arduino)
5. Click **Upload** (→)
6. Wait for "Done uploading"

### 4. Test (5 min)

Open **Serial Monitor** (magnifying glass icon):

```
Phone Hook Monitor Starting...
Connecting to WiFi: MyNetwork
.....
WiFi connected!
Arduino IP: 192.168.1.105
Monitoring phones...
```

**Pick up Phone 1:**
```
[Phone 1] OFF-HOOK (picked up)
Sending HTTP request to 192.168.1.100:3000
Request sent!
HTTP/1.1 200 OK
Request complete
```

**Hang up Phone 1:**
```
[Phone 1] ON-HOOK (hung up)
Sending HTTP request to 192.168.1.100:3000
Request sent!
Request complete
```

---

## Troubleshooting

### "WiFi connection failed"
- Check SSID and password (case-sensitive!)
- Make sure Arduino is within WiFi range
- Try restarting Arduino (press reset button)
- Check WiFi is 2.4GHz (not 5GHz - Arduino doesn't support 5GHz)

### "Connection failed" when sending HTTP
- Verify your computer's IP address
- Check your computer and Arduino are on same network
- Make sure Next.js dev server is running (`npm run dev`)
- Try pinging Arduino from computer:
  ```bash
  ping 192.168.1.105  # Use IP shown in Serial Monitor
  ```

### "Hook state not changing"
- Check wiring - correct pins?
- Use multimeter to test hook switch:
  - On-hook: circuit OPEN (no continuity)
  - Off-hook: circuit CLOSED (continuity)
- Try swapping phone cables
- Phone might have broken hook switch

### Arduino keeps resetting
- USB power might be insufficient
- Try external 5V power supply (barrel jack)
- Check for wiring shorts

---

## Production Setup

### Mount Arduino in Enclosure

```
┌─────────────────────────────┐
│  Project Enclosure Box      │
│                             │
│  ┌─────────────┐            │
│  │  Arduino    │            │
│  │  Nano 33    │            │
│  │   IoT       │            │
│  └──┬──────┬───┘            │
│     │      │                │
│  Phone1  Phone2             │
│  (RJ11)  (RJ11)             │
│     │      │                │
└─────┴──────┴────────────────┘
```

### Make It Permanent

1. **Solder connections** (instead of breadboard)
2. **Heat shrink tubing** on exposed wires
3. **Hot glue** to secure RJ11 jacks
4. **Label everything** (Phone 1, Phone 2, Power)
5. **Ventilation holes** in enclosure
6. **Status LED** (optional) - shows WiFi connected

### Power Options

**Option A: USB to computer**
- Simple, no extra hardware
- Arduino draws ~100mA
- Computer must stay on

**Option B: USB wall adapter**
- Arduino runs independently
- Use 5V/1A USB adapter
- More reliable for exhibition

**Option C: Battery pack**
- Portable
- USB battery bank works great
- Recharge daily/weekly

---

## Advanced Features (Optional)

### Add Status LEDs

```cpp
const int WIFI_LED = 13;    // Built-in LED for WiFi status
const int PHONE1_LED = 4;   // External LED for Phone 1 activity
const int PHONE2_LED = 5;   // External LED for Phone 2 activity

void setup() {
  // ... existing setup ...
  pinMode(WIFI_LED, OUTPUT);
  pinMode(PHONE1_LED, OUTPUT);
  pinMode(PHONE2_LED, OUTPUT);
}

void loop() {
  // Flash WiFi LED when connected
  digitalWrite(WIFI_LED, WiFi.status() == WL_CONNECTED);
  
  // Phone LEDs show off-hook state
  digitalWrite(PHONE1_LED, phone1State == LOW);
  digitalWrite(PHONE2_LED, phone2State == LOW);
  
  // ... rest of loop ...
}
```

### Add OLED Display

Show WiFi status and phone states on tiny screen:

```cpp
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 32, &Wire, -1);

void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0,0);
  
  display.print("WiFi: ");
  display.println(WiFi.status() == WL_CONNECTED ? "OK" : "X");
  display.print("P1: ");
  display.println(phone1State == LOW ? "OFF-HOOK" : "ON-HOOK");
  display.print("P2: ");
  display.println(phone2State == LOW ? "OFF-HOOK" : "ON-HOOK");
  
  display.display();
}
```

### Add Watchdog Timer

Auto-restart if Arduino hangs:

```cpp
#include <Adafruit_SleepyDog.h>

void setup() {
  // ... existing setup ...
  Watchdog.enable(8000);  // Reset after 8 seconds of inactivity
}

void loop() {
  Watchdog.reset();  // Reset watchdog timer
  // ... rest of loop ...
}
```

---

## Cost Comparison

| Component | Arduino | Raspberry Pi |
|-----------|---------|--------------|
| Board | $25 | $35 |
| WiFi | Built-in | Built-in |
| Power | 5V USB (have) | 5V USB (have) |
| SD card | Not needed | $10 |
| Case | $5 | $10 |
| Cables/wires | $10 | $10 |
| **Total** | **$40** | **$65** |

**Winner: Arduino** - Cheaper, simpler, more reliable for this task.

---

## Debugging Tips

### Serial Monitor Commands

Add these to help debug:

```cpp
void loop() {
  // ... existing loop ...
  
  // Add serial commands for testing
  if (Serial.available()) {
    char cmd = Serial.read();
    if (cmd == '1') {
      Serial.println("Testing Phone 1 off-hook...");
      sendHookEvent(1, "off-hook");
    } else if (cmd == '2') {
      Serial.println("Testing Phone 1 on-hook...");
      sendHookEvent(1, "on-hook");
    } else if (cmd == '3') {
      Serial.println("Testing Phone 2 off-hook...");
      sendHookEvent(2, "off-hook");
    } else if (cmd == '4') {
      Serial.println("Testing Phone 2 on-hook...");
      sendHookEvent(2, "on-hook");
    } else if (cmd == 'r') {
      Serial.println("Reconnecting WiFi...");
      WiFi.disconnect();
      WiFi.begin(ssid, password);
    }
  }
}
```

Type `1`, `2`, `3`, `4`, or `r` in Serial Monitor to test.

---

## Exhibition Checklist

Before opening:

- [ ] Arduino powered and running
- [ ] WiFi connected (check Serial Monitor)
- [ ] Both phones tested (pick up/hang up)
- [ ] Wires secured and hidden
- [ ] Arduino in protective enclosure
- [ ] Backup plan if Arduino fails (web recording)
- [ ] "Technical Difficulties" sign ready

---

**Arduino is perfect for this. Simple, reliable, cheap. 🎯**
