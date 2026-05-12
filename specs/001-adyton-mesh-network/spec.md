# Feature Specification: Adyton Job Entry + Atlas Mesh Network Easter Egg

**Feature Branch:** `001-adyton-mesh-network`
**Created:** 2026-05-11
**Status:** Draft
**Input:** Engineer's original description: "Add new Adyton job entry (Staff Software Engineer) covering Atlas decentralized C2 platform and NATS JetStream notification platform. Build an Atlas mesh network Easter egg visualization on the Mapbox map with MIL-STD-2525D-inspired symbology, moving nodes, dynamic peer discovery, satellite backhaul, and a terminal boot sequence."

> **Spec authoring rules** (from the project constitution):
> - Focus on **WHAT** users need and **WHY**. No HOW (no tech stack, APIs, frameworks, code structure) — that lives in plan.md.
> - Every requirement must be testable and unambiguous. Vague adjectives without adjacent quantification fail Article II.
> - User stories are prioritised P1/P2/P3 and each must be independently testable (Article IV).
> - **No silent defaults.** The agent applies project-wide defaults only when they appear in `docs/spec/defaults.md` and cites the catalog ID in `## Defaults Applied`. Anything else the engineer didn't specify becomes `[NEEDS CLARIFICATION]`. There is no per-spec budget on these markers — work them through `/spec clarify` in batches of 5.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Adyton Career Entry on Map (Priority: P1)

A site visitor navigates to the main map page and sees a new career pin at the center of the continental US representing Adyton (remote/distributed). Clicking the pin opens the career detail panel showing "Staff Software Engineer" at Adyton with the codename "OPERATION ATLAS", start date October 2025, no end date (current role), a summary covering both Atlas and the notification platform, and 4 highlight bullets. The previous most-recent entry (Picogrid) now shows an end date of October 2025.

**Why this priority:** The job entry is the core content update — without it, the site misrepresents the engineer's current employment. This is the minimal viable change with immediate user value.

**Independent Test:** Visit the site at `/`, observe the map has a green career pin near coordinates (39.5, -98.35). Click it. The career detail panel opens showing company name "Adyton", position "Staff Software Engineer", codename "OPERATION ATLAS", date range "2025 – PRESENT", and at least 4 highlight bullets mentioning Atlas and NATS JetStream — verifies data loading, coordinate projection, marker rendering, and detail display end-to-end.

**Acceptance Scenarios:**

1. **Given** `public/resume.json` contains the Adyton work entry with `startDate: "2025-10"` and no `endDate`, **When** the map loads and calls `resumeDataService.getCareerMapData()`, **Then** the returned `markers` array includes a `CareerMarker` with `name: "Adyton"`, `position: "Staff Software Engineer"`, `isCurrent: true`, `codename: "OPERATION ATLAS"`, and `location.lat` within 0.5 degrees of 39.5.
2. **Given** the Adyton marker exists on the map, **When** a user clicks it, **Then** the `CareerDetailsDialog` opens showing the summary text containing "decentralized" and "NATS JetStream", and the highlights array has exactly 4 entries.
3. **Given** the Picogrid entry in `resume.json` has `endDate: "2025-10"`, **When** the map loads, **Then** the Picogrid `CareerMarker` has `isCurrent: false`.
4. **Given** the user navigates to `/briefing`, **When** the page renders, **Then** Adyton appears as the first work entry (sorted newest-first by start date).
5. **Given** `public/resume.json` contains a `projects` array, **When** the data is loaded, **Then** it includes entries with names containing "Atlas" and "Notification Platform".
6. **Given** `public/resume.json` contains `basics.summary`, **When** the data is loaded, **Then** the summary text references "Adyton" or "decentralized".

---

### User Story 2 — Atlas Mesh Network Visualization on Map (Priority: P1)

A site visitor on the main map page presses the `M` key. A canvas overlay appears on the Mapbox map showing a ~30-second animated sequence: three regional mesh clusters (US, Europe, Middle East) with ground station, sensor, UAV, aircraft, and satellite nodes rendered with MIL-STD-2525D-inspired symbols. The animation progresses through phases — cluster nodes fade in, intra-cluster connections draw, mobile nodes begin moving along paths, dynamic discovery occurs when mobiles approach new clusters, satellite backhaul arcs connect clusters, signal pulses propagate through the mesh, and finally everything fades out and the canvas self-removes.

**Why this priority:** The mesh Easter egg is the second core deliverable the engineer requested. It independently demonstrates the Atlas decentralized mesh concept visually and is the signature interactive piece representing the engineer's current work.

**Independent Test:** Load the map at `/`, press `M`. Within 2 seconds, canvas-rendered nodes appear in at least 3 distinct geographic regions. Within 10 seconds, moving assets (UAVs/aircraft) are visible and connection lines draw between nodes. Within 30 seconds, the animation completes and no `<canvas>` element with z-index 54 remains in the DOM — verifies the full lifecycle of render, animate, and cleanup.

**Acceptance Scenarios:**

1. **Given** the map is loaded and no mesh animation is active, **When** the user presses `M` (not while focused on an input), **Then** a `<canvas>` element appears in the map container with `pointer-events: none` and `z-index: 54`, and at least 17 nodes begin fading in within 2 seconds.
2. **Given** the mesh animation is in the `intra-cluster` phase (2-4s elapsed), **When** rendered, **Then** lines are drawn between nodes within the same cluster (≥3 edges per cluster).
3. **Given** the mesh animation is in the `mobile-assets` phase (4-8s elapsed), **When** rendered, **Then** at least 3 mobile nodes (UAVs or aircraft) are visibly moving along predefined paths, changing position by ≥0.1 degrees longitude per second.
4. **Given** a UAV has moved within 600km of a cluster node it was not originally connected to, **When** the `dynamic-discovery` phase is active (6-10s), **Then** a dashed "discovering" edge appears between the UAV and the nearest cluster node, transitioning to a solid "connected" edge within 2 seconds.
5. **Given** the mesh animation is in the `satellite-backhaul` phase (8-12s), **When** rendered, **Then** at least 2 curved arc edges connect different clusters.
6. **Given** the mesh animation is in the `signal-propagation` phase (12-20s), **When** rendered, **Then** at least 1 signal pulse dot is visible traveling along a connected edge.
7. **Given** the mesh animation has been running for ≥30 seconds, **When** all node alphas reach 0, **Then** the canvas element is removed from the DOM, `cancelAnimationFrame` has been called, and all event listeners on `window` and `map` have been removed.
8. **Given** the mesh animation is active, **When** the user presses `M` again, **Then** the animation stops immediately, the canvas is removed, and no animation frame callbacks continue.
9. **Given** the mesh animation is active, **When** the user pans or zooms the map, **Then** all nodes reproject to correct screen positions on the next animation frame (tracked via `map.project()`).

---

### User Story 3 — Atlas Terminal Boot Sequence (Priority: P2)

A site visitor on the `/briefing` page opens the terminal (backtick key) and types `atlas`. The terminal streams a line-by-line Atlas C2 boot sequence showing decentralized identity provisioning, transport probing, peer discovery, mesh formation, node authorization, and agent harness loading — approximately 35 lines with realistic delays between 100ms and 800ms.

**Why this priority:** This is an enhancement to the Easter egg that adds depth on the ExecutiveBrief page. The mesh visualization (US2) is independently valuable without it.

**Independent Test:** Navigate to `/briefing`, open terminal with backtick, type `atlas` and press Enter. Within 1 second the first line "ATLAS C2 PLATFORM — BOOT SEQUENCE INITIATED" appears. Within 15 seconds all ~35 lines have streamed, including lines containing "DID:mesh:", "BLE", "LoRa", "Satellite", "Verifiable Credential", and "FULLY OPERATIONAL" — verifies the boot sequence streams correctly with delays.

**Acceptance Scenarios:**

1. **Given** the terminal is open on the `/briefing` page, **When** the user types `atlas` and presses Enter, **Then** the terminal begins streaming lines, with the first line appearing within 200ms and the full sequence completing within 15 seconds.
2. **Given** the `atlas` command is running, **When** the satellite transport line appears, **Then** there is a visible pause of approximately 800ms before the "Satellite uplink acquired" result line appears (simulating scan delay).
3. **Given** the `atlas` command is running, **When** the user types `help`, **Then** the help output includes "atlas" in the command list.
4. **Given** the terminal is open, **When** the user types `mesh`, **Then** it behaves identically to the `atlas` command (alias).
5. **Given** the user presses `M` while on the `/briefing` page (not focused on an input), **When** the keyboard handler fires, **Then** the terminal opens (if not already open) and the line "ATLAS C2 PLATFORM — BOOT SEQUENCE INITIATED" appears within 200ms.

---

### User Story 4 — Effect System Registration (Priority: P2)

The mesh network effect is registered in the effect engine so it can be triggered by the geofence system or idle-timer system on the map page, in addition to the keyboard shortcut.

**Why this priority:** Integration with the existing effect engine is a polish step. The `M` key trigger (US2) provides the primary activation method.

**Independent Test:** With the map page loaded, dispatch `window.dispatchEvent(new CustomEvent('atlas-mesh-activate'))` from the browser console. The mesh animation activates on the map — verifies event-driven activation independent of keyboard input.

**Acceptance Scenarios:**

1. **Given** `effectConfig.json` contains a `meshNetwork` entry with `duration: 32000`, **When** the effect engine's `getEffectDuration('meshNetwork')` is called, **Then** it returns `32000`.
2. **Given** the effect engine's `effectRegistry` contains `meshNetwork`, **When** `executeEffect('meshNetwork', container)` is called, **Then** a `CustomEvent('atlas-mesh-activate')` is dispatched on `window`.
3. **Given** `effectConfig.json` sets `meshNetwork` probability to `0.02`, **When** the idle-timer random effect selector runs 1000 times, **Then** `meshNetwork` is selected approximately 20 times (±10).

---

### Edge Cases

- **EC-001: M key pressed while typing in an input or terminal.** Expected: the `M` keypress is consumed by the input field; the mesh animation does NOT trigger. Guard via `e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable` check (existing pattern in `useEasterEggs.ts`).
- **EC-002: M key pressed while mesh animation is already running.** Expected: the animation toggles off — canvas is immediately removed, RAF is cancelled, event listeners are cleaned up.
- **EC-003: Map component unmounts while mesh animation is running (e.g., user navigates to `/briefing`).** Expected: the React `useEffect` cleanup function removes the canvas, cancels RAF, and removes event listeners. No orphaned RAF callbacks or DOM elements.
- **EC-004: Browser window is resized during mesh animation.** Expected: the canvas dimensions update to match the new container size on the next frame.
- **EC-005: Mobile device (touch-only, no keyboard).** Expected: mesh animation is not triggered via keyboard (no `M` key). A small hidden tactical-styled button in the HUD provides a touch-based trigger on mobile. The button uses the existing HUD aesthetic (green on black, monospace) and is small enough to avoid cluttering the mobile layout.
- **EC-006: Map is zoomed far out (globe view) during animation.** Expected: all nodes project correctly via `map.project()`. Nodes on the backside of the globe (not visible) have screen coordinates off-canvas — they render off-screen with no visual artifact.
- **EC-007: Atlas terminal command executed while a previous boot sequence is still streaming.** Expected: the previous sequence is cancelled (all pending `setTimeout` callbacks cleared via the cancel function), the terminal is not cleared (existing output remains), and a fresh boot sequence starts from the first line.
- **EC-008: User closes terminal while atlas boot sequence is streaming.** Expected: all pending `setTimeout` callbacks are cancelled via the returned cancel function. No further lines are appended to the terminal state after close.
- **EC-009: No Adyton logo file exists at `public/logos/adyton.png`.** Expected: the career marker renders without a logo image. No console error. The detail panel displays all other information correctly. (Per D-RES-2.)
- **EC-010: Canvas 2D context creation fails (`getContext('2d')` returns null).** Expected: log a warning via debug logger, bail out of the animation — no canvas is appended, no RAF loop starts, no crash. The mesh Easter egg silently fails to render.

---

## Functional Requirements *(mandatory)*

### Career Data

- **FR-001:** `public/resume.json` MUST contain a work entry with `name: "Adyton"`, `position: "Staff Software Engineer"`, `startDate: "2025-10"`, no `endDate`, and `x_location.geo` set to `{ lat: 39.5, lon: -98.35 }`.
- **FR-002:** The Adyton entry's `summary` field MUST contain the phrases "decentralized" and "NATS JetStream" (describing both Atlas and the notification platform).
- **FR-003:** The Adyton entry's `highlights` array MUST have exactly 4 entries covering: (a) Atlas mesh networking, (b) decentralized identity, (c) NATS notification platform, (d) muster messages.
- **FR-004:** The Picogrid work entry in `resume.json` MUST have `endDate: "2025-10"`.
- **FR-005:** `TACTICAL_CODENAMES` in `src/services/resumeDataService.ts` MUST contain the mapping `'Adyton': 'OPERATION ATLAS'`.
- **FR-006:** `resume.json` `projects` array MUST contain entries for "Atlas" (mentioning mesh networking, DIDs, multi-transport) and "Async Notification Platform" (mentioning NATS JetStream, 1M+ notifications).
- **FR-007:** `resume.json` `basics.summary` MUST be updated to reference the current Adyton role.

### Mesh Visualization

- **FR-008:** Pressing the `M` key on the map page (when not focused on an input element) MUST toggle a canvas-based mesh network overlay on the Mapbox map.
- **FR-009:** The mesh visualization MUST render nodes in 3 distinct geographic regions: continental US (center ~39°N, 98°W), Central Europe (center ~48°N, 12°E), and Middle East / CENTCOM region (center ~25°N, 45°E).
- **FR-010:** The visualization MUST render a total of ≥17 static nodes across the 3 clusters, distributed as approximately 8-10 in US, 4-5 in Europe, and 3-4 in CENTCOM.
- **FR-011:** Node types MUST include at least: ground-station, uav, aircraft, satellite, and sensor. Each type MUST be visually distinct using a unique shape and color. The `phone` type is defined in the type system for future use but is NOT required in the initial implementation.
- **FR-012:** Node shapes MUST be inspired by MIL-STD-2525D friendly-unit symbology: ground stations as rectangles, UAVs as chevrons/arrows, aircraft as triangles, satellites as diamonds, sensors as upward-pointing triangles. Shapes are hand-drawn on canvas (no external symbology library). A `drawPhone` function MAY be implemented but is not required.
- **FR-013:** The animation MUST progress through 7 distinct phases over approximately 30 seconds: cluster fade-in, intra-cluster edge drawing, mobile asset movement, dynamic discovery, satellite backhaul, signal propagation, and fading-out.
- **FR-014:** At least 3 mobile nodes (UAVs and/or aircraft) MUST animate along predefined geographic paths, with position updating each animation frame.
- **FR-015:** When a mobile node is within 600km geographic distance of a cluster node it is not yet connected to, a "discovering" edge (visually dashed) MUST appear, transitioning to a "connected" edge (visually solid) within 2 seconds.
- **FR-016:** At least 2 satellite backhaul connections MUST render as curved arcs (quadratic bezier with upward control point) connecting nodes in different clusters.
- **FR-017:** During the signal propagation phase, at least 1 signal pulse (a small glowing dot) MUST travel along a connected edge from source node to destination node.
- **FR-018:** Edge colors MUST vary by transport type: wifi=green (`#00ff00`), ble=blue (`#0088ff`), lora=orange (`#ff8800`), satellite=purple (`#ff44ff`).
- **FR-019:** The canvas overlay MUST use `z-index: 54` (per D-PROJ-2), `pointer-events: none`, and `position: absolute`.
- **FR-020:** All nodes MUST reproject to correct screen positions when the user pans or zooms the map (using `map.project()` per frame).
- **FR-021:** The animation MUST self-cleanup after approximately 30 seconds: fade all elements to alpha 0, remove the canvas from the DOM, cancel all `requestAnimationFrame` callbacks, and remove all event listeners from `window` and `map`.
- **FR-022:** The maximum number of concurrent signal pulse objects MUST be capped at 12 to maintain ≥30fps frame rate on mid-range hardware.

### Terminal Boot Sequence

- **FR-023:** The terminal command `atlas` on the `/briefing` page MUST stream approximately 35 lines of text simulating an Atlas C2 platform boot sequence.
- **FR-024:** The boot sequence MUST include lines representing: decentralized identity generation (DID), transport probing (BLE, WiFi, LoRa, Satellite), peer discovery, transport priority negotiation, mesh topology formation, authorization via verifiable credential, sensor/effector node registration, and edge agentic harness loading.
- **FR-025:** The first line MUST appear with 0ms delay (immediately). Subsequent line delays MUST vary between 100ms and 300ms for standard lines, with an 800ms delay for the satellite "SEARCHING..." line.
- **FR-026:** The `mesh` command MUST behave identically to `atlas` (alias).
- **FR-027:** The `streamBootSequence` function MUST return a cancel function that clears all pending `setTimeout` callbacks.
- **FR-028:** The `help` command output MUST include `atlas` in the command list.
- **FR-029:** The `eggs` command output MUST include `atlas` in the available eggs list.

### Effect System

- **FR-030:** `meshNetwork` MUST be registered in the effect engine's `effectRegistry`.
- **FR-031:** When `meshNetwork` is executed via the effect engine, it MUST dispatch a `CustomEvent('atlas-mesh-activate')` on `window`.
- **FR-032:** `effectConfig.json` MUST contain `meshNetwork` in `durations` (value: 32000) and `probabilities` (value: 0.02).
- **FR-033:** The `M` keyboard shortcut MUST also be registered in the ExecutiveBrief `useEasterEggs.ts` hook, triggering the `atlas` Easter egg type.
- **FR-034:** `'atlas'` MUST be added to the `EasterEggType` union and the `validEggs` arrays in `trigger`, `scan`, and `unlock-all` terminal commands.
- **FR-035:** If the `atlas` terminal command is invoked while a previous boot sequence is still streaming, the previous sequence MUST be cancelled (all pending `setTimeout` callbacks cleared) and a fresh boot sequence MUST start immediately. Existing terminal output MUST NOT be cleared.
- **FR-036:** On mobile devices (detected via the existing `useResponsive` hook's `isMobile` flag), a small tactical-styled HUD button MUST be rendered that triggers the mesh network animation on tap. The button MUST use the Mission Control aesthetic (green on black, monospace font, per D-PROJ-1) and MUST be small enough to avoid cluttering the mobile layout (≤40x40px touch target, positioned in an unoccupied HUD corner).

---

## Success Criteria *(mandatory)*

- **SC-001:** A site visitor sees Adyton as the current employer within 3 seconds of the map loading, with correct position title, codename, and date range.
- **SC-002:** A site visitor pressing `M` on the map page sees a mesh network animation begin within 2 seconds, with ≥17 visible nodes across 3 geographic regions.
- **SC-003:** The mesh animation completes its full lifecycle (render → animate → cleanup) in 28-32 seconds with no DOM elements or event listeners remaining after completion.
- **SC-004:** During the mesh animation, the frame rate remains ≥30fps on a 2020-era laptop (verified via manual DevTools performance tab check during animation).
- **SC-005:** A site visitor typing `atlas` in the ExecutiveBrief terminal sees the full boot sequence stream within 15 seconds.
- **SC-006:** The `npm run build` command completes with zero TypeScript errors and zero ESLint errors after all changes.

---

## Key Entities

- **MeshNode:** A geographic point on the map representing a device in the mesh network. Has a type (ground-station, uav, aircraft, satellite, sensor, phone), belongs to zero or one cluster, has geographic coordinates, speaks one or more transport types, and has an opacity (alpha) for fade-in/fade-out animation. Mobile nodes additionally have a path (array of waypoints) and a progress value along that path.
- **MeshEdge:** A connection between two MeshNodes. Has a state (discovering → handshaking → connected), a transport type determining its visual color, an opacity for animation, and a flag indicating whether it renders as a curved satellite backhaul arc.
- **MeshCluster:** A named group of MeshNodes in the same geographic region (e.g., "US", "Europe", "CENTCOM"). Has a center coordinate and an opacity for fade-in.
- **SignalPulse:** A visual effect traveling along a MeshEdge. Has a progress value (0-1) representing position along the edge and an opacity.
- **CareerMarker:** (Existing entity, extended.) A geographic pin on the map representing a career entry. The Adyton entry adds a new instance with `type: 'work'`, `codename: 'OPERATION ATLAS'`, and remote-work coordinates.
- **BootLine:** A single line of terminal output with a delay (milliseconds) before it is printed. The Atlas boot sequence is an ordered array of BootLines.

---

## Assumptions

- The Adyton logo file (`public/logos/adyton.png`) may not be available at implementation time. The system MUST handle its absence gracefully (per D-RES-2).
- Adyton is a fully remote/distributed company; the map pin is placed at the geographic center of the continental US (39.5°N, 98.35°W) as the conventional representation of "Remote" (per D-DATA-2).
- Picogrid's Engineering Manager role ended in October 2025 and Adyton's Staff SWE role started in October 2025 (per engineer's explicit statement).
- MIL-STD-2525D symbology is "inspired by" rather than fully compliant — simplified shapes drawn on canvas, not pixel-accurate mil-spec symbols. No external symbology library is added (per Article V — Simplicity Gate).
- The mesh visualization is a visual Easter egg, not a simulation of actual Atlas internals. Geographic positions of clusters and mobile assets are chosen for visual impact, not operational accuracy.
- The 600km discovery radius for dynamic mesh joining is chosen for visual clarity at the zoom levels where multiple clusters are visible — it is not a real-world radio range.
- The terminal boot sequence text is illustrative/flavored rather than a literal representation of Atlas's actual boot process.

### Defaults Applied

- `D-DATA-2` — applied to FR-001 (Adyton coordinates: center of continental US for remote/distributed).
- `D-PROJ-1` — applied to FR-012, FR-018, Article VII gate (Mission Control color palette for all mesh symbols and edges).
- `D-PROJ-2` — applied to FR-019 (canvas z-index: 54, between UXV at 53 and DOM overlays at 57).
- `D-PROJ-3` — applied to FR-030, FR-031, FR-032 (Easter egg registration pattern: effectEngine → effectConfig → geofences).
- `D-PROJ-4` — applied to FR-005 (TACTICAL_CODENAMES format: `'Adyton': 'OPERATION ATLAS'`).
- `D-RES-1` — applied to FR-021 (self-cleanup: remove canvas, cancel RAF, remove listeners).
- `D-RES-2` — applied to EC-009 (graceful handling of missing logo file).
- `D-TEST-1` — applied to testing strategy (Vitest with jsdom for unit tests).
- `D-TEST-2` — applied to testing strategy (visual features verified manually in browser).
- `D-TEST-3` — applied to SC-006 (tsc -b and npm run lint must pass).

### Defaults Overridden

- `D-PERF-2` — defaults catalog specifies 60fps for canvas-based effects. This spec sets ≥30fps (SC-004, FR-022) because the mesh visualization renders ≥17 animated nodes + dynamic edges + signal pulses across a 30-second lifecycle, which is significantly more complex than single-effect particle animations that D-PERF-2 was calibrated for. 30fps is the graceful-degradation floor; 60fps is targeted but not guaranteed on mid-range hardware.

---

## Out of Scope

- Full MIL-STD-2525D / APP-6D symbology compliance or use of the `milsymbol` library.
- Real-time data from Atlas or any backend service — all data is static/predefined.
- Sound effects for the mesh animation or terminal boot sequence.
- Integration with the UXV drone system (mesh nodes and UXV drones are independent visual layers).
- Persisting mesh animation state to localStorage or the Zustand store.
- Updating the legacy `src/data/sites.json` with an Adyton entry (only `resume.json` is updated per D-DATA-1).

---

## Dependencies

- **Mapbox GL JS (v3.14.0):** Provides the globe projection, `map.project()` for coordinate-to-screen conversion, and the map container DOM element for canvas overlay. If Mapbox fails to load, the map page does not render and the mesh Easter egg cannot activate. Existing dependency — no new installation needed.
- **`public/resume.json`:** The career data source. If the file fails to load (network error, malformed JSON), the career system shows no markers. Existing pattern handles this via try/catch in `resumeDataService.ts`.
- **`src/utils/easterEggs/effectEngine.ts`:** The effect registry that the mesh effect registers into. If the engine fails to load (async import in `MapboxScene`), the geofence/idle trigger for mesh will not work, but the `M` keyboard shortcut still functions (registered independently in `MapboxScene`).

---

## Clarifications

### Session 2026-05-11

- Q: If a user types `atlas` while a previous boot sequence is still streaming, what should happen? → A: Cancel the previous sequence and restart. Previous output remains in the terminal; only the pending timeouts are cleared before a fresh boot begins. Applied to EC-007 and FR-035.
- Q: Should mobile users have a dedicated way to trigger the mesh Easter egg beyond the idle/geofence trigger? → A: Hidden UI button in the HUD. A small tactical-styled button using the MC aesthetic, positioned to avoid cluttering mobile layout. Applied to EC-005 and FR-036.
