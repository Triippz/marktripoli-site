# Mapbox Configuration

## Setup Instructions

1. **Get a Mapbox Access Token:**
   - Visit [Mapbox Account Page](https://account.mapbox.com/access-tokens/)
   - Create a new token or use an existing one
   - Copy the token

2. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`
   - Replace `VITE_MAPBOX_ACCESS_TOKEN` with your actual token
   - Optionally set `VITE_MAPBOX_STYLE` for custom map styles

3. **Environment File (.env):**
   ```bash
   VITE_MAPBOX_ACCESS_TOKEN=your_actual_token_here
   VITE_MAPBOX_STYLE=mapbox://styles/mapbox/satellite-v9
   ```

## Current Status

- **Demo Token:** The app uses a demo token with limited functionality
- **Environment Ready:** Configuration is set up for production tokens
- **Custom Styles:** Support for custom map styles via environment variables

## Features

- Tactical satellite view with overlay
- Mission site markers with popups
- Flight path animations between career sites
- Coordinate tracking and tactical HUD