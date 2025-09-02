import type { Map as MapboxMap } from 'mapbox-gl';
import { getFullGeofences, isInGeofence } from './geofenceUtils';
import { executeEffect, getRandomEffect, getEffectConfig } from './effectEngine';

type Options = {
  container?: HTMLElement | null;
  enableRandom?: boolean;
};

type Cleanup = () => void;

export function registerMapEasterEggs(map: MapboxMap, opts: Options = {}) {
  const container = opts.container || map.getContainer();
  const cleanups: Cleanup[] = [];
  let disposed = false;
  let idleSince = Date.now();
  let randomTimer: number | null = null;
  const config = getEffectConfig();
  const geofences = getFullGeofences();

  // Subtle console hint
  try {
    console.log('%c[Hint]', 'color:#45ffb0', 'Tactical display supports hidden events. Stay idle to observe…');
  } catch {
    // Console may not be available in all environments
  }

  // Insert an HTML comment node as an easter egg hint
  try {
    const c = document.createComment(' Watch the skies. Idle on the map for anomalies. ');
    container.appendChild(c);
    cleanups.push(() => { 
      try { 
        if (container.contains(c)) {
          container.removeChild(c);
        }
      } catch {
        // Cleanup may fail if DOM is already cleaned up
      }
    });
  } catch {
    // DOM operations may fail in some environments
  }

  // Track idle
  const markActive = () => { idleSince = Date.now(); };
  const events = ['move', 'zoom', 'drag', 'rotate'];
  events.forEach(ev => map.on(ev, markActive));
  cleanups.push(() => { events.forEach(ev => map.off(ev, markActive)); });

  // Random engine
  if (opts.enableRandom !== false) {
    randomTimer = window.setInterval(() => {
      if (disposed) return;
      if (Date.now() - idleSince < config.timing.idleTimeMs) return;
      
      const effectName = getRandomEffect();
      if (effectName) {
        const target = effectName === 'anomalyPing' || effectName === 'ufoBlips' || effectName === 'matrixPulse' ? map : container;
        executeEffect(effectName, target);
      }
    }, config.timing.randomIntervalMs);
    cleanups.push(() => { if (randomTimer) window.clearInterval(randomTimer); });
  }

  // Geofenced events registry (per-region throttling)
  const lastGeo: Record<string, number> = {};
  const throttleMs = config.timing.throttleMs;

  const geoCheck = () => {
    const c = map.getCenter();
    geofences.forEach(g => {
      if (!isInGeofence(c.lng, c.lat, g.box)) return;
      const last = lastGeo[g.key] || 0;
      if (Date.now() - last < throttleMs) return;
      lastGeo[g.key] = Date.now();
      
      // Execute all effects for this geofence
      g.effects.forEach(effectName => {
        try {
          const target = ['anomalyPing', 'ufoBlips', 'matrixPulse'].includes(effectName) ? map : container;
          const color = g.colors.length > 0 ? g.colors[0] : undefined;
          if (color && effectName === 'anomalyPing') {
            executeEffect(effectName, target, color);
          } else {
            executeEffect(effectName, target);
          }
        } catch {
          // Effect execution may fail, continue with others
        }
      });
    });
  };
  map.on('idle', geoCheck);
  cleanups.push(() => { map.off('idle', geoCheck); });

  return {
    dispose() {
      disposed = true;
      while (cleanups.length) { 
        try { 
          const cleanup = cleanups.pop();
          if (cleanup) cleanup();
        } catch {
          // Cleanup function may fail, continue with others
        }
      }
    }
  };
}

// Re-export utilities for backwards compatibility
export { getGeofences, goToGeofence } from './geofenceUtils';
export type { SimpleGeofence as Geofence } from './geofenceUtils';

// All effects are now in separate modules for better organization
