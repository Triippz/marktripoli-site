import type { StateCreator } from 'zustand';
import type { UserRank } from '../../types';
import { missionAudio } from '../../utils/audioSystem';

export interface UserSlice {
  // State
  visitedSites: string[];
  unlockedEasterEggs: string[];
  userRank: UserRank;
  
  // Actions
  visitSite: (siteId: string) => void;
  unlockEasterEgg: (id: string) => void;
  calculateRank: () => UserRank;
}

export const createUserSlice: StateCreator<
  UserSlice,
  [],
  [],
  UserSlice
> = (set, get) => ({
  // Initial state
  visitedSites: JSON.parse(localStorage.getItem('mc-visited') || '[]'),
  unlockedEasterEggs: JSON.parse(localStorage.getItem('mc-easter-eggs') || '[]'),
  userRank: { level: 1, title: 'Analyst', badge: '★' },
  
  // Actions
  visitSite: (siteId) => {
    const state = get();
    if (!state.visitedSites.includes(siteId)) {
      const newVisited = [...state.visitedSites, siteId];
      localStorage.setItem('mc-visited', JSON.stringify(newVisited));

      // Calculate rank based on the updated visited list
      const visitedCount = newVisited.length;
      const newRank = visitedCount >= 8
        ? { level: 3, title: 'Commander', badge: '★★★' }
        : visitedCount >= 4
          ? { level: 2, title: 'Operator', badge: '★★' }
          : { level: 1, title: 'Analyst', badge: '★' };

      set({
        visitedSites: newVisited,
        userRank: newRank,
      });
    }
  },
  
  unlockEasterEgg: (id) => {
    const state = get();
    if (!state.unlockedEasterEggs.includes(id)) {
      const newEggs = [...state.unlockedEasterEggs, id];
      localStorage.setItem('mc-easter-eggs', JSON.stringify(newEggs));
      set({ unlockedEasterEggs: newEggs });
      
      // Play achievement sound
      missionAudio.playEngagement();
    }
  },
  
  calculateRank: () => {
    const state = get();
    const visitedCount = state.visitedSites.length;
    
    if (visitedCount >= 8) {
      return { level: 3, title: 'Commander', badge: '★★★' };
    } else if (visitedCount >= 4) {
      return { level: 2, title: 'Operator', badge: '★★' };
    } else {
      return { level: 1, title: 'Analyst', badge: '★' };
    }
  },
});
