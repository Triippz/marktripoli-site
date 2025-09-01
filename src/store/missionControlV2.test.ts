import { describe, it, expect, beforeEach } from 'vitest';
import { useMissionControlV2 } from './missionControlV2';

describe('missionControlV2 user rank progression', () => {
  beforeEach(() => {
    // Clear persistence and reset store state safely
    localStorage.removeItem('mission-control-store');
    localStorage.removeItem('mc-visited');
    localStorage.removeItem('mc-easter-eggs');
    useMissionControlV2.setState((s) => ({
      ...s,
      visitedSites: [],
      unlockedEasterEggs: [],
      userRank: { level: 1, title: 'Analyst', badge: '★' } as any,
    }));
  });

  it('starts at Analyst rank', () => {
    const { userRank } = useMissionControlV2.getState();
    expect(userRank.level).toBe(1);
    expect(userRank.title).toBe('Analyst');
  });

  it('upgrades to Operator after visiting 4 unique sites', () => {
    const api = useMissionControlV2.getState();
    ['a', 'b', 'c', 'd'].forEach(id => api.visitSite(id));
    const state = useMissionControlV2.getState();
    expect(state.userRank.level).toBe(2);
    expect(state.userRank.title).toBe('Operator');
  });

  it('upgrades to Commander after visiting 8 unique sites', () => {
    const api = useMissionControlV2.getState();
    ['1','2','3','4','5','6','7','8'].forEach(id => api.visitSite(id));
    const state = useMissionControlV2.getState();
    expect(state.userRank.level).toBe(3);
    expect(state.userRank.title).toBe('Commander');
  });
});
