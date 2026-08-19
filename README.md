# DashMob
> **The Ultimate Resurrection Formula for an Old Android Phone**

Repurpose old or unused Android devices (such as Samsung Galaxy M34) into a sleek, high-tech desk dashboard, customizable alarm clock, media vault, and 128GB local network media storage server.

![DashMob HUD](https://img.shields.io/badge/Aesthetic-Cyber%20HUD-red)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20WebSockets-green)
![Storage](https://img.shields.io/badge/Storage-128GB%20SD%20Vault-amber)

---

## Key Features

1. **Hi-Tech Desk HUD & Clock (Default Display)**
   - Ambient glowing cyber clock with seconds counter, full date display, and customizable theme layers.
   - High-contrast dark void aesthetic using glowing red embers (`#ff2436`), bone text (`#d9d2c4`), and warm amber accents.
   - Fullscreen Desk Dock Mode for mounted phone displays.

2. **Customizable Alarm Hub & Sound Synthesizer**
   - Configure repeat alarms with custom labels, day schedules, and tone selectors.
   - Built-in Web Audio API sound synthesizer ringing tone.
   - Remote Test Ringing: test or trigger alarm tones remotely from your laptop or main phone.

3. **128GB Local Storage & Media Offloader**
   - Offload movies, TV shows, videos, and music directly from your laptop or main phone to the old phone over Wi-Fi.
   - Up to 128GB SD Card capacity monitor and file manager.
   - Built-in audio/video media player.

4. **Local Network Remote Controller (PC & Phone Management)**
   - Access `http://<phone-ip>:3000` from any browser on your laptop or primary phone.
   - Real-time WebSockets synchronization: changing settings, uploading media, or editing alarms instantly updates the desk phone display.

---

## Theme & Aesthetic Tokens

Built with a custom dark HUD design system:
- **Void Backdrop (`--bg`)**: `#0a0908`
- **Bone Headers (`--text`)**: `#d9d2c4`
- **Red Ember Highlights (`--red-ember`)**: `#ff2436`
- **Warm Amber (`--amber`)**: `#c47c2e`
- **Font Stacks**: `JetBrains Mono`, `Inter`, `Pirata One`, `Orbitron`

---

## Quickstart (Local Development)

```bash
# Install dependencies
npm install

# Build frontend production bundle
npm run build

# Start Node.js server
npm run server
```

Open `http://localhost:3000` (or `http://<your-local-ip>:3000`) in any browser.

---

## Setup Guide

For full step-by-step instructions on setting up DashMob on your Samsung M34 (or any non-rooted Android device) via Termux, Chrome PWA, SD Card mounting, and desktop remote control, see **[SETUP_GUIDE.md](file:///home/zaevo/repos/dash_mob/SETUP_GUIDE.md)**.
