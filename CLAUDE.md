# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**marktripoli-site** is a React + TypeScript + Vite personal website project that implements an interactive Mission Control-themed experience. The site presents career information through a command-and-control (C2) console metaphor with a map interface, terminal interactions, and immersive animations.

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# TypeScript build check
tsc -b

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture & Design

### Core Concept
The website simulates a Mission Control interface where:
- **Map is the hub**: Interactive globe/map showing "mission sites" (jobs, projects, hobbies)
- **Terminal/Dossier system**: Clicking sites opens terminal overlays with typewriter animations
- **C2 theme**: Black/white/neon green color scheme with military-style interactions
- **Gamification**: Easter eggs, rank system, interactive commands

### Key Technical Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (planned) with custom CSS tokens
- **Map**: Mapbox GL JS for interactive globe/map
- **State**: Zustand for global state + URL state for deep linking
- **Animations**: Framer Motion + CSS transforms
- **Content**: Local JSON/MD files for mission sites and profiles

### Component Architecture
```
App
├── MapScene (Mapbox wrapper)
│   ├── MissionPin
│   ├── FlightPath  
│   └── RadarSweep
├── HUD (status lights, telemetry ticker)
├── Router
│   ├── Terminal (typewriter, command interface)
│   │   ├── Dossier (briefing/logs/media)
│   │   └── TaskingOrders (form + animations)
│   ├── SideMissions/* (Gaming, K9, Trails, Electronics, Aliens)
│   └── DebriefForm (contact form)
```

### Data Model
Mission sites are structured as JSON with:
- `type`: "job", "project", "hobby"  
- `hq`: lat/lng coordinates for map placement
- `briefing`: Summary text
- `deploymentLogs`: Achievement bullets
- `afterAction`: Lessons learned
- `media`: Image/link arrays

### Planned Features
- Executive briefing shortcut (`/briefing`) for non-interactive overview
- Unique engagement sequences per job site (missiles, drones, etc.)
- Interactive terminal commands (`engage <target>`, `deploy uas`, etc.)
- Sound effects (toggleable)
- Mobile-responsive with reduced effects

## Development Notes

- Currently has basic Vite+React scaffold - main implementation pending
- No testing framework configured yet
- Uses TypeScript with composite project references
- ESLint configured with React-specific rules
- Design document contains comprehensive technical specifications and wireframes

## File Structure

```
src/
├── App.tsx          # Main app component (currently Vite default)
├── main.tsx         # React app entry point
└── vite-env.d.ts    # Vite type declarations

public/              # Static assets
data/                # Mission site JSON files (planned)
```