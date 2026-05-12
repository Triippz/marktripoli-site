import type { BootLine } from './types';

export type { BootLine };

export const ATLAS_BOOT_SEQUENCE: BootLine[] = [
  { text: 'ATLAS C2 PLATFORM — BOOT SEQUENCE INITIATED', delayMs: 0 },
  { text: '=========================================', delayMs: 150 },
  { text: '[IDENTITY] Generating Decentralized Identity (DID)...', delayMs: 200 },
  { text: '[IDENTITY] DID:mesh:a7f3c9e2b1d4... OK', delayMs: 150 },
  { text: '[IDENTITY] Self-sovereign key material provisioned — SECP256K1', delayMs: 150 },
  { text: '[TRANSPORT] Probing available transports...', delayMs: 200 },
  { text: '[TRANSPORT] BLE interface detected (RSSI: -42 dBm) — READY', delayMs: 200 },
  { text: '[TRANSPORT] WiFi interface detected (2.4/5GHz) — READY', delayMs: 200 },
  { text: '[TRANSPORT] LoRa radio detected (868 MHz) — READY', delayMs: 200 },
  { text: '[TRANSPORT] Satellite uplink... SEARCHING...', delayMs: 800 },
  { text: '[TRANSPORT] Satellite uplink acquired (LEO — Az: 142° El: 33°) — READY', delayMs: 200 },
  { text: '[PEER] Initiating peer discovery across transport layers...', delayMs: 250 },
  { text: '[PEER] BLE: found 2 peers within 10m', delayMs: 200 },
  { text: '[PEER] WiFi: found 1 peer (same LAN subnet)', delayMs: 200 },
  { text: '[PEER] LoRa: found 3 peers (range: ~4.2km)', delayMs: 200 },
  { text: '[PEER] Satellite: 1 gateway node visible', delayMs: 200 },
  { text: '[MESH] Negotiating transport priority: LoRa > WiFi > BLE > Satellite', delayMs: 300 },
  { text: '[MESH] Forming mesh topology...', delayMs: 300 },
  { text: '[MESH] Elected route: [DID:mesh:a7f3c9...] → [DID:mesh:c4e1b7...] (LoRa)', delayMs: 200 },
  { text: '[MESH] Elected route: [DID:mesh:a7f3c9...] → [DID:mesh:f9a2d8...] (WiFi)', delayMs: 200 },
  { text: '[AUTH] Requesting authorization from cluster authority...', delayMs: 250 },
  { text: '[AUTH] Verifiable Credential issued — scope: [read, write, relay]', delayMs: 200 },
  { text: '[AUTH] Node authorized. Identity bound to mesh.', delayMs: 200 },
  { text: '[NODE] Registering sensor nodes...', delayMs: 200 },
  { text: '[NODE] Sensor-01 (IMU) — DID bound, authorized', delayMs: 150 },
  { text: '[NODE] Sensor-02 (GPS) — DID bound, authorized', delayMs: 150 },
  { text: '[NODE] Effector-01 (Actuator) — DID bound, authorized', delayMs: 150 },
  { text: '[AGENT] Edge agentic harness loading...', delayMs: 250 },
  { text: '[AGENT] LLM inference engine: edge-quantized — READY', delayMs: 200 },
  { text: '[AGENT] Tool manifest loaded (12 capabilities)', delayMs: 150 },
  { text: '[AGENT] Agent identity provisioned: DID:agent:5b2c1f...', delayMs: 150 },
  { text: '[MESH] ATLAS NODE ONLINE — Mesh size: 7 nodes / 4 transports', delayMs: 300 },
  { text: '[MESH] Status: FULLY OPERATIONAL — Offline-first mode ACTIVE', delayMs: 300 },
  { text: '=========================================', delayMs: 200 },
  { text: 'ATLAS v0.1.0 — Decentralized. Resilient. Sovereign.', delayMs: 400 },
];

let activeCancel: (() => void) | null = null;

export function streamBootSequence(appendLine: (text: string) => void): () => void {
  // Cancel any previous sequence
  if (activeCancel) {
    activeCancel();
  }

  const timeouts: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;

  let cumulativeDelay = 0;
  for (const line of ATLAS_BOOT_SEQUENCE) {
    cumulativeDelay += line.delayMs;
    const timeout = setTimeout(() => {
      if (!cancelled) appendLine(line.text);
    }, cumulativeDelay);
    timeouts.push(timeout);
  }

  const cancel = () => {
    cancelled = true;
    timeouts.forEach(clearTimeout);
    if (activeCancel === cancel) activeCancel = null;
  };

  activeCancel = cancel;
  return cancel;
}
