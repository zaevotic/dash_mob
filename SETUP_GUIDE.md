# vigild Setup & Deployment Guide

This guide explains how to set up your old Android phone (e.g. Samsung Galaxy M34) to run vigild as an autonomous desk dashboard, hi-tech alarm clock, media hub, and local network server.

---

## Hardware Requirements

- **Old Android Phone**: Samsung Galaxy M34 (or any Android 8.0+ smartphone)
- **Power Supply**: Constant USB-C charging cable / desk dock stand
- **Storage**: Internal memory or MicroSD Card (formatted exFAT/FAT32)
- **Local Network**: Wi-Fi connection shared with your laptop/PC

---

## Part 1: Android & Termux Prerequisites

### Step 1: Install Termux & Termux:API
Install **Termux** from F-Droid (do not install from Google Play Store as Play Store versions are deprecated).

### Step 2: Grant Storage Permissions
Open Termux on your phone and run:
```bash
termux-setup-storage
```
Accept the Android storage permission prompt. This allows vigild to store uploaded media directly on your storage directory.

### Step 3: Install Node.js & Git
In Termux:
```bash
pkg update && pkg upgrade -y
pkg install nodejs-lts git -y
```

### Step 4: Download & Launch vigild
```bash
# Clone repository
git clone https://github.com/zaevotic/vigild.git
cd vigild

# Install dependencies
npm install

# Build frontend production assets
npm run build

# Start the vigild Server:
npm start
```
Terminal output will display:
`vigild Full-Stack Server Running on http://0.0.0.0:3000`

---

## Part 2: High-Tech Kiosk / Fullscreen PWA Setup

To run vigild fullscreen on your phone screen without Chrome address bars:

1. Open Chrome on your phone and go to: `http://localhost:3000`
2. Tap the Chrome menu (3 dots) -> **Add to Home screen** / **Install App**.
3. Tap the new **vigild** icon on your home screen to open in fullscreen PWA mode.
4. Screen Wake Lock is integrated into the app (`AWAKE ⚡`), keeping the screen powered on continuously without dimming.

---

## Controlling vigild from Main Phone or Laptop

Once vigild is running on your Wi-Fi network:
1. Open any browser on your laptop/desktop.
2. Go to `http://<PHONE-LOCAL-IP>:3000` (e.g. `http://192.168.1.15:3000`).
3. You can set alarms, offload files, send YouTube videos, or monitor the dock in real-time over WebSockets!

---

## Optional: Auto-Boot Server on Phone Restart

To automatically start vigild whenever your phone reboots:
1. Install **Termux:Boot** from F-Droid.
2. In Termux:
   ```bash
   mkdir -p ~/.termux/boot
   echo "cd ~/vigild && npm start" > ~/.termux/boot/start-vigild.sh
   chmod +x ~/.termux/boot/start-vigild.sh
   ```
