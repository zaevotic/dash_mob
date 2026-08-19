# DashMob Setup & Deployment Guide

This guide explains how to set up your old Android phone (e.g. Samsung Galaxy M34) to run DashMob as an autonomous desk dashboard, hi-tech alarm clock, media hub, and local network server.

---

## Method 1: Running Server Directly on Old Android Phone (Standalone via Termux)

This method lets your old phone run the server completely independently, even if your laptop is turned off.

### Step 1: Install Termux on Old Android Phone
1. Download **Termux** from [F-Droid](https://f-droid.org/en/packages/com.termux/) or GitHub (do not use Google Play version as it is outdated).
2. Open Termux on your phone and run updates:
   ```bash
   pkg update && pkg upgrade -y
   ```

### Step 2: Grant SD Card / Local Storage Permissions
1. In Termux, run:
   ```bash
   termux-setup-storage
   ```
2. Accept the Android storage permission prompt. This allows DashMob to store uploaded media (up to 128GB) directly on your MicroSD card (`/sdcard` or storage directory).

### Step 3: Install Node.js & Git
In Termux, run:
```bash
pkg install nodejs-lts git -y
```

### Step 4: Download & Launch DashMob
1. Copy or clone `dash_mob` project folder to Termux:
   ```bash
   cd ~
   git clone https://github.com/zaevotic/dash_mob.git
   cd dash_mob
   ```
2. Install dependencies & build:
   ```bash
   npm install
   npm run build
   ```
3. Start the DashMob Server:
   ```bash
   npm start
   ```
   *The terminal will display your phone's Wi-Fi IP address (e.g., `http://192.168.1.45:3000`).*

### Step 5: Configure Phone Screen for Desk Dock Display
1. Open **Google Chrome** or **Samsung Internet** on your old phone.
2. Navigate to `http://localhost:3000`.
3. Tap the browser menu (⋮) and select **"Add to Home Screen"** or **"Install App"**.
4. Tap the new **DashMob** icon on your home screen to open in fullscreen PWA mode.
5. Tap **"DESK DOCK"** to enter the immersive clock & HUD display mode.
6. Place your phone on a charging stand on your desk.

---

## Method 2: Running Server on Laptop / Desktop (WiFi Remote Display)

If you prefer to host the backend server on your main desktop or home lab server:

1. On your laptop, open terminal in `dash_mob`:
   ```bash
   npm install
   npm run build
   npm start
   ```
2. Check your laptop's local IP address (e.g. `192.168.1.100`).
3. Connect your old phone to the same Wi-Fi network.
4. On the old phone's browser, open `http://192.168.1.100:3000`.
5. Tap **"DESK DOCK"** for full screen dashboard display.

---

## Controlling DashMob from Main Phone or Laptop

Once DashMob is running on your Wi-Fi network:

1. **Open Browser on Laptop or Main Phone**:
   - Navigate to `http://<phone-ip>:3000` (e.g., `http://192.168.1.45:3000`).
2. **Offload Media**:
   - Go to the **MEDIA** tab or **PC REMOTE** tab.
   - Drag & drop video files (MP4, MKV) or audio files (MP3, WAV) to offload them to your old phone's storage.
   - Click **PLAY** to start playing media on your desk phone screen!
3. **Manage Alarms & Habits Remotely**:
   - Create or toggle alarms from your PC desk.
   - Click **TEST RING** to trigger an alarm sound test on your old phone speaker over Wi-Fi.
   - Check off daily habit completions from your main phone or PC.

---

## Android Settings Optimization for Desk Use

- **Keep Screen On While Charging**:
  - Go to `Settings` -> `Developer Options` -> Enable **"Stay Awake"** (screen will never sleep while plugged in).
- **Auto-Start Server on Boot (Optional)**:
  - Install **Termux:Boot** from F-Droid to automatically start the DashMob Node server whenever your old phone reboots!
