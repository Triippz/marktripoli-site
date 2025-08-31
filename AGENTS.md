# Repository Guidelines

## Project Structure & Module Organization
- `src/`: Application code. Key areas: `components/` (UI), `store/` (Zustand slices), `utils/`, `hooks/`, `styles/`, `data/`, `types/`. Entry: `main.tsx`, root app: `App.tsx`.
- `public/`: Static assets served as-is.
- `dist/`: Build output (do not edit/commit).
- Config: `vite.config.ts`, `tailwind.config.js`, `eslint.config.js`, `tsconfig*.json`.
- Maps: see `README-MAPBOX.md`; env keys live in `.env`.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server with HMR.
- `npm run build`: Type-check (`tsc -b`) and produce optimized build in `dist/`.
- `npm run preview`: Serve the production build locally for QA.
- `npm run lint`: Run ESLint (TS + React Hooks rules).
- `npm run build:analyze`: Build with bundle stats; outputs `dist/stats.html`.
- `npm run perf:analyze`: Build + open `dist/stats.html` in your browser.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; keep lines focused and readable.
- TypeScript-first. React components: PascalCase files in `components/` (e.g., `MapboxScene.tsx`). Hooks: `useX.ts` in `hooks/`. Zustand slices: `src/store/slices/*Slice.ts`.
- Prefer Tailwind utility classes; put global or responsive tweaks in `styles/`.
- Lint before pushing: `npm run lint`; fix warnings or explain deviations in PR.

## Testing Guidelines
- No automated tests configured yet. For new code, add Vitest + React Testing Library where helpful; colocate as `*.test.ts(x)`.
- Minimum QA for every change: type-check clean, no console errors, key routes render, and interactive components behave in `npm run preview`.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits (e.g., `feat: add Mapbox globe`, `fix: stabilize boot sequence`). Keep changes scoped.
- PRs: include clear description, linked issue (if any), reproduction steps, screenshots for UI, and notes on env needs (e.g., `VITE_MAPBOX_ACCESS_TOKEN`).
- Update docs when changing env, scripts, or architecture; avoid committing `.env`/secrets.

## Security & Configuration Tips
- Copy `.env.example` to `.env` and set `VITE_MAPBOX_ACCESS_TOKEN` (and optional `VITE_MAPBOX_STYLE`). Do not commit `.env`.
- Use least-privilege tokens and rotate if exposed; check `.gitignore` covers secrets.
