/**
 * Unfinished Endings - Phone Hook Monitor
 * Arduino Nano 33 IoT
 * 
 * Monitors two traditional phones and sends hook events to Next.js server
 * 
 * Wiring:
 *   Phone 1 hook (green wire) → Pin 2
 *   Phone 2 hook (green wire) → Pin 3
 *   Both grounds (yellow wire) → GND
 */

#include <WiFiNINA.h>

// ============ CONFIGURATION - EDIT THESE ============

// WiFi credentials
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Your computer running Next.js dev server
// Find your IP: macOS: `ipconfig getifaddr en0`, Windows: `ipconfig`
const char* SERVER_IP = "192.168.1.100";  // CHANGE THIS!
const int SERVER_PORT = 3000;

// ====================================================

// Pin configuration
const int PHONE_1_PIN = 2;  // Recording phone (Interior)
const int PHONE_2_PIN = 3;  // Playback phone (Exterior)
const int STATUS_LED = 13;  // Built-in LED for WiFi status

// State tracking
int phone1State = HIGH;  // HIGH = on-hook, LOW = off-hook
int phone2State = HIGH;
unsigned long lastDebounce1 = 0;
unsigned long lastDebounce2 = 0;
const unsigned long DEBOUNCE_DELAY = 50;  // 50ms debounce

WiFiClient client;

void setup() {
  // Start serial for debugging
  Serial.begin(9600);
  delay(2000);  // Wait for serial to initialize
  
  Serial.println("\n============================================");
  Serial.println("  Unfinished Endings - Phone Hook Monitor");
  Serial.println("============================================\n");
  
  // Configure pins
  pinMode(PHONE_1_PIN, INPUT_PULLUP);
  pinMode(PHONE_2_PIN, INPUT_PULLUP);
  pinMode(STATUS_LED, OUTPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("\n✓ Monitoring phones...");
  Serial.println("  Phone 1 (Recording): Pin 2");
  Serial.println("  Phone 2 (Playback):  Pin 3\n");
  Serial.println("Pick up a phone to test!\n");
}

void loop() {
  // Blink status LED if WiFi connected
  static unsigned long lastBlink = 0;
  if (millis() - lastBlink > 1000) {
    digitalWrite(STATUS_LED, WiFi.status() == WL_CONNECTED);
    lastBlink = millis();
  }
  
  // Read current pin states
  int current1 = digitalRead(PHONE_1_PIN);
  int current2 = digitalRead(PHONE_2_PIN);
  
  // Check Phone 1 with debouncing
  if (current1 != phone1State) {
    if ((millis() - lastDebounce1) > DEBOUNCE_DELAY) {
      phone1State = current1;
      lastDebounce1 = millis();
      
      if (phone1State == LOW) {
        Serial.println("📞 [PHONE 1] OFF-HOOK (Recording started)");
        sendHookEvent(1, "off-hook");
      } else {
        Serial.println("📵 [PHONE 1] ON-HOOK (Recording stopped)");
        sendHookEvent(1, "on-hook");
      }
    }
  }
  
  // Check Phone 2 with debouncing
  if (current2 != phone2State) {
    if ((millis() - lastDebounce2) > DEBOUNCE_DELAY) {
      phone2State = current2;
      lastDebounce2 = millis();
      
      if (phone2State == LOW) {
        Serial.println("📞 [PHONE 2] OFF-HOOK (Playback started)");
        sendHookEvent(2, "off-hook");
      } else {
        Serial.println("📵 [PHONE 2] ON-HOOK (Playback stopped)");
        sendHookEvent(2, "on-hook");
      }
    }
  }
  
  // Check for serial commands (for testing)
  handleSerialCommands();
  
  delay(10);  // Check every 10ms
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.print(WIFI_SSID);
  Serial.print(" ");
  
  int attempts = 0;
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" ✓");
    Serial.print("✓ WiFi connected! IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("✓ Server: ");
    Serial.print(SERVER_IP);
    Serial.print(":");
    Serial.println(SERVER_PORT);
  } else {
    Serial.println(" ✗");
    Serial.println("✗ WiFi connection FAILED!");
    Serial.println("  Check SSID and password in code.");
    Serial.println("  Make sure WiFi is 2.4GHz (not 5GHz).");
  }
}

void sendHookEvent(int phone, const char* state) {
  // Check WiFi first
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("  ✗ WiFi not connected, reconnecting...");
    connectWiFi();
    return;
  }
  
  Serial.print("  → Sending to server... ");
  
  // Connect to server
  if (!client.connect(SERVER_IP, SERVER_PORT)) {
    Serial.println("✗ Connection failed!");
    Serial.println("    Check:");
    Serial.println("    1. Is Next.js dev server running? (npm run dev)");
    Serial.println("    2. Is SERVER_IP correct in code?");
    Serial.println("    3. Computer and Arduino on same network?");
    return;
  }
  
  // Build JSON payload
  String payload = "{\"phone\":";
  payload += phone;
  payload += ",\"state\":\"";
  payload += state;
  payload += "\"}";
  
  // Send HTTP POST request
  client.println("POST /api/phone/hook HTTP/1.1");
  client.print("Host: ");
  client.println(SERVER_IP);
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.print("Content-Length: ");
  client.println(payload.length());
  client.println();
  client.println(payload);
  
  // Wait for response with timeout
  unsigned long timeout = millis();
  while (client.available() == 0) {
    if (millis() - timeout > 3000) {
      Serial.println("✗ Timeout!");
      client.stop();
      return;
    }
  }
  
  // Read first line of response (HTTP status)
  if (client.available()) {
    String response = client.readStringUntil('\n');
    if (response.indexOf("200") > 0) {
      Serial.println("✓ Success!");
    } else {
      Serial.print("✗ Error: ");
      Serial.println(response);
    }
  }
  
  // Close connection
  client.stop();
}

void handleSerialCommands() {
  if (Serial.available()) {
    char cmd = Serial.read();
    Serial.print("\n[TEST] Command: ");
    Serial.println(cmd);
    
    switch(cmd) {
      case '1':
        Serial.println("Testing Phone 1 OFF-HOOK...");
        sendHookEvent(1, "off-hook");
        break;
      case '2':
        Serial.println("Testing Phone 1 ON-HOOK...");
        sendHookEvent(1, "on-hook");
        break;
      case '3':
        Serial.println("Testing Phone 2 OFF-HOOK...");
        sendHookEvent(2, "off-hook");
        break;
      case '4':
        Serial.println("Testing Phone 2 ON-HOOK...");
        sendHookEvent(2, "on-hook");
        break;
      case 'r':
        Serial.println("Reconnecting WiFi...");
        WiFi.disconnect();
        delay(1000);
        connectWiFi();
        break;
      case 's':
        Serial.println("\n=== STATUS ===");
        Serial.print("WiFi: ");
        Serial.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
        Serial.print("Phone 1: ");
        Serial.println(phone1State == LOW ? "OFF-HOOK" : "ON-HOOK");
        Serial.print("Phone 2: ");
        Serial.println(phone2State == LOW ? "OFF-HOOK" : "ON-HOOK");
        Serial.println("==============\n");
        break;
      case 'h':
        printHelp();
        break;
    }
  }
}

void printHelp() {
  Serial.println("\n=== SERIAL COMMANDS ===");
  Serial.println("1 - Test Phone 1 OFF-HOOK");
  Serial.println("2 - Test Phone 1 ON-HOOK");
  Serial.println("3 - Test Phone 2 OFF-HOOK");
  Serial.println("4 - Test Phone 2 ON-HOOK");
  Serial.println("r - Reconnect WiFi");
  Serial.println("s - Show status");
  Serial.println("h - Show this help");
  Serial.println("======================\n");
}
