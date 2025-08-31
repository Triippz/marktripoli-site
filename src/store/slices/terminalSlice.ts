import type { StateCreator } from 'zustand';
import type { SiteData, Command, TerminalState, DossierTab } from '../../types/mission';
import { missionAudio } from '../../utils/audioSystem';

export interface TerminalSlice {
  // State
  terminalState: TerminalState;
  currentDossier: SiteData | null;
  activeTab: DossierTab;
  commandHistory: Command[];
  
  // Actions
  setTerminalState: (state: TerminalState) => void;
  setCurrentDossier: (dossier: SiteData | null) => void;
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