import type { StateCreator } from 'zustand';
import type { TelemetryEntry } from '../../types/mission';
import { missionAudio } from '../../utils/audioSystem';

export interface TelemetrySlice {
  // State
  telemetryLogs: TelemetryEntry[];
  
  // Actions
  addTelemetry: (entry: Omit<TelemetryEntry, 'timestamp'>) => void;
  clearTelemetry: () => void;
  getTelemetryByLevel: (level: TelemetryEntry['level']) => TelemetryEntry[];
}

export const createTelemetrySlice: StateCreator<
  TelemetrySlice,
  [],
  [],
  TelemetrySlice
> = (set, get) => ({
  // Initial state
  telemetryLogs: [],
  
  // Actions
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
  
  clearTelemetry: () => set({ telemetryLogs: [] }),
  
  getTelemetryByLevel: (level) => {
    const state = get();
    return state.telemetryLogs.filter(log => log.level === level);
  },
});