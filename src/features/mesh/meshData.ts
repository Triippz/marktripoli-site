import type { MeshNode, MeshCluster, MeshState, NodeDetail, NodeType } from './types';

let didCounter = 0;
function genDid(): string {
  didCounter++;
  const hex = didCounter.toString(16).padStart(4, '0');
  return `did:mesh:${hex}${Math.random().toString(16).slice(2, 10)}`;
}

const DOMAIN_MAP: Record<NodeType, NodeDetail['domain']> = {
  'ground-station': 'LAND',
  'vehicle': 'LAND',
  'person': 'LAND',
  'phone': 'LAND',
  'sensor': 'LAND',
  'ship': 'SEA',
  'aircraft': 'AIR',
  'uav': 'AIR',
  'satellite': 'SPACE',
};

function makeDetail(type: NodeType, label: string, extra?: Partial<NodeDetail>): NodeDetail {
  return {
    affiliation: 'FRIENDLY',
    domain: DOMAIN_MAP[type],
    status: 'OPERATIONAL',
    did: genDid(),
    description: label,
    ...extra,
  };
}

export function createInitialMeshState(): MeshState {
  didCounter = 0;
  // ══════════════════════════════════════════════════════════════════════════
  // CONUS — Dense tactical + spread across the country
  // ══════════════════════════════════════════════════════════════════════════

  // ── NoVA Dense Tactical (Quantico/Belvoir/Pentagon) ~30 nodes ──────────
  const novaTactical: MeshNode[] = [
    { id: 'nova-gs-quantico', type: 'ground-station', clusterId: 'nova', geo: { lng: -77.32, lat: 38.52 }, label: 'QUANTICO TOC', transport: ['wired', 'wifi', 'lora'], alpha: 0 },
    { id: 'nova-gs-belvoir', type: 'ground-station', clusterId: 'nova', geo: { lng: -77.16, lat: 38.72 }, label: 'FT BELVOIR NOC', transport: ['wired', 'wifi'], alpha: 0 },
    { id: 'nova-gs-pentagon', type: 'ground-station', clusterId: 'nova', geo: { lng: -77.06, lat: 38.87 }, label: 'PENTAGON OPS', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'nova-s1', type: 'sensor', clusterId: 'nova', geo: { lng: -77.30, lat: 38.53 }, label: 'SENSOR-01', transport: ['lora', 'ble'], alpha: 0 },
    { id: 'nova-s2', type: 'sensor', clusterId: 'nova', geo: { lng: -77.28, lat: 38.56 }, label: 'SENSOR-02', transport: ['lora', 'ble'], alpha: 0 },
    { id: 'nova-s3', type: 'sensor', clusterId: 'nova', geo: { lng: -77.18, lat: 38.70 }, label: 'SENSOR-03', transport: ['lora'], alpha: 0 },
    { id: 'nova-s4', type: 'sensor', clusterId: 'nova', geo: { lng: -77.08, lat: 38.85 }, label: 'SENSOR-04', transport: ['lora', 'ble'], alpha: 0 },
    { id: 'nova-s5', type: 'sensor', clusterId: 'nova', geo: { lng: -77.22, lat: 38.62 }, label: 'SENSOR-05', transport: ['lora'], alpha: 0 },
    { id: 'nova-ph1', type: 'phone', clusterId: 'nova', geo: { lng: -77.31, lat: 38.51 }, label: 'HANDSET-01', transport: ['wifi', 'ble'], alpha: 0 },
    { id: 'nova-ph2', type: 'phone', clusterId: 'nova', geo: { lng: -77.29, lat: 38.54 }, label: 'HANDSET-02', transport: ['wifi', 'ble'], alpha: 0 },
    { id: 'nova-ph3', type: 'phone', clusterId: 'nova', geo: { lng: -77.14, lat: 38.71 }, label: 'HANDSET-03', transport: ['ble', 'wifi'], alpha: 0 },
    { id: 'nova-ph4', type: 'phone', clusterId: 'nova', geo: { lng: -77.07, lat: 38.86 }, label: 'HANDSET-04', transport: ['wifi', 'ble'], alpha: 0 },
    { id: 'nova-ph5', type: 'phone', clusterId: 'nova', geo: { lng: -77.25, lat: 38.58 }, label: 'HANDSET-05', transport: ['ble'], alpha: 0 },
    { id: 'nova-ph6', type: 'phone', clusterId: 'nova', geo: { lng: -77.20, lat: 38.65 }, label: 'HANDSET-06', transport: ['wifi', 'ble'], alpha: 0 },
    { id: 'nova-p1', type: 'person', clusterId: 'nova', geo: { lng: -77.33, lat: 38.50 }, label: 'ALPHA-1', transport: ['ble', 'lora'], alpha: 0,
      path: [{ lng: -77.33, lat: 38.50 }, { lng: -77.30, lat: 38.52 }, { lng: -77.31, lat: 38.54 }, { lng: -77.33, lat: 38.50 }], pathT: 0, pathSpeed: 0.000015 },
    { id: 'nova-p2', type: 'person', clusterId: 'nova', geo: { lng: -77.30, lat: 38.55 }, label: 'ALPHA-2', transport: ['ble', 'wifi'], alpha: 0,
      path: [{ lng: -77.30, lat: 38.55 }, { lng: -77.28, lat: 38.57 }, { lng: -77.26, lat: 38.56 }, { lng: -77.30, lat: 38.55 }], pathT: 0, pathSpeed: 0.000012 },
    { id: 'nova-p3', type: 'person', clusterId: 'nova', geo: { lng: -77.15, lat: 38.73 }, label: 'BRAVO-1', transport: ['ble', 'lora'], alpha: 0,
      path: [{ lng: -77.15, lat: 38.73 }, { lng: -77.17, lat: 38.71 }, { lng: -77.14, lat: 38.70 }, { lng: -77.15, lat: 38.73 }], pathT: 0, pathSpeed: 0.000010 },
    { id: 'nova-p4', type: 'person', clusterId: 'nova', geo: { lng: -77.05, lat: 38.88 }, label: 'BRAVO-2', transport: ['ble', 'wifi'], alpha: 0 },
    { id: 'nova-p5', type: 'person', clusterId: 'nova', geo: { lng: -77.24, lat: 38.60 }, label: 'CHARLIE-1', transport: ['ble'], alpha: 0 },
    { id: 'nova-p6', type: 'person', clusterId: 'nova', geo: { lng: -77.19, lat: 38.67 }, label: 'CHARLIE-2', transport: ['ble', 'lora'], alpha: 0 },
    { id: 'nova-v1', type: 'vehicle', clusterId: 'nova', geo: { lng: -77.34, lat: 38.49 }, label: 'VEH-TANGO-01', transport: ['wifi', 'lora'], alpha: 0,
      path: [{ lng: -77.34, lat: 38.49 }, { lng: -77.28, lat: 38.55 }, { lng: -77.20, lat: 38.63 }, { lng: -77.15, lat: 38.70 }, { lng: -77.20, lat: 38.63 }, { lng: -77.28, lat: 38.55 }, { lng: -77.34, lat: 38.49 }], pathT: 0, pathSpeed: 0.000025 },
    { id: 'nova-v2', type: 'vehicle', clusterId: 'nova', geo: { lng: -77.17, lat: 38.69 }, label: 'VEH-TANGO-02', transport: ['wifi', 'lora'], alpha: 0,
      path: [{ lng: -77.17, lat: 38.69 }, { lng: -77.10, lat: 38.80 }, { lng: -77.06, lat: 38.86 }, { lng: -77.10, lat: 38.80 }, { lng: -77.17, lat: 38.69 }], pathT: 0, pathSpeed: 0.000020 },
    { id: 'nova-v3', type: 'vehicle', clusterId: 'nova', geo: { lng: -77.08, lat: 38.84 }, label: 'VEH-TANGO-03', transport: ['lora', 'wifi'], alpha: 0,
      path: [{ lng: -77.08, lat: 38.84 }, { lng: -77.04, lat: 38.88 }, { lng: -77.07, lat: 38.90 }, { lng: -77.04, lat: 38.88 }, { lng: -77.08, lat: 38.84 }], pathT: 0, pathSpeed: 0.000018 },
    { id: 'nova-v4', type: 'vehicle', clusterId: 'nova', geo: { lng: -77.26, lat: 38.57 }, label: 'VEH-TANGO-04', transport: ['wifi'], alpha: 0 },
    { id: 'nova-v5', type: 'vehicle', clusterId: 'nova', geo: { lng: -77.12, lat: 38.76 }, label: 'VEH-TANGO-05', transport: ['lora', 'wifi'], alpha: 0 },
    { id: 'nova-uav1', type: 'uav', clusterId: 'nova', geo: { lng: -77.25, lat: 38.60 }, label: 'RAVEN-01', transport: ['wifi', 'lora'], alpha: 0,
      path: [{ lng: -77.25, lat: 38.60 }, { lng: -77.18, lat: 38.68 }, { lng: -77.10, lat: 38.78 }, { lng: -77.18, lat: 38.68 }, { lng: -77.25, lat: 38.60 }], pathT: 0, pathSpeed: 0.000035 },
    { id: 'nova-uav2', type: 'uav', clusterId: 'nova', geo: { lng: -77.10, lat: 38.82 }, label: 'RAVEN-02', transport: ['wifi'], alpha: 0,
      path: [{ lng: -77.10, lat: 38.82 }, { lng: -77.05, lat: 38.87 }, { lng: -77.08, lat: 38.90 }, { lng: -77.05, lat: 38.87 }, { lng: -77.10, lat: 38.82 }], pathT: 0, pathSpeed: 0.000030 },
  ];

  // ── CONUS Wide — scattered across the US ───────────────────────────────
  const conusWide: MeshNode[] = [
    { id: 'conus-gs-schriever', type: 'ground-station', clusterId: 'conus', geo: { lng: -104.53, lat: 38.80 }, label: 'SCHRIEVER SFB', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'conus-gs-bragg', type: 'ground-station', clusterId: 'conus', geo: { lng: -79.0, lat: 35.14 }, label: 'FT LIBERTY', transport: ['wired', 'wifi', 'lora'], alpha: 0 },
    { id: 'conus-gs-hood', type: 'ground-station', clusterId: 'conus', geo: { lng: -97.78, lat: 31.13 }, label: 'FT CAVAZOS', transport: ['wired', 'wifi'], alpha: 0 },
    { id: 'conus-gs-lewis', type: 'ground-station', clusterId: 'conus', geo: { lng: -122.58, lat: 47.08 }, label: 'JBLM', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'conus-gs-huachuca', type: 'ground-station', clusterId: 'conus', geo: { lng: -110.35, lat: 31.55 }, label: 'FT HUACHUCA', transport: ['wired', 'wifi', 'lora'], alpha: 0 },
    { id: 'conus-gs-meade', type: 'ground-station', clusterId: 'conus', geo: { lng: -76.74, lat: 39.10 }, label: 'NSA / FT MEADE', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'conus-gs-peterson', type: 'ground-station', clusterId: 'conus', geo: { lng: -104.71, lat: 38.82 }, label: 'NORAD', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'conus-gs-pendleton', type: 'ground-station', clusterId: 'conus', geo: { lng: -117.38, lat: 33.22 }, label: 'CAMP PENDLETON', transport: ['wired', 'wifi', 'lora'], alpha: 0 },
    { id: 'conus-s1', type: 'sensor', clusterId: 'conus', geo: { lng: -104.6, lat: 38.75 }, label: 'RADAR-CO-01', transport: ['lora'], alpha: 0 },
    { id: 'conus-s2', type: 'sensor', clusterId: 'conus', geo: { lng: -79.05, lat: 35.10 }, label: 'RADAR-NC-01', transport: ['lora', 'ble'], alpha: 0 },
    { id: 'conus-s3', type: 'sensor', clusterId: 'conus', geo: { lng: -117.40, lat: 33.20 }, label: 'RADAR-CA-01', transport: ['lora'], alpha: 0 },
    { id: 'conus-v1', type: 'vehicle', clusterId: 'conus', geo: { lng: -79.0, lat: 35.14 }, label: 'CONVOY-EAST-01', transport: ['lora', 'wifi'], alpha: 0,
      path: [{ lng: -79.0, lat: 35.14 }, { lng: -76.74, lat: 39.10 }, { lng: -79.0, lat: 35.14 }], pathT: 0, pathSpeed: 0.000008 },
    { id: 'conus-v2', type: 'vehicle', clusterId: 'conus', geo: { lng: -97.78, lat: 31.13 }, label: 'CONVOY-CENT-01', transport: ['lora', 'wifi'], alpha: 0,
      path: [{ lng: -97.78, lat: 31.13 }, { lng: -104.53, lat: 38.80 }, { lng: -97.78, lat: 31.13 }], pathT: 0, pathSpeed: 0.000006 },
    { id: 'conus-ac1', type: 'aircraft', clusterId: 'conus', geo: { lng: -104.53, lat: 38.80 }, label: 'REACH-01', transport: ['satellite', 'wifi'], alpha: 0,
      path: [{ lng: -104.53, lat: 38.80 }, { lng: -97.78, lat: 31.13 }, { lng: -79.0, lat: 35.14 }, { lng: -76.74, lat: 39.10 }, { lng: -104.53, lat: 38.80 }], pathT: 0, pathSpeed: 0.000012 },
    { id: 'conus-uav1', type: 'uav', clusterId: 'conus', geo: { lng: -110.35, lat: 31.55 }, label: 'REAPER-01', transport: ['satellite', 'lora'], alpha: 0,
      path: [{ lng: -110.35, lat: 31.55 }, { lng: -117.38, lat: 33.22 }, { lng: -122.58, lat: 47.08 }, { lng: -117.38, lat: 33.22 }, { lng: -110.35, lat: 31.55 }], pathT: 0, pathSpeed: 0.000008 },
  ];

  // ── Atlantic Fleet — ships at sea ──────────────────────────────────────
  const atlanticFleet: MeshNode[] = [
    { id: 'atl-ship-cvn', type: 'ship', clusterId: 'atlantic', geo: { lng: -65.0, lat: 32.0 }, label: 'USS EISENHOWER', transport: ['satellite', 'wifi'], alpha: 0,
      path: [{ lng: -65.0, lat: 32.0 }, { lng: -55.0, lat: 35.0 }, { lng: -40.0, lat: 38.0 }, { lng: -55.0, lat: 35.0 }, { lng: -65.0, lat: 32.0 }], pathT: 0, pathSpeed: 0.000004 },
    { id: 'atl-ship-ddg1', type: 'ship', clusterId: 'atlantic', geo: { lng: -68.0, lat: 33.0 }, label: 'USS PORTER', transport: ['satellite', 'wifi'], alpha: 0,
      path: [{ lng: -68.0, lat: 33.0 }, { lng: -60.0, lat: 34.0 }, { lng: -52.0, lat: 36.0 }, { lng: -60.0, lat: 34.0 }, { lng: -68.0, lat: 33.0 }], pathT: 0, pathSpeed: 0.000005 },
    { id: 'atl-ship-ddg2', type: 'ship', clusterId: 'atlantic', geo: { lng: -62.0, lat: 30.0 }, label: 'USS MASON', transport: ['satellite', 'wifi'], alpha: 0,
      path: [{ lng: -62.0, lat: 30.0 }, { lng: -58.0, lat: 32.0 }, { lng: -62.0, lat: 30.0 }], pathT: 0, pathSpeed: 0.000003 },
    { id: 'atl-uav1', type: 'uav', clusterId: 'atlantic', geo: { lng: -64.0, lat: 32.5 }, label: 'TRITON-01', transport: ['satellite'], alpha: 0,
      path: [{ lng: -64.0, lat: 32.5 }, { lng: -55.0, lat: 35.5 }, { lng: -45.0, lat: 37.0 }, { lng: -55.0, lat: 35.5 }, { lng: -64.0, lat: 32.5 }], pathT: 0, pathSpeed: 0.000006 },
    { id: 'atl-ac1', type: 'aircraft', clusterId: 'atlantic', geo: { lng: -66.0, lat: 31.5 }, label: 'HAWKEYE-01', transport: ['satellite', 'wifi'], alpha: 0,
      path: [{ lng: -66.0, lat: 31.5 }, { lng: -60.0, lat: 33.0 }, { lng: -66.0, lat: 31.5 }], pathT: 0, pathSpeed: 0.000010 },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // EUCOM — Germany/Poland corridor
  // ══════════════════════════════════════════════════════════════════════════
  const eucom: MeshNode[] = [
    { id: 'eu-gs-ramstein', type: 'ground-station', clusterId: 'eucom', geo: { lng: 7.6, lat: 49.4 }, label: 'RAMSTEIN AB', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'eu-gs-stuttgart', type: 'ground-station', clusterId: 'eucom', geo: { lng: 9.18, lat: 48.78 }, label: 'EUCOM HQ', transport: ['wired', 'wifi'], alpha: 0 },
    { id: 'eu-gs-grafenwoehr', type: 'ground-station', clusterId: 'eucom', geo: { lng: 11.93, lat: 49.69 }, label: 'GRAFENWOEHR', transport: ['wired', 'lora'], alpha: 0 },
    { id: 'eu-gs-poznan', type: 'ground-station', clusterId: 'eucom', geo: { lng: 16.93, lat: 52.41 }, label: 'POZNAN MHQ', transport: ['wired', 'wifi'], alpha: 0 },
    { id: 'eu-s1', type: 'sensor', clusterId: 'eucom', geo: { lng: 7.65, lat: 49.38 }, label: 'SENSOR-DE-01', transport: ['lora', 'ble'], alpha: 0 },
    { id: 'eu-s2', type: 'sensor', clusterId: 'eucom', geo: { lng: 11.95, lat: 49.72 }, label: 'SENSOR-DE-02', transport: ['lora'], alpha: 0 },
    { id: 'eu-s3', type: 'sensor', clusterId: 'eucom', geo: { lng: 16.90, lat: 52.38 }, label: 'SENSOR-PL-01', transport: ['lora', 'ble'], alpha: 0 },
    { id: 'eu-p1', type: 'person', clusterId: 'eucom', geo: { lng: 7.62, lat: 49.42 }, label: 'FOXTROT-1', transport: ['ble', 'wifi'], alpha: 0,
      path: [{ lng: 7.62, lat: 49.42 }, { lng: 7.58, lat: 49.40 }, { lng: 7.62, lat: 49.42 }], pathT: 0, pathSpeed: 0.000010 },
    { id: 'eu-p2', type: 'person', clusterId: 'eucom', geo: { lng: 11.90, lat: 49.68 }, label: 'FOXTROT-2', transport: ['ble', 'lora'], alpha: 0 },
    { id: 'eu-v1', type: 'vehicle', clusterId: 'eucom', geo: { lng: 7.55, lat: 49.43 }, label: 'VEH-ECHO-01', transport: ['wifi', 'lora'], alpha: 0,
      path: [{ lng: 7.55, lat: 49.43 }, { lng: 9.18, lat: 48.78 }, { lng: 11.93, lat: 49.69 }, { lng: 9.18, lat: 48.78 }, { lng: 7.55, lat: 49.43 }], pathT: 0, pathSpeed: 0.000010 },
    { id: 'eu-v2', type: 'vehicle', clusterId: 'eucom', geo: { lng: 11.93, lat: 49.69 }, label: 'VEH-ECHO-02', transport: ['lora', 'wifi'], alpha: 0,
      path: [{ lng: 11.93, lat: 49.69 }, { lng: 16.93, lat: 52.41 }, { lng: 11.93, lat: 49.69 }], pathT: 0, pathSpeed: 0.000008 },
    { id: 'eu-ph1', type: 'phone', clusterId: 'eucom', geo: { lng: 9.15, lat: 48.76 }, label: 'HANDSET-EU-01', transport: ['wifi', 'ble'], alpha: 0 },
    { id: 'eu-ph2', type: 'phone', clusterId: 'eucom', geo: { lng: 16.95, lat: 52.43 }, label: 'HANDSET-EU-02', transport: ['wifi', 'ble'], alpha: 0 },
    { id: 'eu-uav1', type: 'uav', clusterId: 'eucom', geo: { lng: 7.6, lat: 49.4 }, label: 'SCAN-EU-01', transport: ['wifi', 'lora'], alpha: 0,
      path: [{ lng: 7.6, lat: 49.4 }, { lng: 9.18, lat: 48.78 }, { lng: 11.93, lat: 49.69 }, { lng: 16.93, lat: 52.41 }, { lng: 11.93, lat: 49.69 }, { lng: 7.6, lat: 49.4 }], pathT: 0, pathSpeed: 0.000012 },
  ];

  // ── Mediterranean Fleet ────────────────────────────────────────────────
  const medFleet: MeshNode[] = [
    { id: 'med-ship-1', type: 'ship', clusterId: 'med', geo: { lng: 15.0, lat: 36.0 }, label: 'USS TRUMAN', transport: ['satellite', 'wifi'], alpha: 0,
      path: [{ lng: 15.0, lat: 36.0 }, { lng: 20.0, lat: 35.0 }, { lng: 28.0, lat: 34.0 }, { lng: 20.0, lat: 35.0 }, { lng: 15.0, lat: 36.0 }], pathT: 0, pathSpeed: 0.000004 },
    { id: 'med-ship-2', type: 'ship', clusterId: 'med', geo: { lng: 18.0, lat: 35.5 }, label: 'USS ARLEIGH BURKE', transport: ['satellite', 'wifi'], alpha: 0,
      path: [{ lng: 18.0, lat: 35.5 }, { lng: 24.0, lat: 34.5 }, { lng: 18.0, lat: 35.5 }], pathT: 0, pathSpeed: 0.000005 },
    { id: 'med-uav1', type: 'uav', clusterId: 'med', geo: { lng: 16.0, lat: 36.5 }, label: 'TRITON-02', transport: ['satellite'], alpha: 0,
      path: [{ lng: 16.0, lat: 36.5 }, { lng: 25.0, lat: 35.0 }, { lng: 32.0, lat: 34.0 }, { lng: 25.0, lat: 35.0 }, { lng: 16.0, lat: 36.5 }], pathT: 0, pathSpeed: 0.000008 },
    { id: 'med-gs-souda', type: 'ground-station', clusterId: 'med', geo: { lng: 24.07, lat: 35.51 }, label: 'NSA SOUDA BAY', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'med-gs-sigonella', type: 'ground-station', clusterId: 'med', geo: { lng: 14.92, lat: 37.40 }, label: 'NAS SIGONELLA', transport: ['wired', 'satellite'], alpha: 0 },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // CENTCOM — Middle East / Horn of Africa
  // ══════════════════════════════════════════════════════════════════════════
  const centcom: MeshNode[] = [
    { id: 'cc-gs-udeid', type: 'ground-station', clusterId: 'centcom', geo: { lng: 51.32, lat: 25.12 }, label: 'AL UDEID AB', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'cc-gs-arifjan', type: 'ground-station', clusterId: 'centcom', geo: { lng: 48.1, lat: 29.0 }, label: 'CAMP ARIFJAN', transport: ['wired', 'wifi'], alpha: 0 },
    { id: 'cc-gs-djibouti', type: 'ground-station', clusterId: 'centcom', geo: { lng: 43.1, lat: 11.6 }, label: 'CAMP LEMONNIER', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'cc-gs-bahrain', type: 'ground-station', clusterId: 'centcom', geo: { lng: 50.58, lat: 26.23 }, label: 'NSA BAHRAIN', transport: ['wired', 'wifi', 'satellite'], alpha: 0 },
    { id: 'cc-s1', type: 'sensor', clusterId: 'centcom', geo: { lng: 51.35, lat: 25.15 }, label: 'SENSOR-QA-01', transport: ['lora', 'ble'], alpha: 0 },
    { id: 'cc-s2', type: 'sensor', clusterId: 'centcom', geo: { lng: 48.15, lat: 29.05 }, label: 'SENSOR-KW-01', transport: ['lora'], alpha: 0 },
    { id: 'cc-s3', type: 'sensor', clusterId: 'centcom', geo: { lng: 50.60, lat: 26.25 }, label: 'SENSOR-BH-01', transport: ['lora', 'ble'], alpha: 0 },
    { id: 'cc-p1', type: 'person', clusterId: 'centcom', geo: { lng: 51.30, lat: 25.10 }, label: 'GOLF-1', transport: ['ble', 'lora'], alpha: 0,
      path: [{ lng: 51.30, lat: 25.10 }, { lng: 51.34, lat: 25.14 }, { lng: 51.30, lat: 25.10 }], pathT: 0, pathSpeed: 0.000010 },
    { id: 'cc-p2', type: 'person', clusterId: 'centcom', geo: { lng: 48.08, lat: 28.98 }, label: 'GOLF-2', transport: ['ble', 'wifi'], alpha: 0 },
    { id: 'cc-v1', type: 'vehicle', clusterId: 'centcom', geo: { lng: 51.28, lat: 25.08 }, label: 'VEH-HOTEL-01', transport: ['wifi', 'lora'], alpha: 0,
      path: [{ lng: 51.28, lat: 25.08 }, { lng: 50.58, lat: 26.23 }, { lng: 48.1, lat: 29.0 }, { lng: 50.58, lat: 26.23 }, { lng: 51.28, lat: 25.08 }], pathT: 0, pathSpeed: 0.000008 },
    { id: 'cc-ph1', type: 'phone', clusterId: 'centcom', geo: { lng: 48.12, lat: 28.98 }, label: 'HANDSET-CC-01', transport: ['wifi', 'ble'], alpha: 0 },
    { id: 'cc-ph2', type: 'phone', clusterId: 'centcom', geo: { lng: 50.55, lat: 26.20 }, label: 'HANDSET-CC-02', transport: ['wifi', 'ble'], alpha: 0 },
    { id: 'cc-ship-gulf', type: 'ship', clusterId: 'centcom', geo: { lng: 50.5, lat: 26.5 }, label: 'USS GRAVELY', transport: ['satellite', 'wifi'], alpha: 0,
      path: [{ lng: 50.5, lat: 26.5 }, { lng: 52.0, lat: 25.0 }, { lng: 54.0, lat: 24.0 }, { lng: 52.0, lat: 25.0 }, { lng: 50.5, lat: 26.5 }], pathT: 0, pathSpeed: 0.000004 },
    { id: 'cc-uav1', type: 'uav', clusterId: 'centcom', geo: { lng: 51.32, lat: 25.12 }, label: 'REAPER-CC-01', transport: ['satellite', 'lora'], alpha: 0,
      path: [{ lng: 51.32, lat: 25.12 }, { lng: 48.1, lat: 29.0 }, { lng: 43.1, lat: 11.6 }, { lng: 48.1, lat: 29.0 }, { lng: 51.32, lat: 25.12 }], pathT: 0, pathSpeed: 0.000006 },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // INDOPACOM — Pacific
  // ══════════════════════════════════════════════════════════════════════════
  const indopacom: MeshNode[] = [
    { id: 'ip-gs-yokota', type: 'ground-station', clusterId: 'indopacom', geo: { lng: 139.35, lat: 35.75 }, label: 'YOKOTA AB', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'ip-gs-guam', type: 'ground-station', clusterId: 'indopacom', geo: { lng: 144.80, lat: 13.45 }, label: 'ANDERSEN AFB', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'ip-gs-diego', type: 'ground-station', clusterId: 'indopacom', geo: { lng: 72.41, lat: -7.32 }, label: 'DIEGO GARCIA', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'ip-gs-pearl', type: 'ground-station', clusterId: 'indopacom', geo: { lng: -157.95, lat: 21.35 }, label: 'PEARL HARBOR', transport: ['wired', 'satellite'], alpha: 0 },
    { id: 'ip-ship-1', type: 'ship', clusterId: 'indopacom', geo: { lng: 130.0, lat: 30.0 }, label: 'USS RONALD REAGAN', transport: ['satellite', 'wifi'], alpha: 0,
      path: [{ lng: 130.0, lat: 30.0 }, { lng: 140.0, lat: 25.0 }, { lng: 145.0, lat: 15.0 }, { lng: 140.0, lat: 25.0 }, { lng: 130.0, lat: 30.0 }], pathT: 0, pathSpeed: 0.000003 },
    { id: 'ip-ship-2', type: 'ship', clusterId: 'indopacom', geo: { lng: 125.0, lat: 20.0 }, label: 'USS DEWEY', transport: ['satellite', 'wifi'], alpha: 0,
      path: [{ lng: 125.0, lat: 20.0 }, { lng: 130.0, lat: 15.0 }, { lng: 125.0, lat: 20.0 }], pathT: 0, pathSpeed: 0.000004 },
    { id: 'ip-uav1', type: 'uav', clusterId: 'indopacom', geo: { lng: 139.35, lat: 35.75 }, label: 'GLOBAL-HAWK-01', transport: ['satellite'], alpha: 0,
      path: [{ lng: 139.35, lat: 35.75 }, { lng: 144.80, lat: 13.45 }, { lng: 130.0, lat: 25.0 }, { lng: 139.35, lat: 35.75 }], pathT: 0, pathSpeed: 0.000005 },
    { id: 'ip-s1', type: 'sensor', clusterId: 'indopacom', geo: { lng: 139.30, lat: 35.78 }, label: 'SENSOR-JP-01', transport: ['lora'], alpha: 0 },
    { id: 'ip-ph1', type: 'phone', clusterId: 'indopacom', geo: { lng: 144.82, lat: 13.47 }, label: 'HANDSET-GU-01', transport: ['wifi', 'ble'], alpha: 0 },
    { id: 'ip-p1', type: 'person', clusterId: 'indopacom', geo: { lng: 139.38, lat: 35.73 }, label: 'INDIA-1', transport: ['ble', 'wifi'], alpha: 0 },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // Space layer — satellites bridging everything
  // Only these connect the meshes to each other
  // ══════════════════════════════════════════════════════════════════════════
  const satellites: MeshNode[] = [
    { id: 'sat-milstar-1', type: 'satellite', clusterId: null, geo: { lng: -40.0, lat: 52.0 }, label: 'MILSTAR-7', transport: ['satellite'], alpha: 0,
      path: [{ lng: -40.0, lat: 52.0 }, { lng: -10.0, lat: 55.0 }, { lng: 10.0, lat: 50.0 }, { lng: -10.0, lat: 55.0 }, { lng: -40.0, lat: 52.0 }], pathT: 0, pathSpeed: 0.000006 },
    { id: 'sat-aehf-1', type: 'satellite', clusterId: null, geo: { lng: 30.0, lat: 42.0 }, label: 'AEHF-6', transport: ['satellite'], alpha: 0,
      path: [{ lng: 30.0, lat: 42.0 }, { lng: 45.0, lat: 35.0 }, { lng: 55.0, lat: 28.0 }, { lng: 45.0, lat: 35.0 }, { lng: 30.0, lat: 42.0 }], pathT: 0, pathSpeed: 0.000005 },
    { id: 'sat-wgs-1', type: 'satellite', clusterId: null, geo: { lng: -100.0, lat: 48.0 }, label: 'WGS-10', transport: ['satellite'], alpha: 0,
      path: [{ lng: -100.0, lat: 48.0 }, { lng: -80.0, lat: 45.0 }, { lng: -60.0, lat: 42.0 }, { lng: -80.0, lat: 45.0 }, { lng: -100.0, lat: 48.0 }], pathT: 0, pathSpeed: 0.000004 },
    { id: 'sat-muos-1', type: 'satellite', clusterId: null, geo: { lng: 100.0, lat: 40.0 }, label: 'MUOS-5', transport: ['satellite'], alpha: 0,
      path: [{ lng: 100.0, lat: 40.0 }, { lng: 130.0, lat: 35.0 }, { lng: 160.0, lat: 30.0 }, { lng: 130.0, lat: 35.0 }, { lng: 100.0, lat: 40.0 }], pathT: 0, pathSpeed: 0.000004 },
    { id: 'sat-sbirs-1', type: 'satellite', clusterId: null, geo: { lng: -150.0, lat: 45.0 }, label: 'SBIRS-GEO-5', transport: ['satellite'], alpha: 0,
      path: [{ lng: -150.0, lat: 45.0 }, { lng: -160.0, lat: 35.0 }, { lng: -150.0, lat: 45.0 }], pathT: 0, pathSpeed: 0.000003 },
  ];

  // ── Clusters ──────────────────────────────────────────────────────────────
  const clusters: MeshCluster[] = [
    { id: 'nova', name: 'NOVA OPS', center: { lng: -77.15, lat: 38.68 }, nodeIds: novaTactical.map(n => n.id), alpha: 0 },
    { id: 'conus', name: 'CONUS', center: { lng: -98.0, lat: 38.0 }, nodeIds: conusWide.map(n => n.id), alpha: 0 },
    { id: 'atlantic', name: 'ATLANTIC FLEET', center: { lng: -60.0, lat: 33.0 }, nodeIds: atlanticFleet.map(n => n.id), alpha: 0 },
    { id: 'eucom', name: 'EUCOM', center: { lng: 12.0, lat: 50.0 }, nodeIds: eucom.map(n => n.id), alpha: 0 },
    { id: 'med', name: 'MED OPS', center: { lng: 22.0, lat: 36.0 }, nodeIds: medFleet.map(n => n.id), alpha: 0 },
    { id: 'centcom', name: 'CENTCOM', center: { lng: 49.0, lat: 26.0 }, nodeIds: centcom.map(n => n.id), alpha: 0 },
    { id: 'indopacom', name: 'INDOPACOM', center: { lng: 140.0, lat: 25.0 }, nodeIds: indopacom.map(n => n.id), alpha: 0 },
  ];

  const allNodesRaw = [...novaTactical, ...conusWide, ...atlanticFleet, ...eucom, ...medFleet, ...centcom, ...indopacom, ...satellites];

  // Hydrate every node with detail metadata
  const allNodes: MeshNode[] = allNodesRaw.map(n => ({
    ...n,
    detail: (n as any).detail ?? makeDetail(n.type, n.label, {
      callsign: n.label,
      alt: n.type === 'satellite' ? 35786000 : n.type === 'aircraft' ? (8500 + Math.floor(Math.random() * 3500)) : n.type === 'uav' ? (1500 + Math.floor(Math.random() * 3500)) : n.type === 'ship' ? 0 : n.type === 'vehicle' ? (50 + Math.floor(Math.random() * 200)) : n.type === 'person' ? (10 + Math.floor(Math.random() * 100)) : n.type === 'ground-station' ? (100 + Math.floor(Math.random() * 500)) : n.type === 'sensor' ? (20 + Math.floor(Math.random() * 150)) : undefined,
      heading: (n.path && n.path.length > 1) ? Math.floor(Math.random() * 360) : undefined,
      speed: n.type === 'satellite' ? 11068 : n.type === 'aircraft' ? (420 + Math.floor(Math.random() * 130)) : n.type === 'uav' ? (80 + Math.floor(Math.random() * 60)) : n.type === 'ship' ? (12 + Math.floor(Math.random() * 10)) : n.type === 'vehicle' ? (25 + Math.floor(Math.random() * 50)) : n.type === 'person' ? (3 + Math.floor(Math.random() * 4)) : undefined,
      echelon: n.type === 'ground-station' ? 'BATTALION' : n.type === 'ship' ? 'UNIT' : n.type === 'vehicle' ? 'TEAM' : n.type === 'person' ? 'INDIVIDUAL' : undefined,
    }),
  }));

  return {
    phase: 'idle',
    phaseStartTime: 0,
    elapsedMs: 0,
    nodes: allNodes,
    edges: [],
    clusters,
    signalPulses: [],
  };
}
