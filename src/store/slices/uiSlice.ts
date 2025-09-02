import type { StateCreator } from 'zustand';
import { missionAudio } from '../../utils/audioSystem';

export interface UISlice {
  // State
  soundEnabled: boolean;
  hudVisible: boolean;
  theme: 'tactical' | 'classic';
  bootCompleted: boolean;
  
  // Actions
  toggleSound: () => void;
  toggleHUD: () => void;
  setTheme: (theme: 'tactical' | 'classic') => void;
  setBootCompleted: (completed: boolean) => void;
}

export const createUISlice: StateCreator<
  UISlice,
  [],
  [],
  UISlice
> = (set, get) => ({
  // Initial state
  soundEnabled: JSON.parse(localStorage.getItem('mc-sound') || 'false'),
  hudVisible: true,
  theme: 'tactical',
  bootCompleted: JSON.parse(localStorage.getItem('mc-boot-completed') || 'false'),
  
  // Actions
  toggleSound: () => {
    const newSound = !get().soundEnabled;
    localStorage.setItem('mc-sound', JSON.stringify(newSound));
    set({ soundEnabled: newSound });
    
    // Enable/disable audio system
    missionAudio.setEnabled(newSound);
    
    if (newSound) {
      missionAudio.playEngagement();
    }
  },
  
  toggleHUD: () => set((state) => ({ hudVisible: !state.hudVisible })),
  
  setTheme: (theme) => {
    localStorage.setItem('mc-theme', theme);
    set({ theme });
  },
  
  setBootCompleted: (completed) => {
    localStorage.setItem('mc-boot-completed', JSON.stringify(completed));
    set({ bootCompleted: completed });
  },
});