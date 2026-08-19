# vigild
> **The Ultimate Resurrection Formula for an Old Android Phone**

Repurpose old or unused Android devices (such as Samsung Galaxy M34) into a sleek, high-tech desk dashboard, customizable alarm clock, and 128GB local network media storage server.

![vigild HUD](https://img.shields.io/badge/Aesthetic-Cyber%20HUD-red)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20WebSockets-green)
![Storage](https://img.shields.io/badge/Storage-128GB%20SD%20Vault-amber)

---

## Key Features

1. **Expanded Hi-Tech Desk HUD & Clock (Default Display)**
   - Ambient glowing cyber clock with seconds counter, full date display, and customizable theme layers.
   - High-contrast dark void aesthetic using glowing red embers (`#ff2436`), bone text (`#d9d2c4`), and warm amber accents.
   - Fullscreen Desk Dock Mode for mounted phone displays.

2. **Customizable Alarm Hub & Touch QWERTY Keyboard**
   - Configure repeat alarms with custom labels, day schedules, and floating modal creation form.
   - Touch QWERTY on-screen keyboard pane preventing phone OS software keyboard popups.
   - Built-in audio tone file support and Web Audio API synthesizer.
   - Remote Test Ringing: test or trigger alarm tones remotely over Wi-Fi.

3. **Now Playing Media Widget & YouTube Send to Dock**
   - Real-time audio and video player with inline preview and fullscreen video mode.
   - YouTube "Send to Dock" browser extension integration.

4. **128GB Local Storage Node**
   - Up to 128GB SD Card capacity monitor and terminal-style `ls -al` directory listing table.

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
# Clone the repository
git clone https://github.com/zaevotic/dash_mob.git
cd dash_mob

# Install dependencies
npm install

# Start full-stack server (Runs API + WebSockets + Frontend on http://localhost:3000)
npm run dev
```

---

## Planned: Companion Control App

- [ ] Build a separate companion app (Android and/or Linux/Windows) that discovers the vigild dock on the local network via its IP and connects to it
  - Change dashboard views remotely
  - View real-time system stats (CPU, RAM, storage, network IP)
  - Configure alarms and send media remotely

---

For full step-by-step instructions on setting up vigild on your Samsung M34 (or any non-rooted Android device) via Termux, Chrome PWA, SD Card mounting, and desktop remote control, see **[SETUP_GUIDE.md](file:///home/zaevo/repos/dash_mob/SETUP_GUIDE.md)**.
