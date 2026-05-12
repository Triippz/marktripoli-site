import type { MeshState, MeshEdge, MeshPhase } from './types';

// ── Geometry helpers ──────────────────────────────────────────────────────────

function geoDistanceKm(
  lngA: number, latA: number,
  lngB: number, latB: number
): number {
  const dlat = latB - latA;
  const dlng = lngB - lngA;
  const midLat = ((latA + latB) / 2) * (Math.PI / 180);
  return Math.hypot(dlng * Math.cos(midLat), dlat) * 111;
}

function lerpGeo(
  path: Array<{ lng: number; lat: number }>,
  t: number
): { lng: number; lat: number } {
  if (path.length === 0) return { lng: 0, lat: 0 };
  if (path.length === 1) return path[0];

  const tc = Math.max(0, Math.min(1, t));
  const segments = path.length - 1;
  const scaled = tc * segments;
  const segIdx = Math.min(Math.floor(scaled), segments - 1);
  const localT = scaled - segIdx;

  const a = path[segIdx];
  const b = path[segIdx + 1];
  return {
    lng: a.lng + (b.lng - a.lng) * localT,
    lat: a.lat + (b.lat - a.lat) * localT,
  };
}

// ── Phase determination (~2 minute simulation) ───────────────────────────────
// 0-4s:   clusters fade in
// 4-10s:  intra-cluster edges draw
// 10s+:   movers start, keep moving continuously
// 20-35s: backhaul satellites connect clusters
// 35s+:   steady state forever — runs until user toggles off

function determinePhase(elapsedMs: number): MeshPhase {
  if (elapsedMs <= 0) return 'idle';
  if (elapsedMs < 4000) return 'cluster-fade-in';
  if (elapsedMs < 10000) return 'intra-cluster';
  if (elapsedMs < 20000) return 'mobile-assets';
  if (elapsedMs < 35000) return 'satellite-backhaul';
  return 'full-mesh';
}

// ── Phase handlers ────────────────────────────────────────────────────────────

function applyClusterFadeIn(state: MeshState, deltaMs: number): MeshState {
  const fadeRate = deltaMs / 4000;
  const nodes = state.nodes.map(node => {
    if (node.clusterId !== null) {
      return { ...node, alpha: Math.min(1, node.alpha + fadeRate) };
    }
    return node;
  });
  const clusters = state.clusters.map(c => ({
    ...c,
    alpha: Math.min(1, c.alpha + fadeRate),
  }));
  return { ...state, nodes, clusters };
}

function buildIntraClusterEdges(state: MeshState): MeshEdge[] {
  const existingEdgeIds = new Set(state.edges.map(e => e.id));
  const newEdges: MeshEdge[] = [...state.edges];

  for (const cluster of state.clusters) {
    const clusterNodes = state.nodes.filter(n => n.clusterId === cluster.id);

    for (let i = 0; i < clusterNodes.length; i++) {
      for (let j = i + 1; j < clusterNodes.length; j++) {
        const a = clusterNodes[i];
        const b = clusterNodes[j];
        const edgeId = `intra-${a.id}-${b.id}`;
        if (existingEdgeIds.has(edgeId)) continue;

        const dist = geoDistanceKm(a.geo.lng, a.geo.lat, b.geo.lng, b.geo.lat);

        // Tight mesh within dense clusters, wider for spread-out ones
        // nova: ~60km, conus: ~800km between bases, fleets/eucom/centcom/indopacom: ~500km
        const maxDist = cluster.id === 'nova' ? 60
          : cluster.id === 'conus' ? 800
          : 500;
        if (dist <= maxDist) {
          const transport = a.transport.find(t => b.transport.includes(t)) ?? 'wifi';
          newEdges.push({
            id: edgeId,
            fromNodeId: a.id,
            toNodeId: b.id,
            state: 'connected',
            transport,
            alpha: 1,
          });
          existingEdgeIds.add(edgeId);
        }
      }
    }
  }

  return newEdges;
}

function applyMobileAssets(state: MeshState, deltaMs: number): MeshState {
  const nodes = state.nodes.map(node => {
    if (!node.path || node.path.length === 0) return node;

    const speed = node.pathSpeed ?? 0.00005;
    let newT = (node.pathT ?? 0) + speed * deltaMs;
    if (newT > 1) newT = newT % 1;

    const newGeo = lerpGeo(node.path, newT);

    return {
      ...node,
      pathT: newT,
      geo: newGeo,
      alpha: Math.min(1, node.alpha + deltaMs / 2000),
    };
  });

  return { ...state, nodes };
}

// Throttle: only rebuild mover edges every N ms to avoid per-frame O(n²)
let lastMoverEdgeUpdate = 0;
const MOVER_EDGE_INTERVAL = 500;

function updateMovingEdges(state: MeshState): MeshState {
  if (state.elapsedMs - lastMoverEdgeUpdate < MOVER_EDGE_INTERVAL) return state;
  lastMoverEdgeUpdate = state.elapsedMs;

  const movingNodeIds = new Set<string>();
  const movers: typeof state.nodes = [];
  for (let i = 0; i < state.nodes.length; i++) {
    const n = state.nodes[i];
    if (n.path && n.path.length > 0) {
      movingNodeIds.add(n.id);
      if (n.alpha > 0) movers.push(n);
    }
  }

  const staticEdges: MeshEdge[] = [];
  for (let i = 0; i < state.edges.length; i++) {
    const e = state.edges[i];
    if (!movingNodeIds.has(e.fromNodeId) && !movingNodeIds.has(e.toNodeId)) {
      staticEdges.push(e);
    }
  }

  const moverEdges: MeshEdge[] = [];
  const existingIds = new Set(staticEdges.map(e => e.id));

  for (let m = 0; m < movers.length; m++) {
    const mover = movers[m];
    const cluster = mover.clusterId;

    for (let i = 0; i < state.nodes.length; i++) {
      const target = state.nodes[i];
      if (target.id === mover.id || target.alpha <= 0) continue;
      if (cluster !== null && target.clusterId !== null && target.clusterId !== cluster) continue;

      const dist = geoDistanceKm(mover.geo.lng, mover.geo.lat, target.geo.lng, target.geo.lat);
      const maxRange = mover.type === 'satellite' ? 5000 : mover.type === 'uav' ? 80 : 50;

      if (dist <= maxRange) {
        const edgeId = `dyn-${mover.id}-${target.id}`;
        if (existingIds.has(edgeId)) continue;
        const transport = mover.transport.find(t => target.transport.includes(t)) ?? 'wifi';
        moverEdges.push({
          id: edgeId,
          fromNodeId: mover.id,
          toNodeId: target.id,
          state: 'connected',
          transport,
          alpha: 0.8,
        });
        existingIds.add(edgeId);
      }
    }
  }

  return { ...state, edges: [...staticEdges, ...moverEdges] };
}

function applySatelliteBackhaul(state: MeshState): MeshState {
  const existingEdgeIds = new Set(state.edges.map(e => e.id));
  const newEdges: MeshEdge[] = [...state.edges];

  // Connect each satellite to the nearest ground station in 2 different clusters
  const satellites = state.nodes.filter(n => n.type === 'satellite' && n.clusterId === null);
  const groundStations = state.nodes.filter(n => n.type === 'ground-station' && n.clusterId !== null);

  for (const sat of satellites) {
    const byCluster = new Map<string, { id: string; dist: number }>();

    for (const gs of groundStations) {
      const dist = geoDistanceKm(sat.geo.lng, sat.geo.lat, gs.geo.lng, gs.geo.lat);
      const cid = gs.clusterId!;
      const current = byCluster.get(cid);
      if (!current || dist < current.dist) {
        byCluster.set(cid, { id: gs.id, dist });
      }
    }

    // Connect to the nearest GS in each of the 2 closest clusters
    const sorted = [...byCluster.entries()].sort((a, b) => a[1].dist - b[1].dist).slice(0, 2);
    for (const [, { id: gsId }] of sorted) {
      const edgeId = `backhaul-${sat.id}-${gsId}`;
      if (!existingEdgeIds.has(edgeId)) {
        newEdges.push({
          id: edgeId,
          fromNodeId: sat.id,
          toNodeId: gsId,
          state: 'connected',
          transport: 'satellite',
          alpha: 0.6,
          isSatelliteBackhaul: true,
        });
        existingEdgeIds.add(edgeId);
      }
    }
  }

  return { ...state, edges: newEdges };
}

function applyFadingOut(state: MeshState, deltaMs: number): MeshState {
  const fadeRate = deltaMs / 8000;
  const nodes = state.nodes.map(node => ({
    ...node,
    alpha: Math.max(0, node.alpha - fadeRate),
  }));
  const edges = state.edges.map(edge => ({
    ...edge,
    alpha: Math.max(0, edge.alpha - fadeRate),
  }));
  const clusters = state.clusters.map(c => ({
    ...c,
    alpha: Math.max(0, c.alpha - fadeRate),
  }));
  return { ...state, nodes, edges, clusters, signalPulses: [] };
}

// ── Main tick function ────────────────────────────────────────────────────────

export function tickSimulation(state: MeshState, deltaMs: number): MeshState {
  const newElapsed = state.elapsedMs + deltaMs;
  const newPhase = determinePhase(newElapsed);

  let next: MeshState = {
    ...state,
    elapsedMs: newElapsed,
    phase: newPhase,
  };

  switch (newPhase) {
    case 'idle':
      break;

    case 'cluster-fade-in':
      next = applyClusterFadeIn(next, deltaMs);
      break;

    case 'intra-cluster': {
      next = {
        ...next,
        nodes: next.nodes.map(n =>
          n.clusterId !== null ? { ...n, alpha: 1 } : n
        ),
        clusters: next.clusters.map(c => ({ ...c, alpha: 1 })),
      };
      next = { ...next, edges: buildIntraClusterEdges(next) };
      break;
    }

    case 'mobile-assets': {
      if (!next.edges.some(e => e.id.startsWith('intra-'))) {
        next = { ...next, edges: buildIntraClusterEdges(next) };
      }
      next = applyMobileAssets(next, deltaMs);
      next = updateMovingEdges(next);
      break;
    }

    case 'satellite-backhaul': {
      next = applyMobileAssets(next, deltaMs);
      next = updateMovingEdges(next);
      if (!next.edges.some(e => e.isSatelliteBackhaul)) {
        next = applySatelliteBackhaul(next);
      }
      break;
    }

    case 'full-mesh': {
      next = applyMobileAssets(next, deltaMs);
      next = updateMovingEdges(next);
      if (!next.edges.some(e => e.isSatelliteBackhaul)) {
        next = applySatelliteBackhaul(next);
      }
      break;
    }
  }

  return next;
}
