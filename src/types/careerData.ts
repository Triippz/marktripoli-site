// Career data types for mission control map integration

export interface CareerLocation {
  lat: number;
  lng: number;
  city?: string;
  region?: string;
  countryCode?: string;
}

export interface CareerMarker {
  id: string;
  type: 'work' | 'education' | 'military' | 'project';
  category: string; // For display grouping
  name: string;
  position?: string; // Job title or degree
  location: CareerLocation;
  startDate: string;
  endDate?: string;
  summary: string;
  highlights: string[];
  logo?: string; // Path to company/institution logo
  codename?: string; // Mission control style codename
  isCurrent?: boolean; // Still active position
  // Optional tech stacks and metadata
  skills?: string[];
  languages?: string[];
  frameworks?: string[];
  technologies?: string[];
}

export interface CareerMapData {
  markers: CareerMarker[];
  categories: {
    [key: string]: {
      color: string;
      icon: string;
      label: string;
    };
  };
}

// Resume JSON structure types (subset we need)
export interface ResumeWorkEntry {
  name: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  summary: string;
  highlights: string[];
  x_logo?: string;
  x_location?: {
    city?: string;
    region?: string;
    countryCode?: string;
    geo: {
      lat: number;
      lon: number;
    };
  };
}

export interface ResumeEducationEntry {
  institution: string;
  area: string;
  studyType: string;
  startDate?: string;
  endDate: string;
  x_logo?: string;
  x_location?: {
    city?: string;
    region?: string;
    countryCode?: string;
    geo: {
      lat: number;
      lon: number;
    };
  };
}

export interface ResumeData {
  work: ResumeWorkEntry[];
  education: ResumeEducationEntry[];
}
