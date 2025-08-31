// Core data types for Mission Control site
export type Coordinates = {
  lat: number;
  lng: number;
}

export type DateRange = {
  start: string;
  end?: string;
}

export type MediaItem = {
  type: 'image' | 'video' | 'link';
  url: string;
  caption?: string;
  thumbnail?: string;
}

export type ExternalLink = {
  label: string;
  url: string;
  type?: 'github' | 'demo' | 'docs' | 'other';
}

export type SiteType = 'job' | 'project' | 'hobby';
export type EngagementType = 'engage' | 'deploy-uas' | 'exfiltrate' | 'integration-matrix' | 'build-pipeline' | 'scan-datacenter' | 'dispatch-train' | 'cbrn-protocol';

export type SiteData = {
  id: string;
  type: SiteType;
  name: string;
  codename?: string;
  hq: Coordinates;
  period?: DateRange;
  briefing: string;
  deploymentLogs: string[];
  afterAction?: string[];
  media?: MediaItem[];
  links?: ExternalLink[];
  engagementType?: EngagementType;
  icon?: string;
}

export type TelemetryEntry = {
  timestamp: Date;
  source: string;
  message: string;
  level: 'info' | 'warning' | 'success' | 'error';
}

export type Command = {
  input: string;
  timestamp: Date;
  result?: string;
  error?: string;
}

export type TerminalState = 'idle' | 'loading' | 'viewing' | 'tasking';
export type DossierTab = 'briefing' | 'logs' | 'aar' | 'media';

export type UserRank = {
  level: number;
  title: string;
  badge: string;
}

export type MapView = {
  center: Coordinates;
  zoom: number;
  bearing: number;
  pitch: number;
}