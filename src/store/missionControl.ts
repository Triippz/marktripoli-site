import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SiteData, TelemetryEntry, Command, TerminalState, DossierTab, UserRank, MapView } from '../types/mission';
import { missionAudio } from '../utils/audioSystem';

interface MissionControlState {
  // Map state
  selectedSite: SiteData | null;
  mapView: MapView;
  
  // Terminal state
  terminalState: TerminalState;
  currentDossier: SiteData | null;
  activeTab: DossierTab;
  commandHistory: Command[];
  telemetryLogs: TelemetryEntry[];
  
  // User progression
  visitedSites: string[];
  unlockedEasterEggs: string[];
  userRank: UserRank;
  
  // UI preferences
  soundEnabled: boolean;
  hudVisible: boolean;
  
  // Actions
  selectSite: (site: SiteData | null) => void;
  setTerminalState: (state: TerminalState) => void;
  setActiveTab: (tab: DossierTab) => void;
  addCommand: (command: Command) => void;
  addTelemetry: (entry: Omit<TelemetryEntry, 'timestamp'>) => void;
  visitSite: (siteId: string) => void;
  unlockEasterEgg: (id: string) => void;
  toggleSound: () => void;
  toggleHUD: () => void;
}

export const useMissionControl = create<MissionControlState>((set, get) => ({
  // Initial state
  selectedSite: null,
  mapView: {
    center: { lat: 39.8283, lng: -98.5795 }, // Center of US
    zoom: 4,
    bearing: 0,
    pitch: 0,
  },
  terminalState: 'idle',
  currentDossier: null,
  activeTab: 'briefing',
  commandHistory: [],
  telemetryLogs: [],
  visitedSites: JSON.parse(localStorage.getItem('mc-visited') || '[]'),
  unlockedEasterEggs: JSON.parse(localStorage.getItem('mc-easter-eggs') || '[]'),
  userRank: { level: 1, title: 'Analyst', badge: '★' },
  soundEnabled: JSON.parse(localStorage.getItem('mc-sound') || 'false'),
  hudVisible: true,
  
  // Actions
  selectSite: (site) => {
    set({ selectedSite: site });
    if (site) {
      missionAudio.playMapPin();
      get().addTelemetry({
        source: 'MAP',
        message: `Target acquired: ${site.name}`,
        level: 'info',
      });
    }
  },
  
  setTerminalState: (state) => set({ terminalState: state }),
  
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
  
  addTelemetry: (entry) => {
    // Play different sounds based on telemetry level
    if (entry.level === 'error') {
      missionAudio.playError();
    } else if (entry.level === 'success') {
      missionAudio.playEngagement();
    }
    
    set((state) => ({
      telemetryLogs: [...state.telemetryLogs.slice(-49), { ...entry, timestamp: new Date() }] // Keep last 50
    }));
  },
  
  visitSite: (siteId) => {
    const state = get();
    if (!state.visitedSites.includes(siteId)) {
      const newVisited = [...state.visitedSites, siteId];
      localStorage.setItem('mc-visited', JSON.stringify(newVisited));
      
      const newRank = newVisited.length > 3 
        ? { level: 2, title: 'Operator', badge: '★★' }
        : newVisited.length > 6
        ? { level: 3, title: 'Commander', badge: '★★★' }
        : state.userRank;
      
      set({ 
        visitedSites: newVisited,
        userRank: newRank
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
}));