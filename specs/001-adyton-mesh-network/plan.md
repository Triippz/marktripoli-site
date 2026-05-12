# Implementation Plan: Adyton Job Entry + Atlas Mesh Network Easter Egg

**Feature Branch:** `001-adyton-mesh-network`
**Date:** 2026-05-11
**Spec:** [spec.md](./spec.md)
**Constitution:** `docs/spec/constitution.md` v0.1.0

This plan describes HOW the feature will be built. The WHAT lives in spec.md. Tasks (DO-THIS) live in tasks.md.

## Summary

Add a new Adyton career entry to the resume data (FR-001 through FR-007) and build an Atlas mesh network Easter egg on the Mapbox map (FR-008 through FR-036). The career entry is a data-only change to `public/resume.json` and a one-line addition to `resumeDataService.ts`. The mesh Easter egg uses a canvas overlay rendered via `requestAnimationFrame`, following the existing `UXVRenderer.tsx` pattern — a React component that returns `null` and manages an imperative canvas appended to the map container. A state machine drives 7 animation phases over ~30 seconds. Nodes use hand-drawn MIL-STD-2525D-inspired symbols on canvas. The terminal boot sequence streams ~35 lines with `setTimeout` chains. Both systems integrate with existing Easter egg registration patterns.

---

## Technical Context

| Field | Value |
|-------|-------|
| Language / Version | TypeScript ~5.8.3, React 19.1, ES2022 target |
| Primary Dependencies | `mapbox-gl` 3.14.0, `framer-motion` 12.x, `zustand` 5.x, `react-router-dom` 7.x (all existing — no new dependencies) |
| Storage | Static JSON (`public/resume.json`), localStorage via Zustand persist middleware |
| Testing | Vitest with jsdom (unit/integration); manual browser verification for visual features (per D-TEST-2) |
| Target Platform | Web (desktop + mobile browsers) |
| Project Type | Single-package React SPA (Vite) |
| Performance Goals | ≥30fps during mesh animation on 2020-era laptop; ≤12 concurrent signal pulses (FR-022); animation lifecycle 28-32s (SC-003) |
| Constraints | No new npm dependencies (Article V); canvas z-index 54 (D-PROJ-2); all UI uses MC color tokens (Article VII) |
| Scale / Scope | ≥17 mesh nodes, 3 clusters, ~5 mobile assets, ~35 boot sequence lines |

---

## Constitution Check

- [x] **Gate I — Test-First:** tasks.md will list every test task ID before the implementation task that depends on it.
- [x] **Gate II — Evidence-Driven:** All FRs have quantified targets. No vague adjectives without quantification in spec.md.
- [x] **Gate III — CRITICAL-Resolved:** No open CRITICAL findings. 0 `[NEEDS CLARIFICATION]` markers.
- [x] **Gate IV — Independent MVP:** Both P1 stories (US1, US2) have non-empty Independent Test fields with specific action + value-delivered.
- [x] **Gate V — Simplicity:** One new feature directory (`src/features/mesh/`) with 7 files. No new libraries or services. Justified: mesh logic is complex enough to warrant its own feature directory rather than spreading across utils/easterEggs (7 files > threshold for a utils subdirectory).
- [x] **Gate VI — Anti-Abstraction:** Canvas rendering uses the raw Canvas 2D API directly (no wrapper). React component uses `useEffect` directly (no custom hook abstraction for the renderer). State machine is a pure function (`tickSimulation`) — the simplest possible pattern.
- [x] **Gate VII — Theme Consistency:** All node colors from MC palette or spec-defined transport colors (FR-018). Canvas overlay uses `mc-green` (#00ff00) as primary node color. HUD button uses `mc-green` on `mc-black` with monospace font. Boot sequence text uses terminal's existing green-on-black styling.

---

## Project Structure

```
src/features/mesh/                    # New feature directory
├── types.ts                          # MeshNode, MeshEdge, MeshCluster, SignalPulse, MeshState, BootLine
├── meshData.ts                       # Static geographic data: clusters, nodes, paths, waypoints
├── meshSimulation.ts                 # Pure state machine: tickSimulation(state, deltaMs) → MeshState
├── meshSymbols.ts                    # Canvas 2D drawing functions for each node type + edges + pulses
├── meshBootSequence.ts               # ATLAS_BOOT_SEQUENCE array + streamBootSequence() with cancel
├── MeshNetworkRenderer.tsx           # React component (returns null), owns canvas lifecycle + RAF loop
└── index.ts                          # Barrel exports

# Modified existing files:
public/resume.json                    # Adyton work entry + Picogrid endDate + projects + summary
src/services/resumeDataService.ts     # TACTICAL_CODENAMES addition
src/components/map/MapboxScene.tsx    # Mount MeshNetworkRenderer, M key, event listeners, HUD button
src/utils/easterEggs/effectEngine.ts  # Register meshNetwork effect
src/data/easterEggs/effectConfig.json # meshNetwork duration + probability
src/pages/ExecutiveBrief/types/easterEggs.ts           # 'atlas' in EasterEggType union
src/pages/ExecutiveBrief/hooks/useEasterEggs.ts        # triggerAtlas, M key binding
src/pages/ExecutiveBrief/utils/terminalCommands.ts     # atlas + mesh commands
src/pages/ExecutiveBrief/components/UI/HelpOverlay.tsx  # M key in help text
```

**Structure Decision:** The mesh feature is self-contained with 7 files (types, data, simulation, rendering, boot sequence, React component, barrel export). This mirrors the existing feature directories (`career/`, `terminal/`, `uxv/`). Placing mesh logic inside `utils/easterEggs/` would bloat that directory beyond its "small effect functions" purpose — the mesh system has its own state machine, renderer, and data model. Gate V satisfied: one directory, no new libraries.

---

## Phase 0 — Research

No `NEEDS CLARIFICATION` items remain. No new dependencies. No external integrations.

No research tasks needed.

---

## Phase 1 — Design & Contracts

### 1.1 Data Model

- **MeshNode:** `id: string`, `type: NodeType` (6 variants), `clusterId: string | null`, `geo: {lng, lat}`, `label: string`, `transport: TransportType[]`, `alpha: number` (0-1 opacity). Mobile nodes add `path: Array<{lng, lat}>`, `pathT: number` (0-1 progress), `pathSpeed: number` (degrees/second). No persistence — runtime only.

- **MeshEdge:** `id: string`, `fromNodeId: string`, `toNodeId: string`, `state: EdgeState` (`discovering` → `handshaking` → `connected`), `transport: TransportType`, `alpha: number`, `isSatelliteBackhaul: boolean`. Satellite backhaul edges render with quadratic bezier curves.

- **MeshCluster:** `id: string`, `name: string`, `center: {lng, lat}`, `nodeIds: string[]`, `alpha: number`. Three clusters: "us", "europe", "centcom".

- **SignalPulse:** `id: string`, `edgeId: string`, `t: number` (0-1 progress along edge), `alpha: number`. Capped at 12 concurrent (FR-022).

- **MeshState:** `phase: MeshPhase`, `phaseStartTime: number`, `elapsedMs: number`, `nodes: MeshNode[]`, `edges: MeshEdge[]`, `clusters: MeshCluster[]`, `signalPulses: SignalPulse[]`. Passed by value through `tickSimulation()`.

- **BootLine:** `text: string`, `delayMs: number`. The `ATLAS_BOOT_SEQUENCE` is a static array of ~35 BootLines. `streamBootSequence(appendLine)` returns a cancel function.

- **CareerMarker (existing, extended):** New Adyton entry: `type: 'work'`, `codename: 'OPERATION ATLAS'`, `isCurrent: true`, coordinates at US center.

### 1.2 Interface Contracts

- **`tickSimulation(state: MeshState, deltaMs: number): MeshState`** — Pure function. Called once per animation frame by the renderer. Returns a new state object (immutable update pattern). Phase transitions are time-based using `state.elapsedMs`. No side effects.

- **`streamBootSequence(appendLine: (text: string) => void): () => void`** — Starts streaming boot lines via `setTimeout` chains. Returns a cancel function that clears all pending timeouts. Idempotent cancel (safe to call multiple times). Per FR-035, a second invocation cancels the previous sequence before starting.

- **`CustomEvent('atlas-mesh-activate')` / `CustomEvent('atlas-mesh-deactivate')`** — Window-level DOM events bridging the effect engine to the React component. `effectEngine.meshNetwork()` dispatches `atlas-mesh-activate`. `MapboxScene` listens and toggles `meshActive` state.

### 1.3 Cross-Cutting Concerns

#### Observability

- **Log fields:** `[mesh] Phase transition: ${fromPhase} → ${toPhase}` via `featureLoggers.career` (reuse existing logger namespace). Boot sequence does not log (it IS the output).
- **Metric names:** N/A — client-side Easter egg. No server metrics.
- **Trace spans:** N/A.

#### Security

- **Trust boundary:** None. All data is static/client-side. No user input is processed by the mesh system. The `M` key handler only toggles a boolean.
- **Secrets:** None introduced.

#### Failure Modes

- **Canvas creation failure:** If `document.createElement('canvas')` or `getContext('2d')` returns null (extremely rare), log a warning and bail — no animation renders. No crash.
- **map.project() off-screen:** Nodes on the backside of the globe return screen coordinates outside canvas bounds. Canvas `clip` is implicit — drawing off-canvas is a no-op. No special handling needed.
- **Missing logo:** Career marker renders without logo image. `CareerDetailsDialog` shows all other fields. (Per D-RES-2, EC-009.)
- **Terminal close during boot:** Cancel function clears all pending `setTimeout` callbacks. (Per FR-027, EC-008.)
- **Boot sequence re-invocation:** Previous sequence cancelled, fresh one starts. (Per FR-035, EC-007.)

---

## Complexity Tracking

| Violated Gate | Why Needed | Simpler Alternative Rejected Because |
|---------------|------------|--------------------------------------|
| Gate V — `src/features/mesh/` (7 files) | Mesh system has its own state machine, renderer, data model, symbol drawing, and boot sequence — too large for a single file or a subdirectory under `utils/easterEggs/` | Putting everything in one file would exceed 800 lines. Splitting across `utils/easterEggs/effects/` would scatter related logic across 5+ existing files and break the "effects are small self-contained functions" convention. A feature directory matches the `career/`, `terminal/`, `uxv/` pattern. |

---

## Optional Artifacts

- [ ] `data-model.md` — not needed; data model is fully described in §1.1 above.
- [ ] `contracts/<name>.yaml` — not needed; no HTTP/gRPC/async APIs.
- [ ] `research.md` — not needed; no unknowns.
- [ ] `quickstart.md` — not needed; verification is manual browser testing per spec §Success Criteria.
