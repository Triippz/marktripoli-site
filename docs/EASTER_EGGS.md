# Executive Briefing — Easter Eggs

A few playful, screen‑only effects are hidden in the Executive Briefing page (`/briefing`). They don’t affect printing and don’t require network calls or extra deps.

How to trigger
- Konami Code: Up, Up, Down, Down, Left, Right, Left, Right, B, A
  - Toggles Matrix‑style “digital rain” overlay.
- U — UFO Fleet
  - Spawns 3–5 glowing UFOs that fly across the screen at random heights/speeds.
- D — Paw Print Burst
  - Rains 🐾 paw prints. Because dogs.
- G — Glitch Header
  - Brief cyberpunk glitch effect on your name.
- P — Neon Pulse
  - Subtle neon border pulse on panels.
- H — Hiking Mode
  - Drops mountain icons 🏔️ with gentle parallax.
- V — Video Game Mode
  - Toggles CRT scanlines overlay with a soft flicker.
- B — UFO Beam
  - A hovering saucer appears with a tractor‑beam spotlight over the header.

Implementation notes
- All effects live in `src/pages/ExecutiveBrief.tsx` and `src/styles/tactical-enhancements.css`.
- Effects are gated to screen rendering and avoid pointer events.
- GitHub Side Projects fetch stars/forks (no API key) with a 24h localStorage cache.

Tweak points
- Colors and intensities are centralized in CSS under `tactical-enhancements.css`.
- You can change key bindings in the `keydown` handler inside `ExecutiveBrief.tsx`.

