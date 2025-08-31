import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createMapSlice, type MapSlice } from './slices/mapSlice';
import { createTerminalSlice, type TerminalSlice } from './slices/terminalSlice';
import { createUserSlice, type UserSlice } from './slices/userSlice';
import { createTelemetrySlice, type TelemetrySlice } from './slices/telemetrySlice';
import { createUISlice, type UISlice } from './slices/uiSlice';

// Combined store type
export type MissionControlStore = MapSlice & TerminalSlice & UserSlice & TelemetrySlice & UISlice;

// Create the combined store
export const useMissionControlV2 = create<MissionControlStore>()(
  persist(
    (...a) => ({
      ...createMapSlice(...a),
      ...createTerminalSlice(...a),
      ...createUserSlice(...a),
      ...createTelemetrySlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: 'mission-control-store',
      partialize: (state) => ({
        // Only persist certain parts of the state
        visitedSites: state.visitedSites,
        unlockedEasterEggs: state.unlockedEasterEggs,
        userRank: state.userRank,
        soundEnabled: state.soundEnabled,
        theme: state.theme,
        mapView: state.mapView,
      }),
    }
  )
);

// Individual slice hooks for better performance
export const useMapStore = () => useMissionControlV2(state => ({
  selectedSite: state.selectedSite,
  mapView: state.mapView,
  selectSite: state.selectSite,
  setMapView: state.setMapView,
}));

export const useTerminalStore = () => useMissionControlV2(state => ({
  terminalState: state.terminalState,
  currentDossier: state.currentDossier,
  activeTab: state.activeTab,
  commandHistory: state.commandHistory,
  setTerminalState: state.setTerminalState,
  setCurrentDossier: state.setCurrentDossier,
  setActiveTab: state.setActiveTab,
  addCommand: state.addCommand,
}));

export const useUserStore = () => useMissionControlV2(state => ({
  visitedSites: state.visitedSites,
  unlockedEasterEggs: state.unlockedEasterEggs,
  userRank: state.userRank,
  visitSite: state.visitSite,
  unlockEasterEgg: state.unlockEasterEgg,
  calculateRank: state.calculateRank,
}));

export const useTelemetryStore = () => useMissionControlV2(state => ({
  telemetryLogs: state.telemetryLogs,
  addTelemetry: state.addTelemetry,
  clearTelemetry: state.clearTelemetry,
  getTelemetryByLevel: state.getTelemetryByLevel,
}));

export const useUIStore = () => useMissionControlV2(state => ({
  soundEnabled: state.soundEnabled,
  hudVisible: state.hudVisible,
  theme: state.theme,
  toggleSound: state.toggleSound,
  toggleHUD: state.toggleHUD,
  setTheme: state.setTheme,
}));

// Computed selectors for complex state derivations
export const useUserStats = () => useMissionControlV2(state => {
  const totalSites = state.visitedSites.length;
  const totalEasterEggs = state.unlockedEasterEggs.length;
  const completionPercentage = Math.round((totalSites / 8) * 100); // Assuming 8 total sites
  
  return {
    totalSites,
    totalEasterEggs,
    completionPercentage,
    currentRank: state.userRank,
    isMaxRank: state.userRank.level >= 3,
  };
});

export const useRecentTelemetry = (count: number = 5) => useMissionControlV2(state => 
  state.telemetryLogs.slice(-count)
);

export const useTelemetryStats = () => useMissionControlV2(state => {
  const errors = state.telemetryLogs.filter(log => log.level === 'error').length;
  const successes = state.telemetryLogs.filter(log => log.level === 'success').length;
  const warnings = state.telemetryLogs.filter(log => log.level === 'warning').length;
  const info = state.telemetryLogs.filter(log => log.level === 'info').length;
  
  return { errors, successes, warnings, info };
});

// Actions that span multiple slices
export const useCombinedActions = () => useMissionControlV2(state => ({
  // Select site and set terminal state
  engageSite: (site: any) => {
    state.selectSite(site);
    state.setTerminalState('loading');
    state.visitSite(site.id);
    state.addTelemetry({
      source: 'SYSTEM',
      message: `Engaging target: ${site.codename || site.name}`,
      level: 'success'
    });
  },
  
  // Complete mission engagement
  completeMission: (site: any) => {
    state.setTerminalState('viewing');
    state.setCurrentDossier(site);
    state.addTelemetry({
      source: 'MISSION',
      message: `Mission completed: ${site.codename || site.name}`,
      level: 'success'
    });
  },
  
  // Reset all systems
  resetAllSystems: () => {
    state.selectSite(null);
    state.setTerminalState('idle');
    state.setCurrentDossier(null);
    state.setActiveTab('briefing');
    state.clearTelemetry();
    state.addTelemetry({
      source: 'SYSTEM',
      message: 'All systems reset to standby',
      level: 'info'
    });
  },
}));