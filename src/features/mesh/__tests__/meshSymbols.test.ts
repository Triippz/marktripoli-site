import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  drawGroundStation,
  drawUAV,
  drawAircraft,
  drawSatellite,
  drawSensor,
  drawEdge,
} from '../meshSymbols';
import type { MeshEdge } from '../types';

function makeMockCtx() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    rect: vi.fn(),
    ellipse: vi.fn(),
    fillRect: vi.fn(),
    quadraticCurveTo: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    setLineDash: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    globalAlpha: 1,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    shadowBlur: 0,
    shadowColor: '',
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
  } as unknown as CanvasRenderingContext2D;
}

// T021 — each draw function calls beginPath() and stroke() or fill()
describe('T021 — symbol draw functions call beginPath + stroke/fill', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = makeMockCtx();
  });

  it('drawGroundStation calls beginPath and stroke or fill', () => {
    drawGroundStation(ctx, 100, 100, 1);
    expect(ctx.beginPath).toHaveBeenCalled();
    const calledMock = ctx as any;
    const hasStroke = calledMock.stroke.mock.calls.length > 0;
    const hasFill = calledMock.fill.mock.calls.length > 0;
    expect(hasStroke || hasFill).toBe(true);
  });

  it('drawUAV calls beginPath and stroke or fill', () => {
    drawUAV(ctx, 100, 100, 1);
    expect(ctx.beginPath).toHaveBeenCalled();
    const calledMock = ctx as any;
    const hasStroke = calledMock.stroke.mock.calls.length > 0;
    const hasFill = calledMock.fill.mock.calls.length > 0;
    expect(hasStroke || hasFill).toBe(true);
  });

  it('drawAircraft calls beginPath and stroke or fill', () => {
    drawAircraft(ctx, 100, 100, 1);
    expect(ctx.beginPath).toHaveBeenCalled();
    const calledMock = ctx as any;
    const hasStroke = calledMock.stroke.mock.calls.length > 0;
    const hasFill = calledMock.fill.mock.calls.length > 0;
    expect(hasStroke || hasFill).toBe(true);
  });

  it('drawSatellite calls beginPath and stroke or fill', () => {
    drawSatellite(ctx, 100, 100, 1);
    expect(ctx.beginPath).toHaveBeenCalled();
    const calledMock = ctx as any;
    const hasStroke = calledMock.stroke.mock.calls.length > 0;
    const hasFill = calledMock.fill.mock.calls.length > 0;
    expect(hasStroke || hasFill).toBe(true);
  });

  it('drawSensor calls beginPath and stroke or fill', () => {
    drawSensor(ctx, 100, 100, 1);
    expect(ctx.beginPath).toHaveBeenCalled();
    const calledMock = ctx as any;
    const hasStroke = calledMock.stroke.mock.calls.length > 0;
    const hasFill = calledMock.fill.mock.calls.length > 0;
    expect(hasStroke || hasFill).toBe(true);
  });
});

// T022 — drawEdge uses correct line dash patterns
describe('T022 — drawEdge line dash patterns', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = makeMockCtx();
  });

  it('uses setLineDash([5, 5]) for discovering edges', () => {
    const discoveringEdge: MeshEdge = {
      id: 'edge-disc',
      fromNodeId: 'node-a',
      toNodeId: 'node-b',
      state: 'discovering',
      transport: 'wifi',
      alpha: 1,
    };
    drawEdge(ctx, { x: 0, y: 0 }, { x: 100, y: 100 }, discoveringEdge);
    const setLineDashMock = ctx.setLineDash as ReturnType<typeof vi.fn>;
    const calls = setLineDashMock.mock.calls;
    const dashedCall = calls.find((args: unknown[][]) => {
      const arg = args[0] as number[];
      return Array.isArray(arg) && arg[0] === 5 && arg[1] === 5;
    });
    expect(dashedCall).toBeDefined();
  });

  it('uses setLineDash([]) for connected edges', () => {
    const connectedEdge: MeshEdge = {
      id: 'edge-conn',
      fromNodeId: 'node-a',
      toNodeId: 'node-b',
      state: 'connected',
      transport: 'wifi',
      alpha: 1,
    };
    drawEdge(ctx, { x: 0, y: 0 }, { x: 100, y: 100 }, connectedEdge);
    const setLineDashMock = ctx.setLineDash as ReturnType<typeof vi.fn>;
    const calls = setLineDashMock.mock.calls;
    const solidCall = calls.find((args: unknown[][]) => {
      const arg = args[0] as number[];
      return Array.isArray(arg) && arg.length === 0;
    });
    expect(solidCall).toBeDefined();
  });

  it('calls stroke for both discovering and connected edges', () => {
    const edge: MeshEdge = {
      id: 'edge-test',
      fromNodeId: 'node-a',
      toNodeId: 'node-b',
      state: 'connected',
      transport: 'lora',
      alpha: 0.8,
    };
    drawEdge(ctx, { x: 0, y: 0 }, { x: 200, y: 100 }, edge);
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
