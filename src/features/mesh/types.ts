export type NodeType = 'ground-station' | 'uav' | 'aircraft' | 'satellite' | 'sensor' | 'phone' | 'person' | 'vehicle' | 'ship';
export type TransportType = 'wifi' | 'ble' | 'lora' | 'satellite' | 'wired';
export type EdgeState = 'discovering' | 'handshaking' | 'connected';
export type MeshPhase =
  | 'idle'
  | 'cluster-fade-in'
  | 'intra-cluster'
  | 'mobile-assets'
  | 'dynamic-discovery'
  | 'satellite-backhaul'
  | 'signal-propagation'
  | 'full-mesh'
  | 'fading-out';

export interface NodeDetail {
  callsign?: string;
  affiliation: 'FRIENDLY';
  domain: 'LAND' | 'SEA' | 'AIR' | 'SPACE' | 'CYBER';
  echelon?: string;
  alt?: number;
  heading?: number;
  speed?: number;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  did?: string;
  description: string;
}

export interface MeshNode {
  id: string;
  type: NodeType;
  clusterId: string | null;
  geo: { lng: number; lat: number };
  label: string;
  transport: TransportType[];
  alpha: number;
  path?: Array<{ lng: number; lat: number }>;
  pathT?: number;
  pathSpeed?: number;
  detail: NodeDetail;
}

export interface MeshEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  state: EdgeState;
  transport: TransportType;
  alpha: number;
  pulseOffset?: number;
  isSatelliteBackhaul?: boolean;
}

export interface MeshCluster {
  id: string;
  name: string;
  center: { lng: number; lat: number };
  nodeIds: string[];
  alpha: number;
}

export interface SignalPulse {
  id: string;
  edgeId: string;
  t: number;
  alpha: number;
}

export interface MeshState {
  phase: MeshPhase;
  phaseStartTime: number;
  elapsedMs: number;
  nodes: MeshNode[];
  edges: MeshEdge[];
  clusters: MeshCluster[];
  signalPulses: SignalPulse[];
}

export interface BootLine {
  text: string;
  delayMs: number;
}
