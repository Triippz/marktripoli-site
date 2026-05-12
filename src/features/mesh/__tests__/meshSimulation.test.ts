import { describe, it, expect } from 'vitest';
import { createInitialMeshState } from '../meshData';
import { tickSimulation } from '../meshSimulation';
import type { MeshState } from '../types';

function runToTime(totalMs: number, stepMs: number = 100): MeshState {
  let state = createInitialMeshState();
  const steps = Math.ceil(totalMs / stepMs);
  for (let i = 0; i < steps; i++) {
    const delta = Math.min(stepMs, totalMs - i * stepMs);
    state = tickSimulation(state, delta);
  }
  return state;
}

// T015 — phase transitions (~5 minute timeline)
describe('T015 — tickSimulation phase transitions', () => {
  it('starts in idle', () => {
    expect(createInitialMeshState().phase).toBe('idle');
  });

  it('cluster-fade-in at 100ms', () => {
    expect(runToTime(100).phase).toBe('cluster-fade-in');
  });

  it('intra-cluster after 4s', () => {
    expect(runToTime(5000).phase).toBe('intra-cluster');
  });

  it('mobile-assets after 10s', () => {
    expect(runToTime(12000).phase).toBe('mobile-assets');
  });

  it('satellite-backhaul after 20s', () => {
    expect(runToTime(22000).phase).toBe('satellite-backhaul');
  });

  it('full-mesh after 35s', () => {
    expect(runToTime(36000, 500).phase).toBe('full-mesh');
  });

  it('stays in full-mesh indefinitely (continuous mode)', () => {
    expect(runToTime(600000, 1000).phase).toBe('full-mesh');
  });
});

// T016 — intra-cluster edges
describe('T016 — intra-cluster edges', () => {
  it('adds edges for the nova tactical cluster', () => {
    const state = runToTime(10000);
    const cluster = state.clusters.find(c => c.id === 'nova')!;
    const edges = state.edges.filter(e =>
      cluster.nodeIds.includes(e.fromNodeId) && cluster.nodeIds.includes(e.toNodeId)
    );
    expect(edges.length).toBeGreaterThanOrEqual(3);
  });

  it('adds edges for eucom', () => {
    const state = runToTime(10000);
    const cluster = state.clusters.find(c => c.id === 'eucom')!;
    const edges = state.edges.filter(e =>
      cluster.nodeIds.includes(e.fromNodeId) && cluster.nodeIds.includes(e.toNodeId)
    );
    expect(edges.length).toBeGreaterThanOrEqual(3);
  });

  it('adds edges for centcom', () => {
    const state = runToTime(10000);
    const cluster = state.clusters.find(c => c.id === 'centcom')!;
    const edges = state.edges.filter(e =>
      cluster.nodeIds.includes(e.fromNodeId) && cluster.nodeIds.includes(e.toNodeId)
    );
    expect(edges.length).toBeGreaterThanOrEqual(3);
  });

  it('does NOT create cross-cluster edges during intra-cluster phase', () => {
    const state = runToTime(10000);
    for (const edge of state.edges) {
      if (edge.isSatelliteBackhaul) continue;
      const fromNode = state.nodes.find(n => n.id === edge.fromNodeId);
      const toNode = state.nodes.find(n => n.id === edge.toNodeId);
      if (fromNode?.clusterId && toNode?.clusterId) {
        expect(fromNode.clusterId).toBe(toNode.clusterId);
      }
    }
  });
});

// T017 — movers advance
describe('T017 — mobile-assets pathT advances', () => {
  it('moving nodes have pathT > 0', () => {
    const state = runToTime(15000);
    const movers = state.nodes.filter(n => n.path && n.path.length > 0);
    expect(movers.length).toBeGreaterThan(0);
    expect(movers.some(n => (n.pathT ?? 0) > 0)).toBe(true);
  });
});

// T018 — edges track moving nodes
describe('T018 — edges track movers', () => {
  it('movers within range have connected edges', () => {
    const state = runToTime(40000, 500);
    const movers = state.nodes.filter(n => n.path && n.path.length > 0 && n.alpha > 0);
    for (const mover of movers) {
      const moverEdges = state.edges.filter(e =>
        e.fromNodeId === mover.id || e.toNodeId === mover.id
      );
      if (moverEdges.length > 0) {
        expect(moverEdges[0].state).toBe('connected');
      }
    }
  });
});

// T019 — no signal pulses
describe('T019 — no signal pulses', () => {
  it('signal pulses stay empty', () => {
    expect(runToTime(50000, 500).signalPulses.length).toBe(0);
  });
});

// T020 — continuous mode: nodes stay visible
describe('T020 — continuous mode', () => {
  it('all cluster node alphas are 1 after warmup', () => {
    const state = runToTime(60000, 500);
    const clusterNodes = state.nodes.filter(n => n.clusterId !== null && !n.path);
    for (const node of clusterNodes) {
      expect(node.alpha).toBe(1);
    }
  });

  it('never enters fading-out phase', () => {
    const state = runToTime(600000, 1000);
    expect(state.phase).not.toBe('fading-out');
  });
});

// Backhaul — sparse satellite links
describe('satellite backhaul is sparse', () => {
  it('creates satellite backhaul edges', () => {
    const state = runToTime(40000, 500);
    const backhaulEdges = state.edges.filter(e => e.isSatelliteBackhaul);
    expect(backhaulEdges.length).toBeGreaterThan(0);
  });

  it('backhaul edges connect satellites to ground stations', () => {
    const state = runToTime(40000, 500);
    const backhaulEdges = state.edges.filter(e => e.isSatelliteBackhaul);
    for (const edge of backhaulEdges) {
      const fromNode = state.nodes.find(n => n.id === edge.fromNodeId);
      const toNode = state.nodes.find(n => n.id === edge.toNodeId);
      const hasSat = fromNode?.type === 'satellite' || toNode?.type === 'satellite';
      const hasGS = fromNode?.type === 'ground-station' || toNode?.type === 'ground-station';
      expect(hasSat).toBe(true);
      expect(hasGS).toBe(true);
    }
  });
});
