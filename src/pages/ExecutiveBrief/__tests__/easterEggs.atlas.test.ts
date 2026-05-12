import { describe, it, expect } from 'vitest';
import type { EasterEggType } from '../types/easterEggs';

// T032c — EasterEggType includes 'atlas'
describe('EasterEggType includes atlas', () => {
  it('atlas is a valid EasterEggType (type assertion compiles)', () => {
    // This is a compile-time check — if it compiles, the type includes 'atlas'
    const t: EasterEggType = 'atlas';
    expect(t).toBe('atlas');
  });

  it('all existing egg types are still valid', () => {
    const types: EasterEggType[] = [
      'matrix', 'ufo', 'paws', 'glitch', 'neon',
      'scanlines', 'beam', 'hiking', 'crayon', 'atlas',
    ];
    expect(types).toHaveLength(10);
    expect(types).toContain('atlas');
  });
});
