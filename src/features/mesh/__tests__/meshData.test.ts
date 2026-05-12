import { describe, it, expect } from 'vitest';
import { createInitialMeshState } from '../meshData';

describe('createInitialMeshState — T014', () => {
  it('returns a state with at least 80 nodes', () => {
    const state = createInitialMeshState();
    expect(state.nodes.length).toBeGreaterThanOrEqual(80);
  });

  it('has 7 clusters', () => {
    const state = createInitialMeshState();
    expect(state.clusters).toHaveLength(7);
  });

  it('clusters span CONUS, Atlantic, Europe, Med, CENTCOM, INDOPACOM', () => {
    const state = createInitialMeshState();
    const ids = state.clusters.map(c => c.id).sort();
    expect(ids).toEqual(['atlantic', 'centcom', 'conus', 'eucom', 'indopacom', 'med', 'nova']);
  });

  it('all nodes start with alpha 0', () => {
    const state = createInitialMeshState();
    for (const node of state.nodes) {
      expect(node.alpha).toBe(0);
    }
  });

  it('phase starts as idle', () => {
    expect(createInitialMeshState().phase).toBe('idle');
  });

  it('nova tactical cluster has at least 25 nodes (dense)', () => {
    const state = createInitialMeshState();
    const cluster = state.clusters.find(c => c.id === 'nova');
    expect(cluster!.nodeIds.length).toBeGreaterThanOrEqual(25);
  });

  it('conus cluster has bases spread across the US', () => {
    const state = createInitialMeshState();
    const cluster = state.clusters.find(c => c.id === 'conus');
    expect(cluster!.nodeIds.length).toBeGreaterThanOrEqual(10);
  });

  it('has ships in atlantic and med clusters', () => {
    const state = createInitialMeshState();
    const ships = state.nodes.filter(n => n.type === 'ship');
    expect(ships.length).toBeGreaterThanOrEqual(5);
    const clusterIds = new Set(ships.map(n => n.clusterId));
    expect(clusterIds.has('atlantic')).toBe(true);
  });

  it('has satellites with no cluster (backhaul only)', () => {
    const state = createInitialMeshState();
    const sats = state.nodes.filter(n => n.type === 'satellite' && n.clusterId === null);
    expect(sats.length).toBeGreaterThanOrEqual(4);
    for (const sat of sats) {
      expect(sat.path).toBeDefined();
      expect(sat.path!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('has movers within clusters', () => {
    const state = createInitialMeshState();
    const movers = state.nodes.filter(n => n.clusterId !== null && n.path && n.path.length > 0);
    expect(movers.length).toBeGreaterThanOrEqual(15);
  });

  it('has nodes in the Pacific (INDOPACOM)', () => {
    const state = createInitialMeshState();
    const cluster = state.clusters.find(c => c.id === 'indopacom');
    expect(cluster!.nodeIds.length).toBeGreaterThanOrEqual(5);
  });

  it('starts with no edges', () => {
    expect(createInitialMeshState().edges).toHaveLength(0);
  });

  it('starts with no signal pulses', () => {
    expect(createInitialMeshState().signalPulses).toHaveLength(0);
  });
});
