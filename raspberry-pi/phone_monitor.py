#!/usr/bin/env python3
"""
Unfinished Endings - Phone Hook Monitor
Raspberry Pi GPIO Monitor

Monitors two phone hook switches and sends events to Next.js server

Wiring:
  Phone 1 hook (green) → GPIO 17
  Phone 2 hook (green) → GPIO 27
  Both grounds (yellow) → GND
"""

import RPi.GPIO as GPIO
import requests
import time
import json
from datetime import datetime

# Configuration
SERVER_URL = "http://192.168.1.100:3000"  # CHANGE THIS to your Mac's IP
API_ENDPOINT = f"{SERVER_URL}/api/phone/hook"

# GPIO Pin Configuration
PHONE_1_PIN = 17  # BCM GPIO 17 (Physical pin 11)
PHONE_2_PIN = 27  # BCM GPIO 27 (Physical pin 13)

# Debounce time (seconds)
DEBOUNCE_TIME = 0.05

# State tracking
phone1_state = GPIO.HIGH  # HIGH = on-hook
phone2_state = GPIO.HIGH

def setup_gpio():
    """Initialize GPIO pins"""
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    
    # Set up pins with pull-up resistors
    # When phone is on-hook: pin HIGH (pulled up)
    # When phone is off-hook: pin LOW (grounded through hook switch)
    GPIO.setup(PHONE_1_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(PHONE_2_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    
    print("✓ GPIO pins configured")
    print(f"  Phone 1: GPIO {PHONE_1_PIN}")
    print(f"  Phone 2: GPIO {PHONE_2_PIN}")

def send_hook_event(phone_number, state):
    """Send hook event to Next.js server"""
    state_str = "off-hook" if state == GPIO.LOW else "on-hook"
    
    payload = {
        "phone": phone_number,
        "state": state_str
    }
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] Phone {phone_number}: {state_str.upper()}")
    
    try:
        response = requests.post(
            API_ENDPOINT,
            json=payload,
            timeout=3
        )
        
        if response.status_code == 200:
            print(f"  ✓ Server acknowledged")
        else:
            print(f"  ✗ Server error: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"  ✗ Cannot connect to server at {SERVER_URL}")
        print(f"    Make sure Next.js is running: npm run dev")
    except requests.exceptions.Timeout:
        print(f"  ✗ Request timeout")
    except Exception as e:
        print(f"  ✗ Error: {e}")

def check_phone(pin, phone_number, current_state):
    """Check phone state and send event if changed"""
    new_state = GPIO.input(pin)
    
    if new_state != current_state:
        # Debounce - wait and check again
        time.sleep(DEBOUNCE_TIME)
        confirmed_state = GPIO.input(pin)
        
        if confirmed_state == new_state:
            # State change confirmed
            send_hook_event(phone_number, new_state)
            return new_state
    
    return current_state

def main():
    """Main monitoring loop"""
    global phone1_state, phone2_state
    
    print("\n" + "="*50)
    print("  Unfinished Endings - Phone Hook Monitor")
    print("  Raspberry Pi Edition")
    print("="*50 + "\n")
    
    print(f"Server: {SERVER_URL}")
    print(f"API Endpoint: {API_ENDPOINT}\n")
    
    setup_gpio()
    
    print("\n✓ Monitoring phones...")
    print("  Press Ctrl+C to stop\n")
    
    try:
        while True:
            # Check Phone 1
            phone1_state = check_phone(PHONE_1_PIN, 1, phone1_state)
            
            # Check Phone 2
            phone2_state = check_phone(PHONE_2_PIN, 2, phone2_state)
            
            # Small delay to reduce CPU usage
            time.sleep(0.01)
            
    except KeyboardInterrupt:
        print("\n\nStopping phone monitor...")
    finally:
        GPIO.cleanup()
        print("✓ GPIO cleaned up")
        print("Goodbye!\n")

if __name__ == "__main__":
    main()
