export interface CareerLocation {
  lat: number;
  lng: number;
  city?: string;
  region?: string;
}

export interface CareerMarker {
  id: string;
  name: string;
  position: string;
  category: string;
  type: string;
  codename: string;
  location: CareerLocation;
  logo?: string;
  summary?: string;
  highlights?: string[];
  languages?: string[];
  frameworks?: string[];
  technologies?: string[];
  skills?: string[];
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface CareerMapData {
  markers: CareerMarker[];
  categories: Record<string, {
    label: string;
    icon: string;
    color: string;
    glowColor: string;
  }>;
}

export interface CareerMarkerState {
  markers: CareerMarker[];
  selectedMarker: CareerMarker | null;
  isLoading: boolean;
  error: string | null;
}

export interface CareerMarkerControls {
  selectMarker: (marker: CareerMarker) => void;
  clearSelection: () => void;
  flyToMarker: (marker: CareerMarker, map: mapboxgl.Map) => void;
}