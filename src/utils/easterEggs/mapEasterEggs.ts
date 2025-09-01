import type mapboxgl from 'mapbox-gl';

type Options = {
  container?: HTMLElement | null;
  enableRandom?: boolean;
};

type Cleanup = () => void;

export function registerMapEasterEggs(map: mapboxgl.Map, opts: Options = {}) {
  const container = opts.container || map.getContainer();
  const cleanups: Cleanup[] = [];
  let disposed = false;
  let idleSince = Date.now();
  let randomTimer: number | null = null;

  // Subtle console hint
  try {
    console.log('%c[Hint]', 'color:#45ffb0', 'Tactical display supports hidden events. Stay idle to observe…');
  } catch {}

  // Insert an HTML comment node as an easter egg hint
  try {
    const c = document.createComment(' Watch the skies. Idle on the map for anomalies. ');
    container.appendChild(c);
    cleanups.push(() => { try { container.contains(c) && container.removeChild(c); } catch {} });
  } catch {}

  // Track idle
  const markActive = () => { idleSince = Date.now(); };
  const events: (keyof mapboxgl.MapboxEventHandler)[] = ['move', 'zoom', 'drag', 'rotate'];
  events.forEach(ev => map.on(ev as any, markActive));
  cleanups.push(() => { events.forEach(ev => map.off(ev as any, markActive)); });

  // Random engine
  if (opts.enableRandom !== false) {
    randomTimer = window.setInterval(() => {
      if (disposed) return;
      if (Date.now() - idleSince < 10_000) return; // require 10s idle
      // Roll a random effect
      const roll = Math.random();
      if (roll < 0.25) anomalyPing(map); // 25%
      else if (roll < 0.45) ufoBlips(map); // 20%
      else if (roll < 0.60) satelliteStreak(container); // 15%
      else if (roll < 0.70) matrixPulse(map); // 10%
      else if (roll < 0.80) auroraOverlay(container); // 10%
      else if (roll < 0.85) scanlinesOverlay(container, 5000); // 5%
      // else do nothing
    }, 60_000);
    cleanups.push(() => { if (randomTimer) window.clearInterval(randomTimer); });
  }

  // Geofenced events registry (per-region throttling)
  const lastGeo: Record<string, number> = {};
  const throttleMs = 60_000;
  const geofences = [
    { key: 'area51', box: { minLng: -115.95, maxLng: -115.45, minLat: 37.05, maxLat: 37.45 }, action: () => { ufoBlips(map); anomalyPing(map, '#45ffb0'); ufoBeamOnMap(container); } },
    { key: 'roswell', box: { minLng: -104.7, maxLng: -104.3, minLat: 33.2, maxLat: 33.6 }, action: () => { ufoBlips(map); anomalyPing(map, '#45ffb0'); } },
    { key: 'rainier', box: { minLng: -121.95, maxLng: -121.45, minLat: 46.6, maxLat: 47.0 }, action: () => { hikingBurst(container); } },
    { key: 'yosemite', box: { minLng: -119.85, maxLng: -119.25, minLat: 37.6, maxLat: 38.0 }, action: () => { hikingBurst(container); } },
    { key: 'rmnp', box: { minLng: -105.9, maxLng: -105.4, minLat: 40.3, maxLat: 40.6 }, action: () => { hikingBurst(container); pawBurst(container); } },
    { key: 'white-sands', box: { minLng: -106.6, maxLng: -106.1, minLat: 32.6, maxLat: 32.9 }, action: () => { sandDrift(container); anomalyPing(map, '#e6e0c9'); } },
    { key: 'ksc', box: { minLng: -80.8, maxLng: -80.5, minLat: 28.4, maxLat: 28.7 }, action: () => { rocketLaunch(container); satelliteStreak(container); } },
    { key: 'silicon-valley', box: { minLng: -122.3, maxLng: -121.8, minLat: 37.2, maxLat: 37.6 }, action: () => { matrixPulse(map); satelliteStreak(container); } },
    { key: 'dc-pentagon', box: { minLng: -77.12, maxLng: -77.01, minLat: 38.84, maxLat: 38.92 }, action: () => { anomalyPing(map, '#ff4d6d'); scanlinesOverlay(container, 3000); } },
    { key: 'boston', box: { minLng: -71.18, maxLng: -71.03, minLat: 42.32, maxLat: 42.42 }, action: () => { satelliteStreak(container); } },
    // Personal / tech hubs
    { key: 'lancaster', box: { minLng: -76.40, maxLng: -76.20, minLat: 40.00, maxLat: 40.08 }, action: () => { pawBurst(container); anomalyPing(map, '#45ffb0'); } },
    { key: 'philadelphia', box: { minLng: -75.30, maxLng: -75.00, minLat: 39.85, maxLat: 40.10 }, action: () => { satelliteStreak(container); anomalyPing(map, '#00e1ff'); } },
    { key: 'el-segundo', box: { minLng: -118.45, maxLng: -118.32, minLat: 33.88, maxLat: 33.95 }, action: () => { ufoBlips(map); rocketLaunch(container); } },
    { key: 'state-college', box: { minLng: -78.00, maxLng: -77.60, minLat: 40.70, maxLat: 40.90 }, action: () => { graduationBurst(container); anomalyPing(map, '#ffd166'); } },
    { key: 'bletchley-park', box: { minLng: -0.85, maxLng: -0.62, minLat: 51.90, maxLat: 52.05 }, action: () => { matrixPulse(map); scanlinesOverlay(container, 4000); anomalyPing(map, '#00e1ff'); } },
    { key: 'cern', box: { minLng: 5.95, maxLng: 6.20, minLat: 46.15, maxLat: 46.32 }, action: () => { particleRing(container); satelliteStreak(container); } },
    { key: 'starbase', box: { minLng: -97.30, maxLng: -96.90, minLat: 25.90, maxLat: 26.10 }, action: () => { rocketLaunch(container); sandDrift(container); } },
    { key: 'vandenberg', box: { minLng: -120.80, maxLng: -120.40, minLat: 34.50, maxLat: 34.90 }, action: () => { rocketLaunch(container); satelliteStreak(container); } },
    { key: 'jpl-pasadena', box: { minLng: -118.25, maxLng: -118.05, minLat: 34.12, maxLat: 34.25 }, action: () => { rocketLaunch(container); anomalyPing(map, '#ffa94d'); } },
    { key: 'mojave', box: { minLng: -118.25, maxLng: -118.05, minLat: 34.95, maxLat: 35.15 }, action: () => { rocketLaunch(container); sandDrift(container); } },
    // Major cities / tech regions
    { key: 'nyc-midtown', box: { minLng: -74.02, maxLng: -73.95, minLat: 40.70, maxLat: 40.78 }, action: () => { neonSweep(container); scanlinesOverlay(container, 2500); anomalyPing(map, '#00e1ff'); } },
    { key: 'seattle', box: { minLng: -122.45, maxLng: -122.25, minLat: 47.55, maxLat: 47.70 }, action: () => { matrixPulse(map); particleRing(container); } },
    { key: 'austin', box: { minLng: -97.90, maxLng: -97.60, minLat: 30.17, maxLat: 30.42 }, action: () => { rocketLaunch(container); matrixPulse(map); } },
    { key: 'denver', box: { minLng: -105.10, maxLng: -104.75, minLat: 39.60, maxLat: 39.85 }, action: () => { hikingBurst(container); particleRing(container); } },
    { key: 'la-downtown', box: { minLng: -118.30, maxLng: -118.20, minLat: 34.00, maxLat: 34.12 }, action: () => { scanlinesOverlay(container, 2500); neonSweep(container); } },
    { key: 'san-diego', box: { minLng: -117.25, maxLng: -117.05, minLat: 32.65, maxLat: 32.80 }, action: () => { sandDrift(container); ufoBlips(map); } },
    { key: 'houston-jsc', box: { minLng: -95.20, maxLng: -95.00, minLat: 29.50, maxLat: 29.70 }, action: () => { rocketLaunch(container); particleRing(container); } },
    { key: 'norad-cheyenne', box: { minLng: -104.90, maxLng: -104.80, minLat: 38.70, maxLat: 38.76 }, action: () => { radarSweep(container); anomalyPing(map, '#ff4d6d'); } },
    { key: 'langley-afb', box: { minLng: -76.42, maxLng: -76.32, minLat: 37.06, maxLat: 37.12 }, action: () => { radarSweep(container); ufoBlips(map); } },
    { key: 'wright-patterson', box: { minLng: -84.15, maxLng: -84.00, minLat: 39.80, maxLat: 39.90 }, action: () => { anomalyPing(map, '#ffd166'); particleRing(container); } },
    { key: 'palmdale-skunkworks', box: { minLng: -118.20, maxLng: -118.00, minLat: 34.55, maxLat: 34.65 }, action: () => { ufoBlips(map); rocketLaunch(container); } },
    { key: 'pine-gap-au', box: { minLng: 133.67, maxLng: 133.90, minLat: -23.90, maxLat: -23.70 }, action: () => { scanlinesOverlay(container, 3000); anomalyPing(map, '#00e1ff'); } },
    { key: 'stonehenge-uk', box: { minLng: -1.84, maxLng: -1.80, minLat: 51.17, maxLat: 51.20 }, action: () => { particleRing(container); matrixPulse(map); } },
    { key: 'mt-shasta', box: { minLng: -122.35, maxLng: -122.25, minLat: 41.28, maxLat: 41.35 }, action: () => { hikingBurst(container); particleRing(container); } },
    { key: 'sedona-az', box: { minLng: -111.85, maxLng: -111.70, minLat: 34.80, maxLat: 34.95 }, action: () => { particleRing(container); neonSweep(container); } },
    { key: 'nazca-pe', box: { minLng: -75.20, maxLng: -74.90, minLat: -14.90, maxLat: -14.65 }, action: () => { satelliteStreak(container); anomalyPing(map, '#ffd166'); } },
    { key: 'mauna-kea', box: { minLng: -155.50, maxLng: -155.30, minLat: 19.70, maxLat: 19.85 }, action: () => { starTwinkle(container); particleRing(container); } },
    { key: 'reykjavik', box: { minLng: -22.10, maxLng: -21.60, minLat: 64.05, maxLat: 64.20 }, action: () => { auroraOverlay(container); starTwinkle(container); } },
    { key: 'tokyo-akihabara', box: { minLng: 139.76, maxLng: 139.78, minLat: 35.69, maxLat: 35.70 }, action: () => { neonSweep(container); scanlinesOverlay(container, 2500); } },
  ];

  const geoCheck = () => {
    const c = map.getCenter();
    const inBox = (b: any) => c.lng > b.minLng && c.lng < b.maxLng && c.lat > b.minLat && c.lat < b.maxLat;
    geofences.forEach(g => {
      if (!inBox(g.box)) return;
      const last = lastGeo[g.key] || 0;
      if (Date.now() - last < throttleMs) return;
      lastGeo[g.key] = Date.now();
      try { g.action(); } catch {}
    });
  };
  map.on('idle', geoCheck);
  cleanups.push(() => { map.off('idle', geoCheck); });

  return {
    dispose() {
      disposed = true;
      while (cleanups.length) { try { cleanups.pop()!(); } catch {} }
    }
  };
}

// Expose geofence catalog and helpers for terminals
export type Geofence = { key: string; box: { minLng: number; maxLng: number; minLat: number; maxLat: number }; };
export function getGeofences(): Geofence[] {
  return [
    { key: 'area51', box: { minLng: -115.95, maxLng: -115.45, minLat: 37.05, maxLat: 37.45 } },
    { key: 'roswell', box: { minLng: -104.7, maxLng: -104.3, minLat: 33.2, maxLat: 33.6 } },
    { key: 'rainier', box: { minLng: -121.95, maxLng: -121.45, minLat: 46.6, maxLat: 47.0 } },
    { key: 'yosemite', box: { minLng: -119.85, maxLng: -119.25, minLat: 37.6, maxLat: 38.0 } },
    { key: 'rmnp', box: { minLng: -105.9, maxLng: -105.4, minLat: 40.3, maxLat: 40.6 } },
    { key: 'white-sands', box: { minLng: -106.6, maxLng: -106.1, minLat: 32.6, maxLat: 32.9 } },
    { key: 'ksc', box: { minLng: -80.8, maxLng: -80.5, minLat: 28.4, maxLat: 28.7 } },
    { key: 'silicon-valley', box: { minLng: -122.3, maxLng: -121.8, minLat: 37.2, maxLat: 37.6 } },
    { key: 'dc-pentagon', box: { minLng: -77.12, maxLng: -77.01, minLat: 38.84, maxLat: 38.92 } },
    { key: 'boston', box: { minLng: -71.18, maxLng: -71.03, minLat: 42.32, maxLat: 42.42 } },
    { key: 'lancaster', box: { minLng: -76.40, maxLng: -76.20, minLat: 40.00, maxLat: 40.08 } },
    { key: 'philadelphia', box: { minLng: -75.30, maxLng: -75.00, minLat: 39.85, maxLat: 40.10 } },
    { key: 'el-segundo', box: { minLng: -118.45, maxLng: -118.32, minLat: 33.88, maxLat: 33.95 } },
    { key: 'state-college', box: { minLng: -78.00, maxLng: -77.60, minLat: 40.70, maxLat: 40.90 } },
    { key: 'bletchley-park', box: { minLng: -0.85, maxLng: -0.62, minLat: 51.90, maxLat: 52.05 } },
    { key: 'cern', box: { minLng: 5.95, maxLng: 6.20, minLat: 46.15, maxLat: 46.32 } },
    { key: 'starbase', box: { minLng: -97.30, maxLng: -96.90, minLat: 25.90, maxLat: 26.10 } },
    { key: 'vandenberg', box: { minLng: -120.80, maxLng: -120.40, minLat: 34.50, maxLat: 34.90 } },
    { key: 'jpl-pasadena', box: { minLng: -118.25, maxLng: -118.05, minLat: 34.12, maxLat: 34.25 } },
    { key: 'mojave', box: { minLng: -118.25, maxLng: -118.05, minLat: 34.95, maxLat: 35.15 } },
    { key: 'nyc-midtown', box: { minLng: -74.02, maxLng: -73.95, minLat: 40.70, maxLat: 40.78 } },
    { key: 'seattle', box: { minLng: -122.45, maxLng: -122.25, minLat: 47.55, maxLat: 47.70 } },
    { key: 'austin', box: { minLng: -97.90, maxLng: -97.60, minLat: 30.17, maxLat: 30.42 } },
    { key: 'denver', box: { minLng: -105.10, maxLng: -104.75, minLat: 39.60, maxLat: 39.85 } },
    { key: 'la-downtown', box: { minLng: -118.30, maxLng: -118.20, minLat: 34.00, maxLat: 34.12 } },
    { key: 'san-diego', box: { minLng: -117.25, maxLng: -117.05, minLat: 32.65, maxLat: 32.80 } },
    { key: 'houston-jsc', box: { minLng: -95.20, maxLng: -95.00, minLat: 29.50, maxLat: 29.70 } },
    { key: 'norad-cheyenne', box: { minLng: -104.90, maxLng: -104.80, minLat: 38.70, maxLat: 38.76 } },
    { key: 'langley-afb', box: { minLng: -76.42, maxLng: -76.32, minLat: 37.06, maxLat: 37.12 } },
    { key: 'wright-patterson', box: { minLng: -84.15, maxLng: -84.00, minLat: 39.80, maxLat: 39.90 } },
    { key: 'palmdale-skunkworks', box: { minLng: -118.20, maxLng: -118.00, minLat: 34.55, maxLat: 34.65 } },
    { key: 'pine-gap-au', box: { minLng: 133.67, maxLng: 133.90, minLat: -23.90, maxLat: -23.70 } },
    { key: 'stonehenge-uk', box: { minLng: -1.84, maxLng: -1.80, minLat: 51.17, maxLat: 51.20 } },
    { key: 'mt-shasta', box: { minLng: -122.35, maxLng: -122.25, minLat: 41.28, maxLat: 41.35 } },
    { key: 'sedona-az', box: { minLng: -111.85, maxLng: -111.70, minLat: 34.80, maxLat: 34.95 } },
    { key: 'nazca-pe', box: { minLng: -75.20, maxLng: -74.90, minLat: -14.90, maxLat: -14.65 } },
    { key: 'mauna-kea', box: { minLng: -155.50, maxLng: -155.30, minLat: 19.70, maxLat: 19.85 } },
    { key: 'reykjavik', box: { minLng: -22.10, maxLng: -21.60, minLat: 64.05, maxLat: 64.20 } },
    { key: 'tokyo-akihabara', box: { minLng: 139.76, maxLng: 139.78, minLat: 35.69, maxLat: 35.70 } },
  ];
}

export function goToGeofence(map: mapboxgl.Map, key: string, zoom = 9) {
  const g = getGeofences().find(x => x.key === key);
  if (!g) return false;
  // Prefer fitting bounds for reliability
  const bounds = [
    [g.box.minLng, g.box.minLat] as [number, number],
    [g.box.maxLng, g.box.maxLat] as [number, number]
  ];
  try {
    (map as any).fitBounds(bounds as any, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: zoom,
      duration: 1200,
      essential: true
    });
  } catch {
    const lng = (g.box.minLng + g.box.maxLng) / 2;
    const lat = (g.box.minLat + g.box.maxLat) / 2;
    map.flyTo({ center: [lng, lat], zoom, essential: true, duration: 1200 });
  }
  return true;
}

// ————— Effects —————

function ufoBlips(map: mapboxgl.Map) {
  const id = `egg-ufo-${Math.random().toString(36).slice(2)}`;
  const sourceId = `${id}-src`;
  const layerId = `${id}-layer`;
  const center = map.getCenter();
  const bounds = map.getBounds();
  const jitter = (min: number, max: number) => min + Math.random() * (max - min);
  const points = Array.from({ length: 3 + Math.floor(Math.random() * 3) }).map(() => ({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [
        jitter(bounds.getWest(), bounds.getEast()),
        jitter(bounds.getSouth(), bounds.getNorth())
      ]
    }
  }));

  (map as any).addSource(sourceId, { type: 'geojson', data: { type: 'FeatureCollection', features: points } });
  map.addLayer({
    id: layerId,
    type: 'circle',
    source: sourceId,
    paint: {
      'circle-color': '#45ffb0',
      'circle-radius': 4,
      'circle-opacity': 0.0
    }
  } as any);

  let t = 0;
  const iv = window.setInterval(() => {
    t += 0.1;
    const op = Math.sin(t * Math.PI) * 0.8;
    try { map.setPaintProperty(layerId, 'circle-opacity', Math.max(0, op)); } catch {}
    if (t >= 1) {
      window.clearInterval(iv);
      cleanup();
    }
  }, 80);

  const cleanup = () => {
    try { map.removeLayer(layerId); } catch {}
    try { (map as any).removeSource(sourceId); } catch {}
  };
}

function anomalyPing(map: mapboxgl.Map, color = '#45ffb0') {
  const id = `egg-ping-${Math.random().toString(36).slice(2)}`;
  const sourceId = `${id}-src`;
  const layerId = `${id}-layer`;
  const c = map.getCenter();
  const offsetLng = (Math.random() - 0.5) * 0.5; // ~0.5° jitter
  const offsetLat = (Math.random() - 0.5) * 0.3;
  const coord: [number, number] = [c.lng + offsetLng, c.lat + offsetLat];
  (map as any).addSource(sourceId, { type: 'geojson', data: { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: coord } }] } });
  map.addLayer({
    id: layerId,
    type: 'circle',
    source: sourceId,
    paint: {
      'circle-color': color,
      'circle-stroke-color': color,
      'circle-stroke-width': 1,
      'circle-radius': 2,
      'circle-opacity': 0.9
    }
  } as any);

  let r = 2;
  let op = 0.9;
  const iv = window.setInterval(() => {
    r += 2.5;
    op -= 0.08;
    try {
      map.setPaintProperty(layerId, 'circle-radius', r);
      map.setPaintProperty(layerId, 'circle-opacity', Math.max(0, op));
    } catch {}
    if (op <= 0) {
      window.clearInterval(iv);
      try { map.removeLayer(layerId); } catch {}
      try { (map as any).removeSource(sourceId); } catch {}
    }
  }, 60);
}

function satelliteStreak(container: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '59';
  container.appendChild(canvas);

  let raf = 0;
  const ctx = canvas.getContext('2d');
  const start = performance.now();
  const dur = 3500;
  const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
  resize();
  window.addEventListener('resize', resize);

  const render = (ts: number) => {
    if (!ctx) return;
    const t = Math.min(1, (ts - start) / dur);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.85 * (1 - Math.abs(0.5 - t) * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    // Diagonal from left-top offscreen to right-bottom
    const x = -0.2 * canvas.width + t * 1.4 * canvas.width;
    const y = 0.1 * canvas.height + t * 0.8 * canvas.height;
    ctx.beginPath();
    ctx.moveTo(x - 30, y - 15);
    ctx.lineTo(x + 30, y + 15);
    ctx.stroke();
    if (t < 1) raf = requestAnimationFrame(render); else cleanup();
  };
  raf = requestAnimationFrame(render);

  const cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };
}

function matrixPulse(map: mapboxgl.Map) {
  // Boost grid opacity and apply greenish fog briefly
  const restore: (() => void)[] = [];
  try {
    const fog = (map as any).getFog?.();
    restore.push(() => { try { (map as any).setFog?.(fog); } catch {} });
    (map as any).setFog?.({ color: 'rgb(10, 30, 10)', 'horizon-blend': 0.1, range: [-1, 2], 'high-color': 'rgb(30, 150, 80)', 'space-color': 'rgb(0,0,0)' });
  } catch {}
  try {
    const current = map.getPaintProperty('tactical-grid', 'line-opacity');
    restore.push(() => { try { map.setPaintProperty('tactical-grid', 'line-opacity', current); } catch {} });
    map.setPaintProperty('tactical-grid', 'line-opacity', 0.55);
  } catch {}
  setTimeout(() => restore.forEach(fn => fn()), 2500);
}

function auroraOverlay(container: HTMLElement) {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.top = '0';
  div.style.left = '0';
  div.style.right = '0';
  div.style.height = '45%';
  div.style.pointerEvents = 'none';
  div.style.background = 'radial-gradient(ellipse at top, rgba(69,255,176,0.22), rgba(69,255,176,0.08) 60%, rgba(69,255,176,0.0) 75%)';
  div.style.filter = 'blur(0.6px)';
  div.style.zIndex = '57';
  div.style.opacity = '0';
  div.style.transition = 'opacity 500ms ease';
  container.appendChild(div);
  requestAnimationFrame(() => { div.style.opacity = '1'; });
  setTimeout(() => { div.style.opacity = '0'; setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 600); }, 6000 + Math.random() * 2000);
}

function scanlinesOverlay(container: HTMLElement, ms = 5000) {
  const div = document.createElement('div');
  div.className = 'scanlines-overlay';
  container.appendChild(div);
  setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, ms);
}

function hikingBurst(container: HTMLElement) {
  const count = 10 + Math.floor(Math.random() * 10);
  const elems: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'mountain';
    const left = Math.floor(Math.random() * 100); // vw
    const size = 18 + Math.floor(Math.random() * 18); // px
    const dur = 7 + Math.random() * 6; // 7-13s
    const delay = Math.random() * 1.2; // 0-1.2s
    el.style.left = `${left}vw`;
    (el.style as any)['--size'] = `${size}px`;
    (el.style as any)['--dur'] = `${dur}s`;
    (el.style as any)['--delay'] = `${delay}s`;
    el.textContent = '🏔️';
    container.appendChild(el);
    elems.push(el);
  }
  const maxDur = Math.max(...elems.map(e => parseFloat(((e.style as any)['--dur'] || '8s').toString()) + parseFloat(((e.style as any)['--delay'] || '0s').toString())));
  setTimeout(() => { elems.forEach(e => { if (e.parentNode) e.parentNode.removeChild(e); }); }, Math.ceil(maxDur * 1000) + 600);
}

function pawBurst(container: HTMLElement) {
  const count = 16 + Math.floor(Math.random() * 16);
  const elems: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'paw-print';
    const left = Math.floor(Math.random() * 100);
    const size = 14 + Math.floor(Math.random() * 16);
    const dur = 5 + Math.random() * 6;
    const delay = Math.random() * 1.5;
    el.style.left = `${left}vw`;
    (el.style as any)['--size'] = `${size}px`;
    (el.style as any)['--dur'] = `${dur}s`;
    (el.style as any)['--delay'] = `${delay}s`;
    el.textContent = '🐾';
    container.appendChild(el);
    elems.push(el);
  }
  const maxDur = Math.max(...elems.map(e => parseFloat(((e.style as any)['--dur'] || '8s').toString()) + parseFloat(((e.style as any)['--delay'] || '0s').toString())));
  setTimeout(() => { elems.forEach(e => { if (e.parentNode) e.parentNode.removeChild(e); }); }, Math.ceil(maxDur * 1000) + 600);
}

function ufoBeamOnMap(container: HTMLElement) {
  const wrap = document.createElement('div');
  wrap.className = 'ufo-beam-container';
  wrap.style.zIndex = '66';
  wrap.innerHTML = `
    <svg viewBox="0 0 200 100" width="140" height="70" xmlns="http://www.w3.org/2000/svg">
      <ellipse class="ufo-body" cx="100" cy="60" rx="80" ry="18" />
      <ellipse class="ufo-dome" cx="100" cy="45" rx="30" ry="18" />
      <ellipse class="ufo-light" cx="60" cy="60" rx="8" ry="5" />
      <ellipse class="ufo-light" cx="100" cy="60" rx="8" ry="5" />
      <ellipse class="ufo-light" cx="140" cy="60" rx="8" ry="5" />
    </svg>
    <div class="ufo-beam-light"></div>
  `;
  container.appendChild(wrap);
  setTimeout(() => { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 3500);
}

function rocketLaunch(container: HTMLElement) {
  const el = document.createElement('div');
  el.textContent = '🚀';
  el.style.position = 'absolute';
  el.style.bottom = '-40px';
  const left = 20 + Math.random() * 60;
  el.style.left = `${left}vw`;
  el.style.fontSize = '28px';
  el.style.zIndex = '60';
  el.style.pointerEvents = 'none';
  container.appendChild(el);
  const start = performance.now();
  const dur = 3200 + Math.random() * 1000;
  let raf = 0;
  const animate = (ts: number) => {
    const t = Math.min(1, (ts - start) / dur);
    const y = t * (container.clientHeight + 80);
    el.style.transform = `translateY(${-y}px)`;
    // exhaust puff
    if (Math.random() < 0.5) {
      const puff = document.createElement('div');
      puff.textContent = '•';
      puff.style.position = 'absolute';
      puff.style.left = '0';
      puff.style.bottom = '0';
      puff.style.transform = 'translate(-6px, 10px)';
      puff.style.color = 'rgba(255,255,255,0.7)';
      puff.style.fontSize = '10px';
      el.appendChild(puff);
      setTimeout(() => { if (puff.parentNode) puff.parentNode.removeChild(puff); }, 600);
    }
    if (t < 1) raf = requestAnimationFrame(animate); else cleanup();
  };
  raf = requestAnimationFrame(animate);
  const cleanup = () => { cancelAnimationFrame(raf); if (el.parentNode) el.parentNode.removeChild(el); };
}

function sandDrift(container: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '58';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
  resize();
  window.addEventListener('resize', resize);
  const particles = Array.from({ length: 200 }).map(() => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, s: Math.random() * 1.2 + 0.2, v: Math.random() * 0.3 + 0.1 }));
  const start = performance.now();
  const dur = 7000;
  let raf = 0;
  const render = (ts: number) => {
    if (!ctx) return;
    const t = Math.min(1, (ts - start) / dur);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(230,224,201,0.4)';
    particles.forEach(p => {
      p.x += p.v;
      if (p.x > canvas.width) p.x = 0;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    });
    if (t < 1) raf = requestAnimationFrame(render); else cleanup();
  };
  raf = requestAnimationFrame(render);
  const cleanup = () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); };
}

function starTwinkle(container: HTMLElement, ms = 6000) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '58';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
  resize();
  window.addEventListener('resize', resize);
  const stars = Array.from({ length: 120 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.6,
    r: Math.random() * 1.2 + 0.3,
    p: Math.random() * Math.PI * 2
  }));
  const start = performance.now();
  let raf = 0;
  const render = (ts: number) => {
    if (!ctx) return;
    const t = (ts - start) / ms;
    if (t > 1) return cleanup();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const a = 0.4 + 0.6 * Math.abs(Math.sin((ts / 500) + s.p));
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    raf = requestAnimationFrame(render);
  };
  raf = requestAnimationFrame(render);
  const cleanup = () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); };
}

function neonSweep(container: HTMLElement, ms = 2500) {
  const bar = document.createElement('div');
  bar.style.position = 'absolute';
  bar.style.top = '0';
  bar.style.left = '-20%';
  bar.style.width = '20%';
  bar.style.height = '100%';
  bar.style.pointerEvents = 'none';
  bar.style.background = 'linear-gradient(90deg, rgba(0,0,0,0), rgba(69,255,176,0.18), rgba(0,0,0,0))';
  bar.style.filter = 'blur(1px)';
  bar.style.zIndex = '57';
  container.appendChild(bar);
  const start = performance.now();
  let raf = 0;
  const render = (ts: number) => {
    const t = Math.min(1, (ts - start) / ms);
    const x = -20 + t * 140; // -20% to 120%
    bar.style.left = `${x}%`;
    if (t < 1) raf = requestAnimationFrame(render); else cleanup();
  };
  raf = requestAnimationFrame(render);
  const cleanup = () => { cancelAnimationFrame(raf); if (bar.parentNode) bar.parentNode.removeChild(bar); };
}

function graduationBurst(container: HTMLElement) {
  const count = 10 + Math.floor(Math.random() * 10);
  const elems: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'mountain'; // reuse falling animation
    const left = Math.floor(Math.random() * 100);
    const size = 18 + Math.floor(Math.random() * 18);
    const dur = 7 + Math.random() * 6;
    const delay = Math.random() * 1.2;
    el.style.left = `${left}vw`;
    (el.style as any)['--size'] = `${size}px`;
    (el.style as any)['--dur'] = `${dur}s`;
    (el.style as any)['--delay'] = `${delay}s`;
    el.textContent = '🎓';
    container.appendChild(el);
    elems.push(el);
  }
  const maxDur = Math.max(...elems.map(e => parseFloat(((e.style as any)['--dur'] || '8s').toString()) + parseFloat(((e.style as any)['--delay'] || '0s').toString())));
  setTimeout(() => { elems.forEach(e => { if (e.parentNode) e.parentNode.removeChild(e); }); }, Math.ceil(maxDur * 1000) + 600);
}

function particleRing(container: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '58';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
  resize();
  window.addEventListener('resize', resize);
  const start = performance.now();
  const dur = 3000;
  let raf = 0;
  const render = (ts: number) => {
    if (!ctx) return;
    const t = Math.min(1, (ts - start) / dur);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = t * Math.hypot(cx, cy) * 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 225, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (t < 1) raf = requestAnimationFrame(render); else cleanup();
  };
  raf = requestAnimationFrame(render);
  const cleanup = () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); };
}

function radarSweep(container: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '58';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
  resize();
  window.addEventListener('resize', resize);
  const start = performance.now();
  const dur = 4000;
  let raf = 0;
  const render = (ts: number) => {
    if (!ctx) return;
    const t = (ts - start) / dur;
    if (t > 1) return cleanup();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.max(cx, cy) * 1.2;
    const angle = t * Math.PI * 2 * 2; // two sweeps
    const width = Math.PI / 8;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, 'rgba(69,255,176,0.25)');
    grad.addColorStop(1, 'rgba(69,255,176,0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + width);
    ctx.closePath();
    ctx.fill();
    raf = requestAnimationFrame(render);
  };
  raf = requestAnimationFrame(render);
  const cleanup = () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); };
}

function lightningFlash(container: HTMLElement) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '59';
  overlay.style.background = '#ffffff';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 80ms linear';
  container.appendChild(overlay);
  const flash = (delay: number) => setTimeout(() => {
    overlay.style.background = Math.random() > 0.5 ? '#bfe7ff' : '#ffffff';
    overlay.style.opacity = '0.6';
    setTimeout(() => overlay.style.opacity = '0', 100);
  }, delay);
  flash(200);
  flash(600);
  setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 1200);
}
