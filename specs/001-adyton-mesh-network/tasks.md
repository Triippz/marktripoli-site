# Tasks: Adyton Job Entry + Atlas Mesh Network Easter Egg

**Feature Branch:** `001-adyton-mesh-network`
**Inputs:** spec.md (user stories with priorities), plan.md (tech stack, structure), constitution
**Optional inputs:** *(none authored)*

> **Constitution Article I (NON-NEGOTIABLE):** Tests are not optional. Every behaviour-changing implementation task is preceded by a test task that exercises it.

---

## Phase 1 — Setup (Shared Infrastructure)

- [ ] T001 Create feature directory structure at `src/features/mesh/`
- [ ] T002 [P] Create barrel export file at `src/features/mesh/index.ts`

---

## Phase 2 — Foundational (Blocking Prerequisites)

- [ ] T003 Write test: MeshNode, MeshEdge, MeshCluster, SignalPulse, MeshState types compile correctly in `src/features/mesh/__tests__/types.test.ts`
- [ ] T004 Define type definitions (NodeType, TransportType, EdgeState, MeshPhase, MeshNode, MeshEdge, MeshCluster, SignalPulse, MeshState, BootLine) in `src/features/mesh/types.ts`

**Checkpoint:** Foundation types are defined and compile. All subsequent phases depend on these types.

---

## Phase 3 — User Story 1 — Adyton Career Entry on Map (Priority: P1) 🎯 MVP

**Goal:** Adyton appears as the current employer on the map with correct details, and Picogrid shows an end date.
**Independent Test:** Visit `/`, click the Adyton pin near (39.5, -98.35), verify "Staff Software Engineer", "OPERATION ATLAS", "2025 – PRESENT", and 4 highlights mentioning Atlas and NATS JetStream.

### Tests for User Story 1 (write FIRST, ensure they FAIL)

- [ ] T005 [US1] Write test: `resumeDataService` transforms Adyton work entry into a CareerMarker with `name: "Adyton"`, `codename: "OPERATION ATLAS"`, `isCurrent: true`, `location.lat` ≈ 39.5 in `src/services/__tests__/resumeDataService.adyton.test.ts`
- [ ] T006 [P] [US1] Write test: Picogrid CareerMarker has `isCurrent: false` when `endDate: "2025-10"` is present in `src/services/__tests__/resumeDataService.adyton.test.ts`
- [ ] T007 [P] [US1] Write test: Adyton entry `summary` contains "decentralized" and "NATS JetStream" in `src/services/__tests__/resumeDataService.adyton.test.ts`
- [ ] T007a [P] [US1] Write test: `resume.json` `projects` array contains entries with names containing "Atlas" and "Notification Platform" in `src/services/__tests__/resumeDataService.adyton.test.ts`
- [ ] T007b [P] [US1] Write test: `resume.json` `basics.summary` contains "Adyton" or "decentralized" in `src/services/__tests__/resumeDataService.adyton.test.ts`

### Implementation for User Story 1

- [ ] T008 [US1] Add Adyton work entry (position, dates, summary, highlights, x_location, x_languages, x_technologies, x_skills) as first item in `work` array in `public/resume.json`
- [ ] T009 [US1] Add `"endDate": "2025-10"` to Picogrid work entry in `public/resume.json`
- [ ] T010 [US1] Update `basics.summary` to reference current Adyton role in `public/resume.json`
- [ ] T011 [P] [US1] Add Atlas and Async Notification Platform entries to `projects` array in `public/resume.json`
- [ ] T012 [US1] Add `'Adyton': 'OPERATION ATLAS'` to `TACTICAL_CODENAMES` in `src/services/resumeDataService.ts`
- [ ] T013 [US1] Add Adyton logo file at `public/logos/adyton.png` (or remove `x_logo` from entry if unavailable)

**Checkpoint:** Adyton pin appears on map, career detail shows correct data, Picogrid shows end date. Independent Test for US1 succeeds.

---

## Phase 4 — User Story 2 — Atlas Mesh Network Visualization on Map (Priority: P1) 🎯

**Goal:** Pressing M on the map triggers a ~30-second mesh network animation with 3 clusters, ≥17 nodes, moving assets, dynamic discovery, satellite backhaul, and signal propagation.
**Independent Test:** Press M on map, observe ≥17 nodes in 3 regions within 2s, moving assets within 10s, full cleanup within 30s with no residual DOM/listeners.

### Tests for User Story 2 (write FIRST, ensure they FAIL)

- [ ] T014 [US2] Write test: `createInitialMeshState()` returns state with ≥17 nodes across 3 clusters in `src/features/mesh/__tests__/meshData.test.ts`
- [ ] T015 [P] [US2] Write test: `tickSimulation()` transitions through all 7 phases in correct order when given cumulative elapsed time in `src/features/mesh/__tests__/meshSimulation.test.ts`
- [ ] T016 [P] [US2] Write test: `tickSimulation()` adds ≥3 intra-cluster edges during `intra-cluster` phase (2000-4000ms) in `src/features/mesh/__tests__/meshSimulation.test.ts`
- [ ] T017 [P] [US2] Write test: `tickSimulation()` advances mobile node `pathT` during `mobile-assets` phase in `src/features/mesh/__tests__/meshSimulation.test.ts`
- [ ] T018 [P] [US2] Write test: `tickSimulation()` creates `discovering` edge when mobile node is within 600km of a cluster node in `src/features/mesh/__tests__/meshSimulation.test.ts`
- [ ] T019 [P] [US2] Write test: `tickSimulation()` caps `signalPulses` at 12 concurrent in `src/features/mesh/__tests__/meshSimulation.test.ts`
- [ ] T020 [P] [US2] Write test: `tickSimulation()` sets all node alphas to 0 after `fading-out` phase completes in `src/features/mesh/__tests__/meshSimulation.test.ts`
- [ ] T021 [P] [US2] Write test: each `drawGroundStation`, `drawUAV`, `drawAircraft`, `drawSatellite`, `drawSensor` function calls `ctx.beginPath()` and `ctx.stroke()` or `ctx.fill()` in `src/features/mesh/__tests__/meshSymbols.test.ts`
- [ ] T022 [P] [US2] Write test: `drawEdge()` uses `setLineDash([5, 5])` for `discovering` state and `setLineDash([])` for `connected` state in `src/features/mesh/__tests__/meshSymbols.test.ts`
- [ ] T022a [P] [US2] Write test: `MeshNetworkRenderer` creates a canvas element when `active=true` and removes it on cleanup in `src/features/mesh/__tests__/MeshNetworkRenderer.test.tsx`
- [ ] T022b [P] [US2] Write test: M key handler on MapboxScene does NOT fire when `e.target.tagName` is 'INPUT' or 'TEXTAREA' in `src/components/map/__tests__/MapboxScene.mesh.test.tsx`
- [ ] T022c [P] [US2] Write test: `atlas-mesh-activate` CustomEvent toggles `meshActive` state in MapboxScene in `src/components/map/__tests__/MapboxScene.mesh.test.tsx`

### Implementation for User Story 2

- [ ] T023 [US2] Implement static cluster/node/path data in `src/features/mesh/meshData.ts` — 3 clusters (US ~8-10 nodes, Europe ~4-5, CENTCOM ~3-4), 2 UAV paths, 1 aircraft path, 2 satellite paths
- [ ] T024 [US2] Implement `tickSimulation()` state machine (7 phases, time-based transitions, mobile movement, edge creation, discovery logic, signal pulse spawning, fade-out) in `src/features/mesh/meshSimulation.ts`
- [ ] T025 [P] [US2] Implement canvas drawing functions for all 6 node types + edges + signal pulses in `src/features/mesh/meshSymbols.ts`
- [ ] T026 [US2] Implement `MeshNetworkRenderer` React component (canvas lifecycle, RAF loop, map.project() reprojection, resize handling, cleanup) in `src/features/mesh/MeshNetworkRenderer.tsx`
- [ ] T027 [US2] Mount `MeshNetworkRenderer` in `src/components/map/MapboxScene.tsx` — add `meshActive` state, `M` key listener (guarded against input focus), `atlas-mesh-activate`/`deactivate` event listeners, conditional render
- [ ] T028 [US2] Add hidden tactical HUD button for mobile mesh trigger (≤40x40px, mc-green on mc-black, monospace, positioned in unoccupied HUD corner) in `src/components/map/MapboxScene.tsx`
- [ ] T029 [US2] Update barrel exports in `src/features/mesh/index.ts`

**Checkpoint:** Pressing M on map (or tapping HUD button on mobile) starts the full mesh animation. All 7 phases render correctly. Animation self-cleans after ~30s. No DOM/listener leaks. Independent Test for US2 succeeds.

---

## Phase 5 — User Story 3 — Atlas Terminal Boot Sequence (Priority: P2)

**Goal:** Typing `atlas` in the ExecutiveBrief terminal streams a ~35-line boot sequence with realistic delays.
**Independent Test:** Open terminal on `/briefing`, type `atlas`, verify first line within 1s, all ~35 lines within 15s including DID, BLE, LoRa, Satellite, Verifiable Credential, FULLY OPERATIONAL.

### Tests for User Story 3 (write FIRST, ensure they FAIL)

- [ ] T030 [US3] Write test: `ATLAS_BOOT_SEQUENCE` has ≥30 entries and includes lines containing "DID:mesh:", "BLE", "LoRa", "Satellite", "Verifiable Credential", "FULLY OPERATIONAL" in `src/features/mesh/__tests__/meshBootSequence.test.ts`
- [ ] T031 [P] [US3] Write test: `streamBootSequence()` returns a cancel function; calling cancel clears all pending timeouts (use `vi.useFakeTimers`) in `src/features/mesh/__tests__/meshBootSequence.test.ts`
- [ ] T032 [P] [US3] Write test: invoking `streamBootSequence()` twice cancels the first sequence before starting the second (per FR-035) in `src/features/mesh/__tests__/meshBootSequence.test.ts`
- [ ] T032a [P] [US3] Write test: `findCommand('atlas')` returns a command object and `findCommand('mesh')` returns a command object in `src/pages/ExecutiveBrief/__tests__/terminalCommands.atlas.test.ts`
- [ ] T032b [P] [US3] Write test: `atlas` command handler calls `streamBootSequence` with `actions.appendLine` in `src/pages/ExecutiveBrief/__tests__/terminalCommands.atlas.test.ts`
- [ ] T032c [P] [US3] Write test: `EasterEggType` includes `'atlas'` (type assertion) in `src/pages/ExecutiveBrief/__tests__/easterEggs.atlas.test.ts`
- [ ] T032d [P] [US3] Write test: `triggerEgg('atlas')` returns `true` in `src/pages/ExecutiveBrief/__tests__/useEasterEggs.atlas.test.ts`
- [ ] T032e [P] [US3] Write test: executing `help` command returns output containing 'atlas'; executing `eggs` command returns output containing 'atlas'; `trigger` validEggs array includes `'atlas'` in `src/pages/ExecutiveBrief/__tests__/terminalCommands.atlas.test.ts`

### Implementation for User Story 3

- [ ] T033 [US3] Implement `ATLAS_BOOT_SEQUENCE` array and `streamBootSequence()` with cancel support and re-invocation cancellation in `src/features/mesh/meshBootSequence.ts`
- [ ] T034 [US3] Add `atlas` and `mesh` terminal commands (calling `streamBootSequence`) in `src/pages/ExecutiveBrief/utils/terminalCommands.ts`
- [ ] T035 [US3] Update `help`, `eggs`, `trigger` validEggs, `scan`, and `unlock-all` to include `'atlas'` in `src/pages/ExecutiveBrief/utils/terminalCommands.ts`
- [ ] T036 [US3] Add `'atlas'` to `EasterEggType` union in `src/pages/ExecutiveBrief/types/easterEggs.ts`
- [ ] T037 [US3] Add `triggerAtlas` callback, `case 'atlas'` in `triggerEgg`, and `M` key binding in `src/pages/ExecutiveBrief/hooks/useEasterEggs.ts`
- [ ] T038 [US3] Add `M: Atlas mesh network` line to `src/pages/ExecutiveBrief/components/UI/HelpOverlay.tsx`

**Checkpoint:** `atlas` and `mesh` commands stream boot sequence in terminal. M key triggers on ExecutiveBrief page. Help shows M binding. Independent Test for US3 succeeds.

---

## Phase 6 — User Story 4 — Effect System Registration (Priority: P2)

**Goal:** Mesh effect registered in effect engine for geofence/idle triggers.
**Independent Test:** Dispatch `window.dispatchEvent(new CustomEvent('atlas-mesh-activate'))` from console; mesh activates on map.

### Tests for User Story 4 (write FIRST, ensure they FAIL)

- [ ] T039 [US4] Write test: `effectEngine` registry contains `meshNetwork` key and calling it dispatches `CustomEvent('atlas-mesh-activate')` in `src/utils/easterEggs/__tests__/effectEngine.mesh.test.ts`
- [ ] T039a [P] [US4] Write test: `effectConfig.json` contains `meshNetwork` key in `durations` with value `32000` and in `probabilities` with value `0.02` in `src/utils/easterEggs/__tests__/effectEngine.mesh.test.ts`

### Implementation for User Story 4

- [ ] T040 [US4] Register `meshNetwork` in `effectRegistry` (dispatches `atlas-mesh-activate` event) in `src/utils/easterEggs/effectEngine.ts`
- [ ] T041 [P] [US4] Add `meshNetwork` to `durations` (32000), `probabilities` (0.02), and `effects` in `src/data/easterEggs/effectConfig.json`

**Checkpoint:** Effect engine recognizes `meshNetwork`. Idle timer can randomly trigger it. Console event dispatch activates mesh on map.

---

## Final Phase — Polish & Cross-Cutting Concerns

- [ ] T042 Run `npm run build` and verify zero TypeScript errors in project root
- [ ] T043 Run `npm run lint` and verify zero ESLint errors in project root
- [ ] T044 Run `npm run test` and verify all tests pass in project root
- [ ] T045 Manual browser verification: map page — Adyton pin, career detail, mesh M-key trigger, full animation lifecycle, mobile HUD button
- [ ] T046 Manual browser verification: `/briefing` page — Adyton in work list, terminal `atlas` command, M key trigger, help overlay

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** has no dependencies; runs first.
- **Foundational (2)** depends on Setup; blocks all user-story phases.
- **US1 (3)** and **US2 (4)** depend on Foundational; can run in parallel (different files).
- **US3 (5)** depends on Foundational (uses `meshBootSequence.ts` from types); can parallel with US1/US2.
- **US4 (6)** depends on US2 completion (needs `MeshNetworkRenderer` mounted to handle events).
- **Polish (Final)** depends on all user stories.

### Parallel Opportunities

- T005/T006/T007 can run in parallel (same test file, independent test cases).
- T014-T022 can all run in parallel (different test files or independent test cases).
- T023/T025 can run in parallel (different implementation files).
- T030/T031/T032 can run in parallel (same test file, independent test cases).
- US1, US2, and US3 implementation phases can run in parallel after Foundational.

### Within a User Story

- Test tasks (T005-T007, T014-T022, T030-T032, T039) MUST be written before their corresponding implementation tasks (Article I).
- Each Checkpoint validates the Independent Test from spec.md before proceeding.

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Setup (Phase 1) + Foundational (Phase 2).
2. US1 (Phase 3) — Adyton appears on map. Validate.
3. US2 (Phase 4) — Mesh animation works. Validate.
4. Stop and demo if needed.

### Incremental Delivery

1. US1 → Adyton visible (immediate value).
2. US2 → Mesh Easter egg functional (signature feature).
3. US3 → Terminal boot sequence (depth).
4. US4 → Effect engine registration (discoverability).

### Parallel Agent Strategy

After Foundational: Agent A takes US1 (data changes), Agent B takes US2 (mesh feature), Agent C takes US3 (terminal). US4 after US2 merges.
