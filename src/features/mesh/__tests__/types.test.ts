import { describe, it, expect } from 'vitest';
import type {
  NodeType,
  TransportType,
  EdgeState,
  MeshPhase,
  MeshNode,
  MeshEdge,
  MeshCluster,
  SignalPulse,
  MeshState,
  BootLine,
} from '../types';

describe('Mesh types', () => {
  it('NodeType accepts all 8 variants', () => {
    const types: NodeType[] = ['ground-station', 'uav', 'aircraft', 'satellite', 'sensor', 'phone', 'person', 'vehicle'];
    expect(types).toHaveLength(8);
  });

  it('TransportType accepts all 5 variants', () => {
    const types: TransportType[] = ['wifi', 'ble', 'lora', 'satellite', 'wired'];
    expect(types).toHaveLength(5);
  });

  it('EdgeState accepts all 3 variants', () => {
    const states: EdgeState[] = ['discovering', 'handshaking', 'connected'];
    expect(states).toHaveLength(3);
  });

  it('MeshPhase accepts all 8 variants including idle and fading-out', () => {
    const phases: MeshPhase[] = [
      'idle',
      'cluster-fade-in',
      'intra-cluster',
      'mobile-assets',
      'dynamic-discovery',
      'satellite-backhaul',
      'signal-propagation',
      'full-mesh',
      'fading-out',
    ];
    expect(phases).toHaveLength(9);
  });

  it('MeshNode has required fields', () => {
    const node: MeshNode = {
      id: 'test-node',
      type: 'ground-station',
      clusterId: 'us',
      geo: { lng: -98.5, lat: 39.5 },
      label: 'GS-01',
      transport: ['wifi', 'ble'],
      alpha: 1,
    };
    expect(node.id).toBe('test-node');
    expect(node.type).toBe('ground-station');
    expect(node.geo.lng).toBe(-98.5);
  });

  it('MeshNode supports mobile node fields', () => {
    const mobile: MeshNode = {
      id: 'uav-1',
      type: 'uav',
      clusterId: null,
      geo: { lng: -80, lat: 35 },
      label: 'UAV-01',
      transport: ['wifi'],
      alpha: 1,
      path: [
        { lng: -80, lat: 35 },
        { lng: -10, lat: 48 },
      ],
      pathT: 0,
      pathSpeed: 0.5,
    };
    expect(mobile.path).toHaveLength(2);
    expect(mobile.pathT).toBe(0);
    expect(mobile.pathSpeed).toBe(0.5);
  });

  it('MeshEdge has required fields', () => {
    const edge: MeshEdge = {
      id: 'edge-1',
      fromNodeId: 'node-a',
      toNodeId: 'node-b',
      state: 'connected',
      transport: 'wifi',
      alpha: 1,
    };
    expect(edge.state).toBe('connected');
    expect(edge.transport).toBe('wifi');
  });

  it('MeshEdge supports satellite backhaul flag', () => {
    const edge: MeshEdge = {
      id: 'sat-edge',
      fromNodeId: 'sat-1',
      toNodeId: 'gs-1',
      state: 'connected',
      transport: 'satellite',
      alpha: 0.8,
      isSatelliteBackhaul: true,
    };
    expect(edge.isSatelliteBackhaul).toBe(true);
  });

  it('MeshCluster has required fields', () => {
    const cluster: MeshCluster = {
      id: 'us',
      name: 'Continental US',
      center: { lng: -98.5, lat: 39.5 },
      nodeIds: ['gs-1', 'gs-2'],
      alpha: 1,
    };
    expect(cluster.nodeIds).toHaveLength(2);
  });

  it('SignalPulse has required fields', () => {
    const pulse: SignalPulse = {
      id: 'pulse-1',
      edgeId: 'edge-1',
      t: 0.5,
      alpha: 1,
    };
    expect(pulse.t).toBe(0.5);
  });

  it('MeshState has required fields', () => {
    const state: MeshState = {
      phase: 'idle',
      phaseStartTime: 0,
      elapsedMs: 0,
      nodes: [],
      edges: [],
      clusters: [],
      signalPulses: [],
    };
    expect(state.phase).toBe('idle');
    expect(state.nodes).toEqual([]);
  });

  it('BootLine has required fields', () => {
    const line: BootLine = {
      text: 'ATLAS BOOT',
      delayMs: 150,
    };
    expect(line.text).toBe('ATLAS BOOT');
    expect(line.delayMs).toBe(150);
  });
});
