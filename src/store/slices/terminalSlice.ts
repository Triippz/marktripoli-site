import type { StateCreator } from 'zustand';
import type { EnhancedSiteData, Command, TerminalState, DossierTab } from '../../types';
import { missionAudio } from '../../utils/audioSystem';

export interface TerminalSlice {
  // State
  terminalState: TerminalState;
  currentDossier: EnhancedSiteData | null;
  activeTab: DossierTab;
  commandHistory: Command[];
  
  // Actions
  setTerminalState: (state: TerminalState) => void;
  setCurrentDossier: (dossier: EnhancedSiteData | null) => void;
  setActiveTab: (tab: DossierTab) => void;
  addCommand: (command: Command) => void;
}

export const createTerminalSlice: StateCreator<
  TerminalSlice,
  [],
  [],
  TerminalSlice
> = (set, get) => ({
  // Initial state
  terminalState: 'idle',
  currentDossier: null,
  activeTab: 'briefing',
  commandHistory: [],
  
  // Actions
  setTerminalState: (state) => set({ terminalState: state }),
  
  setCurrentDossier: (dossier) => set({ currentDossier: dossier }),
  
  setActiveTab: (tab) => {
    missionAudio.playNavigation();
    set({ activeTab: tab });
  },
  
  addCommand: (command) => {
    missionAudio.playTerminalKey();
    set((state) => ({ 
      commandHistory: [...state.commandHistory.slice(-19), command] // Keep last 20
    }));
  },
});