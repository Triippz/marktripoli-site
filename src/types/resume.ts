// JSON Resume Schema interfaces
// Based on JSON Resume Schema https://jsonresume.org/schema/

export interface JsonResume {
  basics?: Basics;
  work?: Work[];
  volunteer?: Volunteer[];
  education?: Education[];
  awards?: Award[];
  publications?: Publication[];
  skills?: Skill[];
  languages?: Language[];
  interests?: Interest[];
  references?: Reference[];
  projects?: Project[];
  meta?: Meta;
}

export interface Basics {
  name?: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: Location;
  profiles?: Profile[];
}

export interface Location {
  address?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  region?: string;
}

export interface Profile {
  network?: string;
  username?: string;
  url?: string;
}

export interface Work {
  name?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  location?: string;
}

export interface Volunteer {
  organization?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
}

export interface Education {
  institution?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  courses?: string[];
  url?: string;
}

export interface Award {
  title?: string;
  date?: string;
  awarder?: string;
  summary?: string;
}

export interface Publication {
  name?: string;
  publisher?: string;
  releaseDate?: string;
  url?: string;
  summary?: string;
}

export interface Skill {
  name?: string;
  level?: string;
  keywords?: string[];
}

export interface Language {
  language?: string;
  fluency?: string;
}

export interface Interest {
  name?: string;
  keywords?: string[];
}

export interface Reference {
  name?: string;
  reference?: string;
}

export interface Project {
  name?: string;
  description?: string;
  highlights?: string[];
  keywords?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  roles?: string[];
  entity?: string;
  type?: string;
}

export interface Meta {
  canonical?: string;
  version?: string;
  lastModified?: string;
}

// Resume data loader specific types
export type ResumeDataState = 'idle' | 'loading' | 'loaded' | 'error';

export interface ResumeDataError {
  code: 'FETCH_ERROR' | 'PARSE_ERROR' | 'TRANSFORM_ERROR' | 'CACHE_ERROR';
  message: string;
  timestamp: Date;
  url?: string;
}

export interface ResumeCache {
  data: JsonResume;
  timestamp: Date;
  etag?: string;
  url: string;
}

export interface LocationMapping {
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone?: string;
}

// Enhanced resume types for Mission Control integration
export type ResumeTransformConfig = {
  // Field mapping preferences
  workPositionToTitle: boolean;
  highlightsToLogs: boolean;
  skillsToCapabilities: boolean;
  projectsToSites: boolean;
  
  // Data enrichment settings
  inferLocations: boolean;
  generateCodenames: boolean;
  classifyMissions: boolean;
  calculateMetrics: boolean;
  
  // Content generation
  militaryStyleSummaries: boolean;
  technicalDepthLevel: 'basic' | 'detailed' | 'expert';
  includeQuantifiedResults: boolean;
};

export type SkillCategory = {
  name: string;
  skills: SkillWithProficiency[];
  icon?: string;
  description?: string;
};

export type SkillWithProficiency = {
  name: string;
  level: 'novice' | 'proficient' | 'expert' | 'master';
  yearsExperience?: number;
  lastUsed?: string;
  certified?: boolean;
  keywords?: string[];
};

export type EnhancedWork = Work & {
  // Mission Control enhancements
  codename?: string;
  classification?: 'open-source' | 'proprietary' | 'classified';
  clearanceLevel?: 'unclassified' | 'confidential' | 'secret' | 'top-secret';
  operationalStatus?: 'active' | 'standby' | 'terminated' | 'archived';
  
  // Enhanced location data
  coordinates?: { lat: number; lng: number };
  timezone?: string;
  region?: 'CONUS' | 'OCONUS' | 'Remote';
  
  // Quantified impact
  metrics?: {
    teamSize?: number;
    budgetManaged?: string;
    revenueImpact?: string;
    costSavings?: string;
    usersImpacted?: number;
    performanceGains?: string;
  };
  
  // Skills and technologies
  primaryTech?: string[];
  secondaryTech?: string[];
  methodologies?: string[];
  
  // Social proof
  achievements?: string[];
  endorsements?: string[];
  mediaLinks?: string[];
};

export type EnhancedProject = Project & {
  // Mission Control theming
  codename?: string;
  missionType?: 'reconnaissance' | 'development' | 'research' | 'deployment';
  classification?: 'open-source' | 'proprietary' | 'classified';
  
  // Enhanced project data
  coordinates?: { lat: number; lng: number };
  techStack?: string[];
  methodology?: string;
  teamComposition?: string[];
  
  // Outcomes and metrics
  quantifiedResults?: string[];
  lessonsLearned?: string[];
  nextPhase?: string;
  
  // Links and media
  demoUrl?: string;
  repoUrl?: string;
  documentationUrl?: string;
  screenshots?: string[];
  videos?: string[];
};

// Resume processing pipeline types
export type ResumeProcessingStage = 
  | 'fetching'
  | 'parsing' 
  | 'validating'
  | 'enhancing'
  | 'transforming'
  | 'geocoding'
  | 'generating'
  | 'complete';

export type ResumeProcessingStatus = {
  stage: ResumeProcessingStage;
  progress: number; // 0-100
  message: string;
  warnings: string[];
  errors: string[];
  startTime: Date;
  duration?: number; // ms
};

export type ResumeValidation = {
  isValid: boolean;
  score: number; // 0-100 quality score
  issues: {
    severity: 'error' | 'warning' | 'info';
    field: string;
    message: string;
    suggestion?: string;
  }[];
  completeness: {
    basics: number;
    work: number;
    skills: number;
    education: number;
    projects: number;
    overall: number;
  };
};

// Executive briefing generation types
export type BriefingGenerationConfig = {
  includeMetrics: boolean;
  includeSkillMatrix: boolean;
  includeTimeline: boolean;
  includeLocation: boolean;
  includeClearance: boolean;
  
  // Content style
  tone: 'professional' | 'military' | 'casual';
  detailLevel: 'executive' | 'detailed' | 'comprehensive';
  audience: 'recruiter' | 'technical' | 'executive' | 'general';
  
  // Format preferences
  useCodenames: boolean;
  useMilitaryTime: boolean;
  useMetricSystem: boolean;
};

export type GeneratedBriefing = {
  config: BriefingGenerationConfig;
  generatedAt: Date;
  content: {
    executiveSummary: string;
    keyCapabilities: string[];
    recentMissions: string[];
    metricsHighlights: string[];
    nextObjectives?: string[];
  };
  metadata: {
    wordCount: number;
    readingTime: number; // minutes
    confidenceScore: number; // 0-100
    dataPoints: number;
  };
};

// Cache and performance types
export type ResumeProcessingCache = {
  [url: string]: {
    rawData: JsonResume;
    processedData: any;
    validation: ResumeValidation;
    briefing?: GeneratedBriefing;
    cachedAt: Date;
    expiresAt: Date;
    etag?: string;
    version: string;
  };
};

export type PerformanceMetrics = {
  fetchTime: number;
  parseTime: number;
  transformTime: number;
  renderTime: number;
  totalTime: number;
  cacheHit: boolean;
  dataSize: number;
  errors: number;
  warnings: number;
};