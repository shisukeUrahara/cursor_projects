# 3D Flappy Bird

A neon-infused take on the classic Flappy Bird concept rendered in Three.js. Glide through futuristic energy pylons, build combos for higher scores, or chill out in Free Fly mode.

## Features

- ⚡️ Smooth 60fps-friendly rendering with high-quality lighting and skyline parallax.
- 🐦 Responsive bird physics with animated wings and tilt feedback.
- 🚧 Dynamic obstacle spawning with adaptive difficulty in classic mode.
- 🎯 Combo multiplier system that rewards clean passes through pipe centers.
- 🧘 Relaxed Free Fly mode that disables collisions while keeping score tracking.
- 🔊 Sound toggle with persistent preferences and keyboard shortcuts.

## Controls

- **Space / Click / Tap** – Flap
- **P** – Pause / Resume
- **M** – Toggle sound

## Getting started

The project ships as plain HTML/CSS/JS, so you just need a static web server. Pick one of the options below:

### Option A – Quick preview with Node.js

1. Install the lightweight [`serve`](https://www.npmjs.com/package/serve) helper once:
   ```bash
   npm install --global serve
   ```
2. From the repo root, start the server:
   ```bash
   serve 3d-flappy-bird
   ```
3. Visit the printed URL (for example `http://localhost:3000`) in your browser.

### Option B – Use Python's built-in server

1. Ensure Python 3 is installed.
2. In the repo root run:
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000/3d-flappy-bird/` in your browser.

### Option C – Open the file directly (quickest, but may block audio)

You can double-click `3d-flappy-bird/index.html` to open it locally. Some browsers restrict features (like audio autoplay) when running from the `file://` protocol, so prefer a local server for the full experience.
