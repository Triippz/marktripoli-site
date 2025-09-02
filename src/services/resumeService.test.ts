import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResumeService } from './resumeService';

const makeFetch = (payload: any, delayMs = 0) => {
  return vi.fn().mockImplementation(async () => {
    if (delayMs) {
      await new Promise(res => setTimeout(res, delayMs));
    }
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify(payload),
    } as Response;
  });
};

describe('ResumeService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('coalesces concurrent fetches of resume.json', async () => {
    const svc = new ResumeService();
    const payload = { basics: { name: 'Test' } };
    const fetchMock = makeFetch(payload, 10);
    global.fetch = fetchMock;

    const p1 = svc.fetchResumeData('/anything');
    const p2 = svc.fetchResumeData('/anything');
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(r1).toEqual(payload);
    expect(r2).toEqual(payload);
  });

  it('uses cache on subsequent calls', async () => {
    const svc = new ResumeService();
    const payload = { basics: { name: 'Cached' } };
    const fetchMock = makeFetch(payload);
    global.fetch = fetchMock;

    const first = await svc.fetchResumeData('/anything');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const second = await svc.fetchResumeData('/anything');
    // Still 1 because cache hit
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });
});

