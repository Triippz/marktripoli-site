import type mapboxgl from 'mapbox-gl';

/**
 * Map-based effects that operate on Mapbox GL layers
 */

export function ufoBlips(map: mapboxgl.Map) {
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

export function anomalyPing(map: mapboxgl.Map, color = '#45ffb0') {
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

export function matrixPulse(map: mapboxgl.Map) {
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

export const mapEffects = {
  ufoBlips,
  anomalyPing,
  matrixPulse
};