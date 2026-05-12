# Project Defaults Catalog

**Purpose:** This file is the **only** place the spec-driven workflow is allowed to apply project-wide defaults. If a piece of information is required by the spec template and is not present in either (a) the engineer's input or (b) this catalog, the agent MUST mark it `[NEEDS CLARIFICATION: not in defaults catalog]` rather than choose a value.

**Why:** Per project policy, the engineer fills gaps, not the agent. Silent agent assumptions are forbidden. This catalog makes every default visible, version-controlled, and reviewable. Adding a new default is an explicit edit to this file.

**Created:** 2026-05-11
**Last amended:** 2026-05-11
**Maintainer:** Mark Tripoli — Staff Software Engineer

---

## How to Use

- The agent reads this file at the start of every Specify, Import, or Amend phase.
- Every default the agent applies MUST be cited by section + bullet ID (e.g., `D-AUTH-1`).
- Adding, modifying, or removing a default is an engineer-authored edit to this file. The agent MUST NOT extend the catalog itself.
- When the catalog and the engineer's input conflict, the engineer's input wins; the agent records the conflict in the spec under a `## Defaults Overridden` section.

---

## Authentication & Authorisation

- **D-AUTH-1**: N/A — client-side SPA with no backend authentication.

## Storage & Persistence

- **D-STORE-1**: Resume data is stored as static JSON at `public/resume.json` (JSON Resume schema with `x_*` extensions). No database.
- **D-STORE-2**: Easter egg state, user preferences, and gamification progress are persisted via `localStorage` with `mc-` prefixed keys.
- **D-STORE-3**: Runtime state is managed via Zustand stores (`src/store/missionControlV2.ts`) with `persist` middleware writing to `localStorage` key `mission-control-store`.

## Performance & Scale

- **D-PERF-1**: Initial page load (LCP) target: ≤3 seconds on 4G connection. Client-side SPA — no server-side rendering.
- **D-PERF-2**: Animation frame rate target: 60fps for canvas-based effects; graceful degradation on mobile (reduced or disabled complex animations per `useResponsive` hook).
- **D-PERF-3**: Bundle size: Vite manual chunk splitting into 8 named chunks (vendor-react, vendor-framer, vendor-mapbox, vendor-routing, features-map, features-terminal, features-gamification, features-side-missions). New features SHOULD lazy-import large dependencies.

## Observability

- **D-OBS-1**: Debug logging via `src/utils/debugLogger.ts` using feature-scoped loggers. Controlled by `VITE_DEBUG_LOGS` and `VITE_DEBUG_PERF` env vars. Automatically disabled in production builds.

## Security

- **D-SEC-1**: No secrets in client-side code. The only external API key is `VITE_MAPBOX_ACCESS_TOKEN` loaded from environment variables.
- **D-SEC-2**: No user-submitted data is persisted server-side. Contact forms or user inputs MUST NOT expose PII in client-side storage.

## Data Handling

- **D-DATA-1**: Career data source of truth is `public/resume.json`. The `sites.json` file is legacy and is not the primary data source for the map.
- **D-DATA-2**: Map coordinates: prefer explicit `x_location.geo.{lat, lon}` in resume.json entries. Fallback: `getLocationCoordinates()` from `src/utils/coordinates.ts`. Remote/distributed locations use center of continental US: `{ lat: 39.5, lng: -98.35 }`.

## Testing

- **D-TEST-1**: Vitest with jsdom environment for unit and integration tests. Tests live in `src/**/*.test.{ts,tsx}`.
- **D-TEST-2**: Visual/interactive features (map rendering, animations, Easter eggs) are verified manually in the browser via `npm run dev`. Automated tests cover data transforms, state logic, and service functions.
- **D-TEST-3**: TypeScript strict mode (with `noImplicitAny: false` relaxation). `tsc -b` and `npm run lint` must pass.

## Error Handling & Resilience

- **D-RES-1**: Easter egg effects MUST self-cleanup (remove canvas/DOM elements, cancel animation frames, remove event listeners) after completion or when the triggering component unmounts.
- **D-RES-2**: Missing or invalid data (e.g., bad coordinates, missing logo) MUST be handled gracefully with fallbacks — skip the entry, use defaults, or log a warning. Never crash the app.

## Internationalisation & Accessibility

- **D-I18N-1**: English only (en-US).
- **D-A11Y-1**: Keyboard navigation supported via `useKeyboardNavigation` hook. Skip-navigation link provided. Easter eggs MUST NOT be the only way to access core content.

## Project-Specific

- **D-PROJ-1**: All new UI elements MUST use the Mission Control color palette: `mc-black` (#000), `mc-panel` (#0a0a0a), `mc-green` (#00ff00), `mc-green-glow` (rgba(0,255,0,0.6)), `mc-white` (#e0e0e0), `mc-gray` (#333). Font: JetBrains Mono. Defined in `tailwind.config.js`.
- **D-PROJ-2**: Career markers on the map use `mapboxgl.Marker` (DOM-based) with custom elements. Canvas overlays for animated effects use `z-index` stacking: UXV canvas at 53, mesh/custom at 54, DOM overlays at 57, canvas effects at 58-59.
- **D-PROJ-3**: New Easter eggs follow the existing registration pattern: implement effect function → register in `effectEngine.ts` → add config to `effectConfig.json` → optionally add geofence trigger in `geofences.json` → add keyboard shortcut and terminal command in ExecutiveBrief.
- **D-PROJ-4**: Tactical codenames for career entries are defined in `TACTICAL_CODENAMES` in `src/services/resumeDataService.ts`. Format: `'Company Name': 'OPERATION CODENAME'`.

---

## Removed / Deprecated Defaults

When a default is removed, move it here with a `**Reason:**` line. Do not delete — the historical record matters when reviewing old specs.

- *(empty)*

---

## Catalog Discipline

- The agent MUST cite the bullet ID (e.g., `D-AUTH-1`) in `spec.md §Assumptions` whenever it applies a default from this catalog.
- The agent MUST NOT silently apply a default that is not in this catalog.
- When the catalog itself contains placeholders (`[Default …]` text), the agent MUST treat the placeholder as a `[NEEDS CLARIFICATION]` and flag the spec accordingly.
