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
  username?: string;
}

export type MapView = {
  center: Coordinates;
  zoom: number;
  bearing: number;
  pitch: number;
}

// Enhanced types for JSON Resume integration
export type SecurityClearance = 'unclassified' | 'confidential' | 'secret' | 'top-secret';
export type OperationalStatus = 'active' | 'standby' | 'terminated' | 'archived';
export type MissionClassification = 'open-source' | 'proprietary' | 'classified';

// Extended SiteData with resume integration fields
export type EnhancedSiteData = SiteData & {
  // Resume data mapping
  resumeSourceId?: string; // Maps to work.name or project.name from JSON Resume
  skills?: string[]; // Technologies/skills used in this position
  achievements?: string[]; // Quantified accomplishments
  clearanceLevel?: SecurityClearance;
  classification?: MissionClassification;
  
  // Enhanced mission control fields
  operationalStatus?: OperationalStatus;
  organizationSize?: string; // e.g., "Fortune 500", "Startup", "Agency"
  teamSize?: number;
  budgetImpact?: string; // e.g., "$2.5M cost savings"
  
  // Location intelligence
  timezone?: string;
  region?: 'CONUS' | 'OCONUS' | 'Remote';
  
  // Social proof
  endorsements?: string[];
  references?: string[];
};

// Executive briefing data structure
export type ExecutiveBriefing = {
  // Core profile
  operatorProfile: {
    callsign: string;
    rank: string;
    specialties: string[];
    clearanceLevel: SecurityClearance;
    yearsOfService: number;
    location: string;
  };
  
  // Mission summary
  missionSummary: {
    totalOperations: number;
    activeDeployments: number;
    completedMissions: number;
    successRate: string;
    primaryAOR: string; // Area of Responsibility
  };
  
  // Core competencies (skills)
  coreCompetencies: {
    technical: {
      category: string;
      proficiency: 'novice' | 'proficient' | 'expert' | 'master';
      technologies: string[];
      yearsExperience: number;
    }[];
    operational: string[];
    leadership: string[];
  };
  
  // Recent deployments (work history)
  recentDeployments: {
    id: string;
    codename: string;
    organization: string;
    role: string;
    duration: DateRange;
    classification: MissionClassification;
    keyOutcomes: string[];
    location: string;
  }[];
  
  // Notable achievements
  commendations: {
    title: string;
    organization: string;
    date: string;
    description?: string;
  }[];
  
  // Education & certifications
  training: {
    formal: {
      institution: string;
      degree: string;
      field: string;
      completed: string;
    }[];
    certifications: {
      name: string;
      issuer: string;
      obtained: string;
      expires?: string;
      verificationId?: string;
    }[];
  };
  
  // Contact protocols
  contactProtocols: {
    primary: string; // email
    secondary?: string; // phone
    socialChannels: {
      platform: string;
      handle: string;
      url: string;
      classification: 'public' | 'professional' | 'restricted';
    }[];
  };
};

// Resume to Mission Control transformation metadata
export type TransformationMetadata = {
  sourceUrl: string;
  transformedAt: Date;
  version: string;
  mappingRules: {
    workToJob: boolean;
    projectsToProject: boolean;
    skillsToCapabilities: boolean;
    educationToTraining: boolean;
  };
  qualityScore: number; // 0-100 based on data completeness
  warnings: string[];
};

// Data loading and synchronization states
export type DataSyncState = {
  isOnline: boolean;
  lastSync: Date | null;
  syncInProgress: boolean;
  pendingChanges: number;
  conflicts: {
    field: string;
    localValue: any;
    remoteValue: any;
    resolvedWith?: 'local' | 'remote' | 'merged';
  }[];
};

// Enhanced user progress with resume integration
export type EnhancedUserProgress = {
  profileCompleteness: number; // 0-100%
  dataFreshness: {
    resumeAge: number; // days since last resume update
    siteDataAge: number; // days since last site data update
    stalenessLevel: 'fresh' | 'aging' | 'stale' | 'critical';
  };
  integrationHealth: {
    resumeLinked: boolean;
    sitesGenerated: number;
    manualOverrides: number;
    dataConflicts: number;
  };
};