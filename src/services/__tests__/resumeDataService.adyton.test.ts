import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read the actual public/resume.json from disk (avoids fetch entirely). */
function loadResumeJson() {
  const filePath = path.resolve(__dirname, '../../..', 'public/resume.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

/** Build a minimal mock fetch that returns the given payload. */
const makeFetch = (payload: unknown) =>
  vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response);

// ---------------------------------------------------------------------------
// T005 — Adyton CareerMarker shape
// ---------------------------------------------------------------------------
describe('T005 — Adyton CareerMarker', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('transforms the Adyton work entry into a CareerMarker with expected fields', async () => {
    const resume = loadResumeJson();
    global.fetch = makeFetch(resume);

    // Re-import after resetting modules so the singleton is fresh
    const { resumeDataService } = await import('../resumeDataService');
    const data = await resumeDataService.getCareerMapData();

    const adyton = data.markers.find((m) => m.name === 'Adyton');
    expect(adyton).toBeDefined();
    expect(adyton!.name).toBe('Adyton');
    expect(adyton!.codename).toBe('OPERATION ATLAS');
    expect(adyton!.isCurrent).toBe(true);
    expect(adyton!.location.lat).toBeCloseTo(39.5, 0);
  });
});

// ---------------------------------------------------------------------------
// T006 — Picogrid isCurrent === false when endDate is present
// ---------------------------------------------------------------------------
describe('T006 — Picogrid isCurrent false', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('sets isCurrent: false for Picogrid when endDate 2025-10 is present', async () => {
    const resume = loadResumeJson();
    global.fetch = makeFetch(resume);

    const { resumeDataService } = await import('../resumeDataService');
    const data = await resumeDataService.getCareerMapData();

    // There may be multiple Picogrid entries; the one with endDate should NOT be current
    const picogridMarkers = data.markers.filter((m) => m.name === 'Picogrid');
    expect(picogridMarkers.length).toBeGreaterThan(0);

    const closedPicogrid = picogridMarkers.find((m) => m.endDate === '2025-10');
    expect(closedPicogrid).toBeDefined();
    expect(closedPicogrid!.isCurrent).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// T007 — Adyton summary content
// ---------------------------------------------------------------------------
describe('T007 — Adyton summary content', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('includes "decentralized" and "NATS JetStream" in the Adyton summary', async () => {
    const resume = loadResumeJson();
    global.fetch = makeFetch(resume);

    const { resumeDataService } = await import('../resumeDataService');
    const data = await resumeDataService.getCareerMapData();

    const adyton = data.markers.find((m) => m.name === 'Adyton');
    expect(adyton).toBeDefined();
    expect(adyton!.summary).toContain('decentralized');
    expect(adyton!.summary).toContain('NATS JetStream');
  });
});

// ---------------------------------------------------------------------------
// T007a — resume.json projects array contains Atlas and Notification Platform
// ---------------------------------------------------------------------------
describe('T007a — projects array entries', () => {
  it('contains a project with "Atlas" in its name', () => {
    const resume = loadResumeJson();
    const atlasProject = resume.projects.find((p: { name: string }) =>
      p.name.includes('Atlas')
    );
    expect(atlasProject).toBeDefined();
  });

  it('contains a project with "Notification Platform" in its name', () => {
    const resume = loadResumeJson();
    const notifProject = resume.projects.find((p: { name: string }) =>
      p.name.includes('Notification Platform')
    );
    expect(notifProject).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// T007b — basics.summary contains "Adyton" or "decentralized"
// ---------------------------------------------------------------------------
describe('T007b — basics.summary content', () => {
  it('contains "Adyton" or "decentralized" in basics.summary', () => {
    const resume = loadResumeJson();
    const summary: string = resume.basics.summary;
    const hasAdyton = summary.includes('Adyton');
    const hasDecentralized = summary.includes('decentralized');
    expect(hasAdyton || hasDecentralized).toBe(true);
  });
});
