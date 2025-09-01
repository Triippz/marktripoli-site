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
- ` (backtick) or Ctrl+Alt+T — Secret Terminal
  - Open a hidden terminal overlay. Type 'help' to see commands.
  - 'login' then password 'legion' for admin. 3 wrong attempts => alert mode.
  - 'eggs', 'trigger <name>', 'scan', 'unlock-all' to play with effects.
  - Map Terminal (same hotkeys on map): 'regions', 'goto <key>', 'zoom <n>', 'center <lng> <lat>', 'scan'.
  - Achievements persist (unlockedEasterEggs/localStorage) and show in the 🏆 panel.

Implementation notes
- All effects live in `src/pages/ExecutiveBrief.tsx` and `src/styles/tactical-enhancements.css`.
- Effects are gated to screen rendering and avoid pointer events.
- GitHub Side Projects fetch stars/forks (no API key) with a 24h localStorage cache.

Map Easter Eggs (idle-triggered)
- Randomized while idle on the map (every ~60s; requires 10s idle):
  - Anomaly Ping: pulsing tactical ring near center.
  - UFO Blips: brief glowing points around the view.
  - Satellite Streak: diagonal streak across the viewport.
  - Matrix Pulse: temporary green tint + stronger grid.
  - Aurora Overlay: subtle northern glow.
  - Scanlines Overlay: CRT effect over map.
- Geofenced: Area 51 and Roswell can trigger blips/pings.
- Region‑based: Mt. Rainier and Yosemite trigger a brief Hiking Burst (🏔️).
- More regions:
   - Lancaster, Philadelphia (PA): paw burst, anomaly ping, satellite streak.
   - El Segundo (CA): UFO blips + rocket launch.
   - State College (PA): graduation caps + ping.
   - Bletchley Park (UK): matrix pulse + scanlines + cyan ping.
   - CERN (CH): particle ring + satellite streak.
   - Starbase TX, Vandenberg CA: rocket launches + sand drift/streaks.
  - JPL Pasadena, Mojave: rocket launch + drift/ping.
  - NYC Midtown: neon sweep + scanlines + cyan ping.
  - Seattle: matrix pulse + particle ring.
  - Austin, TX: rocket launch + matrix pulse.
  - Denver: hiking burst + particle ring.
  - LA Downtown: scanlines + neon sweep.
  - San Diego: sand drift + UFO blips.
  - Houston (JSC): rocket launch + particle ring.
  - NORAD Cheyenne Mountain: radar sweep + red ping.
  - Langley AFB: radar sweep + UFO blips.
  - Wright‑Patterson AFB: golden ping + particle ring.
  - Palmdale (Skunk Works): UFO blips + rocket launch.
  - Pine Gap (AU): scanlines + cyan ping.
  - Stonehenge (UK): particle ring + matrix pulse.
  - Mt. Shasta, Sedona: hiking/particle/neon mixes.
  - Nazca Lines (PE): satellite streak + ping.
  - Mauna Kea (HI): star twinkle + particle ring.
  - Reykjavík (IS): aurora + star twinkle.
  - Tokyo Akihabara (JP): neon sweep + scanlines.
- Code: `src/utils/easterEggs/mapEasterEggs.ts` (registered in `MapboxScene.tsx`).

Tweak points
- Colors and intensities are centralized in CSS under `tactical-enhancements.css`.
- You can change key bindings in the `keydown` handler inside `ExecutiveBrief.tsx`.
