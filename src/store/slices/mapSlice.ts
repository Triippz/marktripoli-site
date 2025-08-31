import type { StateCreator } from 'zustand';
import type { SiteData, MapView } from '../../types/mission';
import { missionAudio } from '../../utils/audioSystem';

export interface MapSlice {
  // State
  selectedSite: SiteData | null;
  mapView: MapView;
  
  // Actions
  selectSite: (site: SiteData | null) => void;
  setMapView: (view: Partial<MapView>) => void;
}

export const createMapSlice: StateCreator<
  MapSlice,
  [],
  [],
  MapSlice
> = (set, get) => ({
  // Initial state
  selectedSite: null,
  mapView: {
    center: { lat: 39.8283, lng: -98.5795 }, // Center of US
    zoom: 4,
    bearing: 0,
    pitch: 0,
  },
  
  // Actions
  selectSite: (site) => {
    set({ selectedSite: site });
    if (site) {
      missionAudio.playMapPin();
    }
  },
  
  setMapView: (view) => {
    set((state) => ({
      mapView: { ...state.mapView, ...view }
    }));
  },
});