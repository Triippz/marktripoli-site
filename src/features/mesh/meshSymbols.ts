import type { MeshEdge, MeshNode, SignalPulse } from './types';

// ── Color palette ─────────────────────────────────────────────────────────────

const COLORS = {
  friendly: '#00ff00',
  friendlyFill: 'rgba(0, 255, 0, 0.12)',
  uav: '#44ffb0',
  uavFill: 'rgba(68, 255, 176, 0.15)',
  aircraft: '#ffcc00',
  aircraftFill: 'rgba(255, 204, 0, 0.15)',
  satellite: '#ff44ff',
  satelliteFill: 'rgba(255, 68, 255, 0.12)',
  sensor: '#ff8800',
  sensorFill: 'rgba(255, 136, 0, 0.15)',
  phone: '#00ccff',
  phoneFill: 'rgba(0, 204, 255, 0.15)',
  label: '#00ff00',
  edgeWifi: '#00ff00',
  edgeBle: '#44ffb0',
  edgeLora: '#ff8800',
  edgeSatellite: '#ff44ff',
  edgeWired: '#88ccff',
  pulse: '#ffffff',
} as const;

function transportColor(transport: MeshEdge['transport']): string {
  switch (transport) {
    case 'wifi': return COLORS.edgeWifi;
    case 'ble': return COLORS.edgeBle;
    case 'lora': return COLORS.edgeLora;
    case 'satellite': return COLORS.edgeSatellite;
    case 'wired': return COLORS.edgeWired;
    default: return COLORS.edgeWifi;
  }
}

// ── MIL-STD-2525D Friendly Frame ─────────────────────────────────────────────
// Friendly units use a RECTANGLE frame in 2525D. We draw the frame, then the
// icon function inside it.

function drawFriendlyFrame(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  color: string, fill: string, alpha: number
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = fill;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(x - w / 2, y - h / 2, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ── Ground Station: Friendly rectangle + antenna/tower icon ──────────────────

export function drawGroundStation(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  alpha: number,
  size: number = 10
): void {
  const w = size * 2.2;
  const h = size * 1.6;
  drawFriendlyFrame(ctx, x, y, w, h, COLORS.friendly, COLORS.friendlyFill, alpha);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLORS.friendly;
  ctx.lineWidth = 1.2;

  // Antenna mast
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.25);
  ctx.lineTo(x, y - h * 0.3);
  ctx.stroke();

  // Antenna dish (arc)
  ctx.beginPath();
  ctx.arc(x, y - h * 0.3, size * 0.35, Math.PI * 0.8, Math.PI * 0.2);
  ctx.stroke();

  // Radiation lines
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 3, y - h * 0.35);
    ctx.lineTo(x + i * 5, y - h * 0.5);
    ctx.stroke();
  }

  ctx.restore();
}

// ── UAV / Drone: Friendly rectangle + UAV silhouette ─────────────────────────

export function drawUAV(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  alpha: number,
  size: number = 9
): void {
  const w = size * 2;
  const h = size * 1.5;
  drawFriendlyFrame(ctx, x, y, w, h, COLORS.uav, COLORS.uavFill, alpha);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLORS.uav;
  ctx.fillStyle = COLORS.uav;
  ctx.lineWidth = 1.2;

  // UAV body (small fuselage)
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.25, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings (straight line through body)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.7, y);
  ctx.lineTo(x + size * 0.7, y);
  ctx.stroke();

  // V-tail
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - size * 0.25, y + size * 0.35);
  ctx.moveTo(x, y);
  ctx.lineTo(x + size * 0.25, y + size * 0.35);
  ctx.stroke();

  ctx.restore();
}

// ── Aircraft: Friendly rectangle + fixed-wing silhouette ─────────────────────

export function drawAircraft(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  alpha: number,
  size: number = 10
): void {
  const w = size * 2.4;
  const h = size * 1.6;
  drawFriendlyFrame(ctx, x, y, w, h, COLORS.aircraft, COLORS.aircraftFill, alpha);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLORS.aircraft;
  ctx.fillStyle = COLORS.aircraft;
  ctx.lineWidth = 1.2;

  // Fuselage
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main wings (swept)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y);
  ctx.lineTo(x - size * 0.85, y + size * 0.2);
  ctx.moveTo(x + size * 0.1, y);
  ctx.lineTo(x + size * 0.85, y + size * 0.2);
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.1);
  ctx.lineTo(x, y + size * 0.45);
  ctx.stroke();

  // Horizontal stabilizer
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.4);
  ctx.lineTo(x + size * 0.3, y + size * 0.4);
  ctx.stroke();

  ctx.restore();
}

// ── Satellite: Diamond frame (space/unknown affiliation in 2525D) + dish ─────

export function drawSatellite(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  alpha: number,
  size: number = 8
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLORS.satellite;
  ctx.fillStyle = COLORS.satelliteFill;
  ctx.lineWidth = 1.5;

  // Diamond frame (space domain in 2525D)
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Solar panel left
  ctx.beginPath();
  ctx.rect(x - size * 2.2, y - size * 0.3, size * 0.9, size * 0.6);
  ctx.stroke();
  // Panel cells
  ctx.beginPath();
  ctx.moveTo(x - size * 1.75, y - size * 0.3);
  ctx.lineTo(x - size * 1.75, y + size * 0.3);
  ctx.stroke();

  // Solar panel right
  ctx.beginPath();
  ctx.rect(x + size * 1.3, y - size * 0.3, size * 0.9, size * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 1.75, y - size * 0.3);
  ctx.lineTo(x + size * 1.75, y + size * 0.3);
  ctx.stroke();

  // Panel arms
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x - size * 1.3, y);
  ctx.moveTo(x + size, y);
  ctx.lineTo(x + size * 1.3, y);
  ctx.stroke();

  ctx.restore();
}

// ── Sensor: Friendly rectangle + radar/sensor wave icon ──────────────────────

export function drawSensor(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  alpha: number,
  size: number = 8
): void {
  const w = size * 1.8;
  const h = size * 1.4;
  drawFriendlyFrame(ctx, x, y, w, h, COLORS.sensor, COLORS.sensorFill, alpha);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLORS.sensor;
  ctx.lineWidth = 1;

  // Sensor mast
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.lineTo(x, y - size * 0.15);
  ctx.stroke();

  // Concentric radar arcs (emission waves)
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(x, y - size * 0.15, size * 0.15 * i, -Math.PI * 0.7, -Math.PI * 0.3);
    ctx.stroke();
  }

  ctx.restore();
}

// ── Phone / Mobile Device: Friendly rectangle + phone icon ───────────────────

export function drawPhone(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  alpha: number,
  size: number = 7
): void {
  const w = size * 1.6;
  const h = size * 1.4;
  drawFriendlyFrame(ctx, x, y, w, h, COLORS.phone, COLORS.phoneFill, alpha);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLORS.phone;
  ctx.lineWidth = 1;

  // Phone body (rounded rect)
  const pw = size * 0.4;
  const ph = size * 0.65;
  const r = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - pw + r, y - ph);
  ctx.arcTo(x + pw, y - ph, x + pw, y + ph, r);
  ctx.arcTo(x + pw, y + ph, x - pw, y + ph, r);
  ctx.arcTo(x - pw, y + ph, x - pw, y - ph, r);
  ctx.arcTo(x - pw, y - ph, x + pw, y - ph, r);
  ctx.closePath();
  ctx.stroke();

  // Screen
  ctx.fillStyle = COLORS.phone;
  ctx.globalAlpha = alpha * 0.3;
  ctx.fillRect(x - pw + 1.5, y - ph + 2, (pw - 1.5) * 2, ph * 1.5);
  ctx.globalAlpha = alpha;

  // Signal waves from top
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(x, y - ph - 1, size * 0.12 * i, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();
  }

  ctx.restore();
}

// ── Person / Dismounted: Friendly rectangle + person icon ────────────────────

export function drawPerson(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  alpha: number,
  size: number = 7
): void {
  const w = size * 1.6;
  const h = size * 1.5;
  drawFriendlyFrame(ctx, x, y, w, h, COLORS.friendly, COLORS.friendlyFill, alpha);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLORS.friendly;
  ctx.fillStyle = COLORS.friendly;
  ctx.lineWidth = 1.2;

  // Head
  ctx.beginPath();
  ctx.arc(x, y - size * 0.3, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.12);
  ctx.lineTo(x, y + size * 0.3);
  ctx.stroke();

  // Arms
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.05);
  ctx.lineTo(x, y - size * 0.05);
  ctx.lineTo(x + size * 0.3, y + size * 0.05);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.55);
  ctx.lineTo(x, y + size * 0.3);
  ctx.lineTo(x + size * 0.2, y + size * 0.55);
  ctx.stroke();

  ctx.restore();
}

// ── Vehicle: Friendly rectangle + wheeled vehicle icon ───────────────────────

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  alpha: number,
  size: number = 9
): void {
  const w = size * 2.2;
  const h = size * 1.5;
  drawFriendlyFrame(ctx, x, y, w, h, COLORS.friendly, COLORS.friendlyFill, alpha);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLORS.friendly;
  ctx.lineWidth = 1.2;

  // Vehicle body (box shape)
  ctx.beginPath();
  ctx.rect(x - size * 0.6, y - size * 0.2, size * 1.2, size * 0.35);
  ctx.stroke();

  // Wheels
  const wheelR = size * 0.12;
  ctx.fillStyle = COLORS.friendly;
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y + size * 0.25, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.35, y + size * 0.25, wheelR, 0, Math.PI * 2);
  ctx.fill();

  // Axle line
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.25);
  ctx.lineTo(x + size * 0.35, y + size * 0.25);
  ctx.stroke();

  // Antenna on top
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y - size * 0.2);
  ctx.lineTo(x + size * 0.3, y - size * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.3, y - size * 0.52, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── Ship / Surface Vessel: Friendly rectangle + hull silhouette ──────────────

export function drawShip(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  alpha: number,
  size: number = 10
): void {
  const w = size * 2.4;
  const h = size * 1.5;
  drawFriendlyFrame(ctx, x, y, w, h, COLORS.friendly, COLORS.friendlyFill, alpha);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = COLORS.friendly;
  ctx.fillStyle = COLORS.friendlyFill;
  ctx.lineWidth = 1.2;

  // Hull (flat bottom, pointed bow)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.7, y + size * 0.15);
  ctx.lineTo(x + size * 0.5, y + size * 0.15);
  ctx.lineTo(x + size * 0.8, y - size * 0.05);
  ctx.lineTo(x + size * 0.5, y - size * 0.05);
  ctx.lineTo(x - size * 0.7, y - size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Superstructure
  ctx.beginPath();
  ctx.rect(x - size * 0.3, y - size * 0.05, size * 0.5, -size * 0.25);
  ctx.stroke();

  // Mast
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.3);
  ctx.lineTo(x - size * 0.05, y - size * 0.55);
  ctx.stroke();

  // Antenna
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.5);
  ctx.lineTo(x + size * 0.1, y - size * 0.5);
  ctx.stroke();

  ctx.restore();
}

// ── Node label ────────────────────────────────────────────────────────────────

export function drawNodeLabel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  label: string,
  alpha: number,
  offsetY: number = 18
): void {
  ctx.save();
  ctx.globalAlpha = alpha * 0.8;
  ctx.fillStyle = COLORS.label;
  ctx.font = '8px "JetBrains Mono", "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y + offsetY);
  ctx.restore();
}

// ── Edge ──────────────────────────────────────────────────────────────────────

export function drawEdge(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  edge: MeshEdge
): void {
  ctx.save();
  ctx.globalAlpha = edge.alpha * 0.18;
  ctx.strokeStyle = transportColor(edge.transport);
  ctx.lineWidth = 0.3;
  ctx.lineCap = 'round';

  if (edge.state === 'discovering') {
    ctx.setLineDash([5, 5]);
  } else if (edge.state === 'handshaking') {
    ctx.setLineDash([2, 3]);
  } else {
    ctx.setLineDash([]);
  }

  if (edge.isSatelliteBackhaul) {
    const midX = (from.x + to.x) / 2;
    const midY = Math.min(from.y, to.y) - Math.abs(to.x - from.x) * 0.15;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(midX, midY, to.x, to.y);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.restore();
}

// ── Signal pulse ──────────────────────────────────────────────────────────────

export function drawSignalPulse(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  pulse: SignalPulse,
  size: number = 3
): void {
  const px = from.x + (to.x - from.x) * pulse.t;
  const py = from.y + (to.y - from.y) * pulse.t;

  ctx.save();
  ctx.globalAlpha = pulse.alpha;

  const grad = ctx.createRadialGradient(px, py, 0, px, py, size * 2.5);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  grad.addColorStop(0.4, 'rgba(0, 255, 0, 0.4)');
  grad.addColorStop(1, 'rgba(0, 255, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(px, py, size * 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.pulse;
  ctx.beginPath();
  ctx.arc(px, py, size * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── Altitude stalk — vertical line from ground pos to elevated symbol ────────

function getAltitudeOffset(node: MeshNode, zoom: number): number {
  const alt = node.detail?.alt;
  if (!alt || alt <= 500) return 0;

  // Fixed pixel tiers — these need to look obviously separated on screen
  const zoomScale = Math.max(0.5, zoom / 4);

  if (alt > 10_000_000) return 180 * zoomScale; // satellites — way up there
  if (alt > 5_000)      return 90 * zoomScale;  // aircraft — clearly above ground
  if (alt > 1_000)      return 50 * zoomScale;  // UAVs — visibly elevated
  return 0;
}

function drawAltitudeStalk(
  ctx: CanvasRenderingContext2D,
  groundX: number, groundY: number,
  elevatedY: number, alpha: number, color: string
): void {
  ctx.save();
  ctx.globalAlpha = alpha * 0.3;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 3]);

  // Stalk line
  ctx.beginPath();
  ctx.moveTo(groundX, groundY);
  ctx.lineTo(groundX, elevatedY);
  ctx.stroke();

  // Ground shadow dot
  ctx.setLineDash([]);
  ctx.globalAlpha = alpha * 0.15;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(groundX, groundY, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── Dispatch draw by node type ────────────────────────────────────────────────

export function drawNode(
  ctx: CanvasRenderingContext2D,
  node: MeshNode,
  screenPos: { x: number; y: number },
  zoom: number = 4
): void {
  if (node.alpha <= 0) return;

  const altOffset = getAltitudeOffset(node, zoom);
  const drawX = screenPos.x;
  const drawY = screenPos.y - altOffset;

  // Draw altitude stalk for airborne/space nodes
  if (altOffset > 0) {
    const color = node.type === 'satellite' ? COLORS.satellite
      : node.type === 'aircraft' ? COLORS.aircraft
      : COLORS.uav;
    drawAltitudeStalk(ctx, screenPos.x, screenPos.y, drawY, node.alpha, color);
  }

  switch (node.type) {
    case 'ground-station': drawGroundStation(ctx, drawX, drawY, node.alpha); break;
    case 'uav': drawUAV(ctx, drawX, drawY, node.alpha); break;
    case 'aircraft': drawAircraft(ctx, drawX, drawY, node.alpha); break;
    case 'satellite': drawSatellite(ctx, drawX, drawY, node.alpha); break;
    case 'sensor': drawSensor(ctx, drawX, drawY, node.alpha); break;
    case 'phone': drawPhone(ctx, drawX, drawY, node.alpha); break;
    case 'person': drawPerson(ctx, drawX, drawY, node.alpha); break;
    case 'vehicle': drawVehicle(ctx, drawX, drawY, node.alpha); break;
    case 'ship': drawShip(ctx, drawX, drawY, node.alpha); break;
    default: drawGroundStation(ctx, drawX, drawY, node.alpha);
  }

  drawNodeLabel(ctx, drawX, drawY, node.label, node.alpha);
}
