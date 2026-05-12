# Adversarial Review: Adyton Job Entry + Atlas Mesh Network Easter Egg

**Spec:** `specs/001-adyton-mesh-network/spec.md`
**Plan:** `specs/001-adyton-mesh-network/plan.md`
**Tasks:** `specs/001-adyton-mesh-network/tasks.md`
**Constitution:** `docs/spec/constitution.md` v0.1.0
**Reviewer:** spec-challenger
**Date:** 2026-05-11

---

## Verdict: ~~BLOCKED~~ → RESOLVED

**Original:** 5 open CRITICAL findings. Per constitution.md Article III.
**Resolution:** All 13 findings resolved (2026-05-11). See dispositions below.

---

## Findings Summary

| ID | Severity | Category | Location |
|----|----------|----------|----------|
| C1 | CRITICAL | Constitution-violation | spec.md SC-004, FR-022 vs defaults.md D-PERF-2 |
| C2 | CRITICAL | Test-coverage gap | tasks.md — FR-008, FR-036 (T026, T027, T028) |
| C3 | CRITICAL | Test-coverage gap | tasks.md — FR-028, FR-033, FR-034 (T034, T035, T036, T037, T038) |
| C4 | CRITICAL | Test-coverage gap | tasks.md — FR-006, FR-007 |
| C5 | CRITICAL | Independent-MVP-failure | spec.md US3-AS-5 |
| H1 | HIGH | Contradiction | spec.md FR-014 vs US2-AS-3 (mobile node count) |
| H2 | HIGH | Contradiction | spec.md FR-025 vs US3-AS-1 (first-line timing) |
| H3 | HIGH | Contradiction | spec.md FR-013 vs tasks.md T020/T024 (phase count and enumeration) |
| H4 | HIGH | Untestable-acceptance | spec.md US3-AS-5 |
| H5 | HIGH | Speculative-feature | spec.md FR-006, FR-007 |
| M1 | MEDIUM | Edge-case-missing | spec.md §Edge Cases — canvas creation failure |
| M2 | MEDIUM | Terminology-drift | spec.md §Key Entities vs FR-011 vs FR-012 (phone node type) |
| L1 | LOW | Style / wording | spec.md EC-001 — JavaScript operator precedence error in guard pseudocode |

---

## Pass 1 — Vague-Adjective Scan

Scanned spec.md for: `fast`, `slow`, `scalable`, `robust`, `secure`, `intuitive`, `simple`, `lightweight`, `modern`, `efficient`, `seamless`, `clean`, `elegant`, `friendly`, `reasonable`, `appropriate`.

**Result: 1 hit — not a violation.**

spec.md:123 contains "friendly-unit symbology" as part of the proper noun "MIL-STD-2525D friendly-unit symbology". This is a military standard terminology designation, not an unquantified adjective. No adjacent quantification is needed. This is a false-positive from lexical scan; no finding raised.

All other adjectives in the spec are either absent or immediately paired with quantification (e.g., "≥30fps", "≥17 nodes", "approximately 35 lines", "100ms and 300ms", "≤40x40px").

**Pass 1 findings: 0**

---

## Pass 2 — Contradiction Scan

### Finding H1 (HIGH) — Mobile node count: FR-014 contradicts US2-AS-3

| Field | Value |
|-------|-------|
| Severity | HIGH |
| Category | Contradiction |
| Location | spec.md FR-014 (line 125) vs spec.md US2-AS-3 (line 47) |

spec.md:125 reads: "FR-014: At least **3** mobile nodes (UAVs and/or aircraft) MUST animate along predefined geographic paths."

spec.md:47 reads: "US2-AS-3: at least **2** mobile nodes (UAVs or aircraft) are visibly moving along predefined paths."

An implementation with exactly 2 mobile nodes passes AS-3 but fails FR-014. An implementation with exactly 3 mobile nodes passes FR-014 but the acceptance scenario will never catch a regression to 2. These two values must agree.

**Recommendation:** Change US2-AS-3 to read "at least 3 mobile nodes" to match FR-014, or lower FR-014 to "at least 2" and state the reason.

---

### Finding H2 (HIGH) — First-line timing: FR-025 contradicts US3-AS-1

| Field | Value |
|-------|-------|
| Severity | HIGH |
| Category | Contradiction |
| Location | spec.md FR-025 (line 139) vs spec.md US3-AS-1 (line 67) |

spec.md:139 reads: "FR-025: Line delays MUST vary between **100ms and 300ms** for standard lines."

spec.md:67 reads: "US3-AS-1: the first line appearing **within 200ms**."

If the implementation complies with FR-025 and assigns the first BootLine a 250ms or 300ms delay, it passes FR-025 and fails AS-1's 200ms gate. FR-025 permits delays up to 300ms; AS-1 asserts the first line appears within 200ms. These are mutually exclusive outcomes for a single implementation.

The US3 user story description (spec.md:59) further undermines AS-1 by stating the range is "between 100ms and 800ms" without constraining the first line — yet another inconsistency within the terminal section.

**Recommendation:** Either (a) add a new sub-rule to FR-025 that the first line's delay MUST be ≤100ms and update AS-1 to reflect this, or (b) change AS-1's bound to "within 300ms" to match FR-025's upper boundary.

---

### Finding H3 (HIGH) — Phase count and enumeration: FR-013 contradicts tasks.md T020, T024

| Field | Value |
|-------|-------|
| Severity | HIGH |
| Category | Contradiction |
| Location | spec.md FR-013 (line 124) vs tasks.md T020 (line 64), T024 (line 71) |

spec.md:124 reads: "FR-013: The animation MUST progress through **≥6 distinct phases** over approximately 30 seconds: cluster fade-in, intra-cluster edge drawing, mobile asset movement, dynamic discovery, satellite backhaul, and signal propagation."

tasks.md:64 reads: "T020: `tickSimulation()` sets all node alphas to 0 after **`fading-out` phase** completes."

tasks.md:71 reads: "T024: Implement `tickSimulation()` state machine (**7 phases**, time-based transitions)."

plan.md:12 reads: "A state machine drives **7 animation phases** over ~30 seconds."

FR-013 enumerates exactly 6 named phases and does not mention `fading-out`. The implementation plan and tasks.md treat `fading-out` as a 7th distinct phase. The ≥6 floor in FR-013 technically allows 7, but the enumerated list is the authoritative definition of what phases the spec requires — and the 7th phase (`fading-out`) is absent from that list. A test written against FR-013 would not know to verify `fading-out` phase behaviour because the spec does not define it.

**Recommendation:** Add `fading-out` explicitly to FR-013's enumerated phase list (making it "≥7 distinct phases" or a fixed list of 7).

---

### Constitution vs Plan D-PERF-2 check

Covered under Finding C1 below (constitution violation is the correct severity floor).

**Pass 2 findings: 3 (H1, H2, H3)**

---

## Pass 3 — Constitution-Violation Scan

### Finding C1 (CRITICAL) — Constitution-violation: D-PERF-2 overridden silently without Complexity Tracking entry

| Field | Value |
|-------|-------|
| Severity | CRITICAL |
| Category | Constitution-violation |
| Location | spec.md SC-004 (line 162), FR-022 (line 133), defaults.md D-PERF-2 (line 35), spec.md §Defaults Overridden (line 202-204) |

defaults.md:35 reads: "D-PERF-2: Animation frame rate target: **60fps** for canvas-based effects; graceful degradation on mobile."

spec.md:162 reads: "SC-004: the frame rate remains **≥30fps** on a 2020-era laptop."

spec.md:133 reads: "FR-022: The maximum number of concurrent signal pulse objects MUST be capped at 12 to maintain **≥30fps**."

The spec sets a 30fps target for a canvas-based effect. D-PERF-2 establishes 60fps as the project-wide default for exactly this category. The spec does not cite D-PERF-2 in §Defaults Applied (spec.md:189-200 lists D-DATA-2, D-PROJ-1, D-PROJ-2, D-PROJ-3, D-PROJ-4, D-RES-1, D-RES-2, D-TEST-1, D-TEST-2, D-TEST-3 — D-PERF-2 is absent). The §Defaults Overridden section (spec.md:202-204) reads "*(empty)*".

Per the defaults catalog discipline (defaults.md:87): "The agent MUST cite the bullet ID (e.g., D-AUTH-1) in spec.md §Assumptions whenever it applies a default from this catalog." Per the same document, a deviation from a catalog default must appear in §Defaults Overridden. Neither is done.

The spec silently downgrades the project's canvas animation performance target by 50% without a recorded justification. This is a constitution Article II violation (uncited deviation from a quantified project standard) and a defaults catalog discipline violation.

**Recommendation:** Either (a) add D-PERF-2 to §Defaults Overridden with the reason ("30fps is the graceful-degradation floor for complex multi-phase canvas animations per D-PERF-2; 60fps target applies only to simpler particle effects"), or (b) raise the spec target to 60fps and rewrite FR-022 and SC-004 accordingly, or (c) amend D-PERF-2 in defaults.md to distinguish complex Easter egg animations from simple particle effects.

---

**Pass 3 findings: 1 (C1)**

---

## Pass 4 — Speculative-Feature Scan

### Finding H5 (HIGH) — Speculative-feature: FR-006 and FR-007 have no motivating acceptance scenario

| Field | Value |
|-------|-------|
| Severity | HIGH |
| Category | Speculative-feature |
| Location | spec.md FR-006 (line 114), FR-007 (line 115), US1 Acceptance Scenarios (lines 28-32) |

spec.md:114 reads: "FR-006: `resume.json` `projects` array MUST contain entries for 'Atlas' (mentioning mesh networking, DIDs, multi-transport) and 'Async Notification Platform' (mentioning NATS JetStream, 1M+ notifications)."

spec.md:115 reads: "FR-007: `resume.json` `basics.summary` MUST be updated to reference the current Adyton role."

US1 has 4 acceptance scenarios (lines 28-32):
- AS-1: CareerMarker properties (name, position, isCurrent, codename, lat).
- AS-2: Detail panel shows summary text + 4 highlights.
- AS-3: Picogrid isCurrent = false.
- AS-4: /briefing shows Adyton as first work entry.

None of these scenarios assert that the `projects` array contains the Atlas or Notification Platform entries, nor that `basics.summary` references Adyton. There is no user-visible outcome in any acceptance scenario, success criterion, or independent test that fails when FR-006 or FR-007 are not implemented. The projects array and basics.summary may be rendered somewhere in the site, but the spec provides no acceptance scenario to verify that rendering.

FR-006 and FR-007 are data requirements without verifiable user outcomes. No test task in tasks.md is linked to FR-006 (T011 is marked [P] and adds the data but T007 tests only the work entry summary, not the projects array). No test task is linked to FR-007 at all.

**Recommendation:** Either (a) add an acceptance scenario to US1 (or US4 for /briefing) that verifies the projects data is visible to the user, or (b) move FR-006 and FR-007 to §Assumptions with the rationale that they are data hygiene tasks with no user-facing test path, or (c) remove them from the spec entirely if no part of the current site renders the projects array or basics.summary to users.

---

**Pass 4 findings: 1 (H5)**

---

## Pass 5 — Test-Coverage Scan

### Finding C2 (CRITICAL) — Test-coverage gap: FR-008, FR-036, MeshNetworkRenderer component (T026, T027, T028) have no test task

| Field | Value |
|-------|-------|
| Severity | CRITICAL |
| Category | Test-coverage gap |
| Location | tasks.md T026 (line 73), T027 (line 74), T028 (line 75), spec.md FR-008 (line 119), FR-036 (line 153) |

tasks.md:73 reads: "T026 [US2] Implement `MeshNetworkRenderer` React component (canvas lifecycle, RAF loop, map.project() reprojection, resize handling, cleanup)."

tasks.md:74 reads: "T027 [US2] Mount `MeshNetworkRenderer` in `src/components/map/MapboxScene.tsx` — add `meshActive` state, M key listener (guarded against input focus), `atlas-mesh-activate`/`deactivate` event listeners."

tasks.md:75 reads: "T028 [US2] Add hidden tactical HUD button for mobile mesh trigger."

None of T026, T027, or T028 is preceded by a "Write test" task. The test tasks in Phase 4 (T014-T022) cover only `meshData.ts`, `meshSimulation.ts`, and `meshSymbols.ts`. No test task exercises:

- The `MeshNetworkRenderer` React component's canvas creation, RAF loop startup, or cleanup (implements FR-021, US2-AS-7).
- The M key guard logic in `MapboxScene.tsx` that is the entire implementation of FR-008 (US2-AS-1 primary trigger).
- The `atlas-mesh-activate` / `atlas-mesh-deactivate` event listener wiring in `MapboxScene.tsx` (implements FR-031, US4-AS-2).
- The mobile HUD button render and tap trigger (implements FR-036, EC-005).

constitution.md:16 reads: "Production code MUST NOT be written before a failing test exists."

Four behaviour-changing implementation tasks have no test task. This violates Article I directly.

**Recommendation:** Add the following test tasks before T026, T027, and T028 respectively:
- "Write test: `MeshNetworkRenderer` mounts a `<canvas>` in the provided container, registers a resize listener, and removes both on unmount."
- "Write test: `MapboxScene` M key listener fires `meshActive=true` when target is not an input, and does NOT fire when target is INPUT/TEXTAREA."
- "Write test: `MapboxScene` renders the mobile HUD button when `isMobile=true`, and the button dispatches `atlas-mesh-activate` on click."

---

### Finding C3 (CRITICAL) — Test-coverage gap: FR-028, FR-033, FR-034 — terminal command wiring, EasterEggType union, useEasterEggs hook (T034-T038) have no test task

| Field | Value |
|-------|-------|
| Severity | CRITICAL |
| Category | Test-coverage gap |
| Location | tasks.md T034 (line 96), T035 (line 97), T036 (line 98), T037 (line 99), T038 (line 100), spec.md FR-028 (line 141), FR-033 (line 150), FR-034 (line 151) |

tasks.md:96-100 lists five implementation tasks (T034-T038) modifying `terminalCommands.ts`, `easterEggs.ts`, `useEasterEggs.ts`, and `HelpOverlay.tsx`. None is preceded by a "Write test" task.

Specific behaviour-changing omissions:
- **T034** adds `atlas` and `mesh` as terminal commands calling `streamBootSequence`. No test verifies that typing `atlas` in the terminal invokes `streamBootSequence`.
- **T035** adds `atlas` to `validEggs` arrays in `trigger`, `scan`, and `unlock-all` commands. No test verifies this registration.
- **T036** adds `'atlas'` to `EasterEggType` union. T003 (types.ts test) does not cover this type — it tests `src/features/mesh/types.ts`, not `src/pages/ExecutiveBrief/types/easterEggs.ts`.
- **T037** adds M key binding to `useEasterEggs.ts`. No test verifies the keybinding fires the atlas egg on the /briefing page.
- **T038** adds M key to `HelpOverlay.tsx`. No test.

spec.md:141: "FR-028: The `help` command output MUST include `atlas` in the command list."
spec.md:151: "FR-034: `'atlas'` MUST be added to the `EasterEggType` union and the `validEggs` arrays."
spec.md:150: "FR-033: The M keyboard shortcut MUST also be registered in the ExecutiveBrief `useEasterEggs.ts` hook."

All three FRs have zero test coverage in tasks.md. Article I is violated for all five implementation tasks.

**Recommendation:** Add test tasks before T034-T038, e.g.:
- "Write test: `terminalCommands.ts` 'atlas' handler calls `streamBootSequence` with the appendLine callback."
- "Write test: `terminalCommands.ts` 'help' output string includes 'atlas'."
- "Write test: `validEggs` arrays in trigger/scan/unlock-all include 'atlas'."

---

### Finding C4 (CRITICAL) — Test-coverage gap: FR-006 and FR-007 have no test task at all

| Field | Value |
|-------|-------|
| Severity | CRITICAL |
| Category | Test-coverage gap |
| Location | tasks.md T010 (line 42), T011 (line 43), spec.md FR-006 (line 114), FR-007 (line 115) |

spec.md:114: "FR-006: `resume.json` `projects` array MUST contain entries for 'Atlas' and 'Async Notification Platform'."
spec.md:115: "FR-007: `resume.json` `basics.summary` MUST be updated to reference the current Adyton role."

tasks.md:43: "T011 [P] [US1] Add Atlas and Async Notification Platform entries to `projects` array."
tasks.md:42: "T010 [US1] Update `basics.summary` to reference current Adyton role."

T011 is a [P] task (parallel, no preceding test required by the [P] convention) but the [P] designation does not exempt it from the Article I test-first requirement — [P] only indicates the task can run in parallel with the test task, not that no test is required. No test task exists for FR-006 (projects array content) or FR-007 (basics.summary content). The existing US1 test tasks (T005, T006, T007) do not cover these fields.

**Recommendation:** Add a test task: "Write test: `resume.json` `projects` array contains entries with keywords 'mesh networking', 'DIDs', 'NATS JetStream', '1M+' and `basics.summary` contains 'Adyton'."

---

**Pass 5 findings: 3 (C2, C3, C4)**

---

## Pass 6 — Edge-Case Completeness Scan

Primary state-mutation flows in this spec:
1. M key press → mesh animation active (canvas created, RAF started, listeners added).
2. Mesh animation phase transitions (state mutation in tickSimulation).
3. `atlas` terminal command → boot sequence streaming.
4. `effectEngine.meshNetwork()` → dispatch CustomEvent.

**Flow 1 — M key / mesh canvas activation:**
- Zero-state: no explicit EC for "M pressed before map is fully initialized / before Mapbox fires 'load' event." plan.md §Failure Modes (line 121-122) handles canvas=null at creation time, but this is not an EC in spec.md §Edge Cases. The spec's EC section covers input focus guard (EC-001), toggle off (EC-002), unmount (EC-003), resize (EC-004), mobile (EC-005), globe zoom (EC-006). **Missing: failure-mode EC for canvas creation returning null** (getContext('2d') = null).
- Boundary: EC-006 (globe view) covers far-out zoom. EC-004 covers resize. OK.
- Concurrency: EC-002 covers rapid double-press. OK.
- Failure: EC-003 covers unmount. Canvas creation failure is NOT in spec §Edge Cases (only in plan.md). MISSING from spec.
- Malicious-input: EC-001 covers input focus guard.

### Finding M1 (MEDIUM) — Edge-case-missing: Canvas creation failure not defined in spec §Edge Cases

| Field | Value |
|-------|-------|
| Severity | MEDIUM |
| Category | Edge-case-missing |
| Location | spec.md §Edge Cases (lines 93-101) |

plan.md:121 addresses this in §Failure Modes: "If `document.createElement('canvas')` or `getContext('2d')` returns null (extremely rare), log a warning and bail." But this failure mode does not appear in spec.md §Edge Cases. The spec is the contract — if it is not in spec.md, it is not a testable requirement, and the plan's mitigation is unverified by any test task.

**Recommendation:** Add "EC-010: `getContext('2d')` returns null. Expected: log a warning via `featureLoggers.career`, do not append canvas to DOM, return without error."

**Flow 2 — tickSimulation:** Covered extensively by T015-T020. Boundary (12 signal pulses) = FR-022. Fading-out = T020. OK.

**Flow 3 — atlas terminal command:** EC-007 (re-invocation) and EC-008 (close during stream) are both defined. OK.

**Flow 4 — effectEngine dispatch:** Small, no state persisted. No EC needed beyond existing cleanup.

**Pass 6 findings: 1 (M1)**

---

## Pass 7 — Independent-Test Integrity Scan

P1 user stories: US1 and US2.

**US1 Independent Test** (spec.md:24): "Visit the site at `/`, observe the map has a green career pin near coordinates (39.5, -98.35). Click it. The career detail panel opens showing company name 'Adyton', position 'Staff Software Engineer', codename 'OPERATION ATLAS', date range '2025 – PRESENT', and at least 4 highlight bullets mentioning Atlas and NATS JetStream."

This is specific, action-driven, and value-delivered. Pass.

**US2 Independent Test** (spec.md:41): "Load the map at `/`, press `M`. Within 2 seconds, canvas-rendered nodes appear in at least 3 distinct geographic regions. Within 10 seconds, moving assets (UAVs/aircraft) are visible and connection lines draw between nodes. Within 30 seconds, the animation completes and no `<canvas>` element with z-index 54 remains in the DOM."

Specific, timeboxed, with DOM-verifiable cleanup condition. Pass.

**US3 (P2) and US4 (P2) Independent Tests** are not subject to Article IV (applies only to P1). Checked for completeness:
- US3 Independent Test (spec.md:63): specific boot sequence content with named strings and 15s bound. Pass.
- US4 Independent Test (spec.md:108-109): "Dispatch `window.dispatchEvent(new CustomEvent('atlas-mesh-activate'))` from console, mesh activates on map." Specific and verifiable.

### Finding C5 (CRITICAL) — Independent-MVP-failure: US3-AS-5 is untestable and contradicts the P2 user story's own Independent Test

| Field | Value |
|-------|-------|
| Severity | CRITICAL |
| Category | Independent-MVP-failure |
| Location | spec.md US3-AS-5 (line 71), spec.md FR-033 (line 150) |

spec.md:71 reads: "US3-AS-5: Given the user presses `M` while on the `/briefing` page (not focused on an input), When the keyboard handler fires, Then **the `atlas` Easter egg triggers**."

This acceptance scenario does not define what "the `atlas` Easter egg triggers" means in a verifiable way. The /briefing page has no Mapbox map, so the mesh canvas animation (US2) cannot render there. The spec does not state whether pressing M on /briefing opens the terminal, starts streaming the boot sequence, or does something else entirely. There is no observable, measurable outcome specified.

spec.md:150 reads: "FR-033: The `M` keyboard shortcut MUST also be registered in the ExecutiveBrief `useEasterEggs.ts` hook, triggering the `atlas` Easter egg type."

"Triggering the `atlas` Easter egg type" is a system-internal event, not a user-visible outcome. A QA engineer reading AS-5 cannot determine what to look at in the browser to pass or fail this scenario.

This is distinct from a P1 Independent-MVP-failure because US3 is P2 — the threshold is not Article IV. However, the finding is CRITICAL under the "Untestable-acceptance" rule (HIGH floor) and the "Independent-MVP-failure" rule (CRITICAL floor) together because AS-5 is a named acceptance scenario required to validate the user story. An untestable acceptance scenario for a P2 story is HIGH; when that acceptance scenario is the sole mechanism verifying a new keyboard shortcut (FR-033) introduced by this feature — and that shortcut has no automated test (see C3) — the combined gap reaches CRITICAL: the behaviour cannot be verified by test, acceptance scenario, or independent test.

### Finding H4 (HIGH) — Untestable-acceptance: US3-AS-5 specifies no observable outcome

This is the same finding as C5, reported here at its floor severity for completeness as an untestable acceptance scenario.

**Recommendation:** Rewrite US3-AS-5 as: "Given the user presses `M` on the `/briefing` page (terminal not focused), When the keyboard handler fires, Then the terminal opens (if not already open) and begins streaming the Atlas boot sequence — specifically, the line 'ATLAS C2 PLATFORM — BOOT SEQUENCE INITIATED' appears within 200ms."

**Pass 7 findings: 2 (C5, H4)**

---

## Pass 8 — Cross-Plugin Contract Scan

No §Cross-Plugin Surfaces section exists in spec.md. This pass does not apply to this spec.

**Pass 8 findings: 0**

---

## Additional Finding — Terminology

### Finding M2 (MEDIUM) — Terminology-drift: `phone` node type declared in Key Entities but absent from FR-011, FR-012, and T021

| Field | Value |
|-------|-------|
| Severity | MEDIUM |
| Category | Terminology-drift |
| Location | spec.md §Key Entities MeshNode definition (line 170), spec.md FR-011 (line 121), spec.md FR-012 (line 122), tasks.md T021 (line 65) |

spec.md:170 reads: "Has a type (ground-station, uav, aircraft, satellite, sensor, **phone**)" — 6 variants.

spec.md:121 reads: "FR-011: Node types MUST include at least: ground-station, uav, aircraft, satellite, and **sensor**." Phone is not in the MUST list.

spec.md:122 reads: "FR-012: Node shapes MUST be inspired by MIL-STD-2525D friendly-unit symbology: ground stations as rectangles, UAVs as chevrons/arrows, aircraft as triangles, satellites as diamonds, sensors as upward-pointing triangles." No shape is defined for `phone`.

plan.md:84 reads: "`type: NodeType` (6 variants)" — acknowledges 6 types.

tasks.md:65 reads: "T021: each `drawGroundStation`, `drawUAV`, `drawAircraft`, `drawSatellite`, `drawSensor` function…" — 5 functions, no `drawPhone`.

The `phone` type is declared in the data model, acknowledged in the plan, but has no required visual representation (FR-012), no MUST presence in the visualization (FR-011), and no test (T021). An implementor who includes a `phone` node with no draw function will hit a runtime error or silent no-op. An implementor who omits `phone` entirely will comply with all FRs and pass all tests.

**Recommendation:** Resolve in one of two ways: (a) remove `phone` from the Key Entities list and the plan's NodeType variants (if phone nodes are not used in `meshData.ts`), or (b) add `phone` to FR-011's MUST list, add a shape rule to FR-012, and add `drawPhone` to T021's test list.

---

## Additional Finding — Low Severity

### Finding L1 (LOW) — Style/wording: EC-001 contains a JavaScript operator-precedence error in its guard pseudocode

| Field | Value |
|-------|-------|
| Severity | LOW |
| Category | Style / wording |
| Location | spec.md EC-001 (line 93) |

spec.md:93 reads: "Guard via `e.target.tagName === 'INPUT' || 'TEXTAREA' || isContentEditable` check."

In JavaScript, this expression evaluates as `(e.target.tagName === 'INPUT') || ('TEXTAREA') || isContentEditable`. The string literal `'TEXTAREA'` is always truthy, so the entire expression always returns `true` — meaning the M key would never trigger the mesh animation regardless of focus state. The spec's own pseudocode defeats the purpose of the guard.

This is a LOW finding because it is in an illustrative comment rather than a normative FR. However, implementation teams have been known to copy pseudocode verbatim from edge case descriptions.

**Recommendation:** Correct to: `e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable`.

---

## Findings by Pass (required summary)

| Pass | Name | Findings | IDs |
|------|------|----------|-----|
| 1 | Vague-adjective scan | 0 | — |
| 2 | Contradiction scan | 3 | H1, H2, H3 |
| 3 | Constitution-violation scan | 1 | C1 |
| 4 | Speculative-feature scan | 1 | H5 |
| 5 | Test-coverage scan | 3 | C2, C3, C4 |
| 6 | Edge-case completeness scan | 1 | M1 |
| 7 | Independent-test integrity scan | 2 | C5, H4 |
| 8 | Cross-plugin contract scan | 0 (N/A — no §Cross-Plugin Surfaces) | — |
| Additional | Terminology drift | 1 | M2 |
| Additional | Style / wording | 1 | L1 |

**Total: 13 findings (5 CRITICAL, 4 HIGH, 2 MEDIUM, 1 LOW, 1 HIGH duplicate of C5)**

---

## Resolution Priority

1. **C1** — Cite or override D-PERF-2 explicitly. One sentence in §Defaults Overridden unblocks this.
2. **C2** — Add three test tasks before T026, T027, T028. Required by Article I.
3. **C3** — Add test tasks before T034-T038. Required by Article I.
4. **C4** — Add one test task for FR-006 and FR-007. Required by Article I.
5. **C5** — Rewrite US3-AS-5 with a specific observable outcome.
6. **H1** — Align mobile node count (FR-014 vs AS-3).
7. **H2** — Align first-line timing (FR-025 vs US3-AS-1).
8. **H3** — Add `fading-out` to FR-013's phase list.
9. **H4** — Resolved by fixing C5.
10. **H5** — Add acceptance scenario for FR-006/FR-007 or demote to assumptions.
11. **M1** — Add EC-010 for canvas creation failure.
12. **M2** — Reconcile phone node type across Key Entities, FR-011, FR-012, T021.
13. **L1** — Fix pseudocode operator precedence in EC-001.

---

## Dispositions

| ID | Severity | Disposition | Resolution |
|----|----------|------------|------------|
| C1 | CRITICAL | ACCEPTED | D-PERF-2 added to spec.md §Defaults Overridden with rationale (30fps graceful-degradation floor for complex multi-phase animation). |
| C2 | CRITICAL | ACCEPTED | Test tasks T022a, T022b, T022c added before T026/T027/T028 in tasks.md. |
| C3 | CRITICAL | ACCEPTED | Test tasks T032a, T032b, T032c, T032d added before T034-T038 in tasks.md. |
| C4 | CRITICAL | ACCEPTED | Test tasks T007a, T007b added before T010/T011 in tasks.md. |
| C5 | CRITICAL | ACCEPTED | US3-AS-5 rewritten: "Then the terminal opens and 'ATLAS C2 PLATFORM — BOOT SEQUENCE INITIATED' appears within 200ms." |
| H1 | HIGH | ACCEPTED | US2-AS-3 updated: "at least 3 mobile nodes" (was 2), matching FR-014. |
| H2 | HIGH | ACCEPTED | FR-025 updated: "The first line MUST appear with 0ms delay (immediately). Subsequent line delays MUST vary between 100ms and 300ms." |
| H3 | HIGH | ACCEPTED | FR-013 updated: "7 distinct phases" including fading-out in the enumerated list. |
| H4 | HIGH | ACCEPTED | Resolved by C5 fix — same finding at floor severity. |
| H5 | HIGH | ACCEPTED | US1-AS-5 and US1-AS-6 added to verify projects array and basics.summary. |
| M1 | MEDIUM | ACCEPTED | EC-010 added: canvas creation failure → log warning, bail, no crash. |
| M2 | MEDIUM | ACCEPTED | FR-011 updated: phone type "defined for future use but NOT required in initial implementation." FR-012 updated: drawPhone MAY be implemented but not required. |
| L1 | LOW | ACCEPTED | EC-001 pseudocode corrected to proper operator precedence. |
