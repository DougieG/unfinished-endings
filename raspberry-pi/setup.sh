#!/bin/bash
# Raspberry Pi Phone Monitor - Setup Script

echo "================================"
echo "Phone Monitor Setup"
echo "================================"
echo ""

# Update system
echo "→ Updating system..."
sudo apt-get update -qq

# Install Python and pip if needed
echo "→ Installing Python dependencies..."
sudo apt-get install -y python3 python3-pip python3-rpi.gpio

# Install required Python packages
echo "→ Installing Python packages..."
pip3 install requests RPi.GPIO

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit phone_monitor.py and set SERVER_URL to your Mac's IP"
echo "2. Wire phones to GPIO pins:"
echo "   - Phone 1 green → GPIO 17 (Pin 11)"
echo "   - Phone 2 green → GPIO 27 (Pin 13)"
echo "   - Both yellow → GND (Pin 6 or 9)"
echo "3. Run: python3 phone_monitor.py"
echo ""
