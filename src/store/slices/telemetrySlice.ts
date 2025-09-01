import type { StateCreator } from 'zustand';
import type { TelemetryEntry } from '../../types/mission';
import { missionAudio } from '../../utils/audioSystem';

// Throttle telemetry to prevent UI blocking
let telemetryBuffer: Array<Omit<TelemetryEntry, 'timestamp'>> = [];
let telemetryTimeout: number | null = null;

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
    // Add to buffer for throttled processing
    telemetryBuffer.push(entry);
    
    if (!telemetryTimeout) {
      telemetryTimeout = setTimeout(() => {
        // Process all buffered entries
        const entriesToProcess = [...telemetryBuffer];
        telemetryBuffer = [];
        telemetryTimeout = null;
        
        entriesToProcess.forEach(bufferedEntry => {
          // Play different sounds based on telemetry level
          try {
            if (bufferedEntry.level === 'error') {
              missionAudio.playEffect('error');
            } else if (bufferedEntry.level === 'success') {
              missionAudio.playEngagement();
            }
          } catch (error) {
            console.warn('[Telemetry] Audio playback failed:', error);
          }
        });
        
        // Add all entries to state in one batch
        set((state) => ({
          telemetryLogs: [
            ...state.telemetryLogs.slice(-(50 - entriesToProcess.length)), 
            ...entriesToProcess.map(e => ({ ...e, timestamp: new Date() }))
          ]
        }));
      }, 100); // Batch every 100ms
    }
  },
  
  clearTelemetry: () => set({ telemetryLogs: [] }),
  
  getTelemetryByLevel: (level) => {
    const state = get();
    return state.telemetryLogs.filter(log => log.level === level);
  },
});