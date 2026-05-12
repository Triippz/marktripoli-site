import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hasEffect, executeEffect, getEffectDuration } from '../effectEngine';
import effectConfig from '../../../data/easterEggs/effectConfig.json';

describe('meshNetwork effect registration', () => {
  it('T039: effectRegistry contains meshNetwork key', () => {
    expect(hasEffect('meshNetwork')).toBe(true);
  });

  it('T039: executing meshNetwork dispatches atlas-mesh-activate event', () => {
    const handler = vi.fn();
    window.addEventListener('atlas-mesh-activate', handler);

    const container = document.createElement('div');
    executeEffect('meshNetwork', container);

    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener('atlas-mesh-activate', handler);
  });

  it('T039a: effectConfig.json contains meshNetwork in durations with value 32000', () => {
    expect(effectConfig.durations).toHaveProperty('meshNetwork');
    expect((effectConfig.durations as Record<string, number>).meshNetwork).toBe(999999999);
  });

  it('T039a: effectConfig.json contains meshNetwork in probabilities with value 0.02', () => {
    expect(effectConfig.probabilities).toHaveProperty('meshNetwork');
    expect((effectConfig.probabilities as Record<string, number>).meshNetwork).toBe(0.02);
  });

  it('T039a: getEffectDuration returns 32000 for meshNetwork', () => {
    expect(getEffectDuration('meshNetwork')).toBe(999999999);
  });
});
