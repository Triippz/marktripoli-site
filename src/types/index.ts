/**
 * Central export point for all Mission Control types
 * Provides clean, organized access to the complete type system
 */

// Core Mission Control Types
export type {
  // Basic types
  Coordinates,
  DateRange,
  MediaItem,
  ExternalLink,
  SiteType,
  EngagementType,
  SiteData,
  TelemetryEntry,
  Command,
  TerminalState,
  DossierTab,
  UserRank,
  MapView,
  
  // Enhanced Mission Control types
  SecurityClearance,
  OperationalStatus,
  MissionClassification,
  EnhancedSiteData,
  ExecutiveBriefing,
  TransformationMetadata,
  DataSyncState,
  EnhancedUserProgress,
} from './mission';

// JSON Resume Types
export type {
  // Standard JSON Resume Schema
  JsonResume,
  Basics,
  Location,
  Profile,
  Work,
  Volunteer,
  Education,
  Award,
  Publication,
  Skill,
  Language,
  Interest,
  Reference,
  Project,
  Meta,
  
  // Resume Processing Types
  ResumeDataState,
  ResumeDataError,
  ResumeCache,
  LocationMapping,
  
  // Enhanced Resume Types
  ResumeTransformConfig,
  SkillCategory,
  SkillWithProficiency,
  EnhancedWork,
  EnhancedProject,
  ResumeProcessingStage,
  ResumeProcessingStatus,
  ResumeValidation,
  BriefingGenerationConfig,
  GeneratedBriefing,
  ResumeProcessingCache,
  PerformanceMetrics,
} from './resume';

// Unified Mission Control System Types
export type {
  // Core State Management
  MissionControlState,
  MissionControlAction,
  MissionControlSelectors,
  MissionControlHooks,
  
  // User Experience
  UserPreferences,
  UserSession,
  
  // System Monitoring
  SystemHealthStatus,
  ComponentHealth,
  ErrorLogEntry,
  
  // Configuration
  MapConfiguration,
  ApiEndpoints,
} from './missionControlTypes';

// Type Guards and Utilities
export {
  isMissionControlState,
  isEnhancedSiteData,
  isExecutiveBriefing,
} from './missionControlTypes';

// =============================================================================
// CONVENIENCE TYPE ALIASES
// =============================================================================

/**
 * Common type combinations for easier usage
 */

// Data Layer Types (simplified without MissionControlState dependency)
export type DataLayer = {
  data: any;
  dataSync: any;
  resumeProcessing: any;
  validation: any;
};

// UI Layer Types  
export type UILayer = {
  ui: any;
};

// User Layer Types
export type UserLayer = {
  user: any;
};

// System Layer Types
export type SystemLayer = {
  telemetry: any;
  config: any;
};

// Complete Site Information
export type CompleteSiteInfo = SiteData & {
  isVisited: boolean;
  isBookmarked: boolean;
  lastViewed?: Date;
  viewCount: number;
  userNotes?: string[];
  customTags?: string[];
};

// Resume Integration Status
export type ResumeIntegrationStatus = {
  isConnected: boolean;
  lastSync: Date | null;
  dataQuality: number; // 0-100
  sitesGenerated: number;
  issuesCount: number;
  nextSyncAvailable: Date | null;
  syncInProgress: boolean;
  health: 'healthy' | 'warning' | 'error' | 'disconnected';
};

// Executive Summary Data
export type ExecutiveSummaryData = {
  profile: {
    callsign?: string;
    specialties?: string[];
    yearsOfService?: number;
  };
  metrics: {
    totalOperations?: number;
    successRate?: number;
  };
  topSkills: Array<{ name: string; proficiency: string; category: string }>;
  recentMissions: Array<{ name: string; role: string; duration: string; outcome: string }>;
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    nextAvailable?: Date;
    preferredContact: string;
  };
};

// Mission Control Dashboard Data
export type DashboardData = {
  summary: ExecutiveSummaryData;
  systemStatus: any;
  recentActivity: any[];
  userProgress: any;
  integrationHealth: ResumeIntegrationStatus;
  quickActions: Array<{
    id: string;
    label: string;
    description: string;
    action: string;
    enabled: boolean;
    priority: 'high' | 'medium' | 'low';
  }>;
};

// =============================================================================
// TYPE VALIDATION HELPERS
// =============================================================================

/**
 * Runtime type validation utilities for enhanced type safety
 */

export const TypeValidators = {
  isValidCoordinates: (obj: any): obj is Coordinates => {
    return obj && typeof obj.lat === 'number' && typeof obj.lng === 'number' &&
           obj.lat >= -90 && obj.lat <= 90 && obj.lng >= -180 && obj.lng <= 180;
  },

  isValidDateRange: (obj: any): obj is DateRange => {
    return obj && typeof obj.start === 'string' && 
           (!obj.end || typeof obj.end === 'string');
  },

  isValidSiteData: (obj: any): obj is SiteData => {
    return obj && typeof obj.id === 'string' && typeof obj.name === 'string' &&
           ['job', 'project', 'hobby'].includes(obj.type) &&
           TypeValidators.isValidCoordinates(obj.hq) &&
           typeof obj.briefing === 'string' &&
           Array.isArray(obj.deploymentLogs);
  },

  isValidEnhancedSiteData: (obj: any): obj is SiteData => {
    return TypeValidators.isValidSiteData(obj) &&
           (!obj.skills || Array.isArray(obj.skills)) &&
           (!obj.clearanceLevel || ['unclassified', 'confidential', 'secret', 'top-secret'].includes(obj.clearanceLevel));
  },

  isValidJsonResume: (obj: any): obj is any => {
    return obj && typeof obj === 'object' &&
           (!obj.basics || (obj.basics && typeof obj.basics === 'object')) &&
           (!obj.work || Array.isArray(obj.work)) &&
           (!obj.skills || Array.isArray(obj.skills));
  },

  isValidUserRank: (obj: any): obj is any => {
    return obj && typeof obj.level === 'number' && obj.level > 0 &&
           typeof obj.title === 'string' && typeof obj.badge === 'string';
  }
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Utility types for advanced TypeScript patterns
 */

// Extract all string literal types from a union
export type ExtractStrings<T> = T extends string ? T : never;

// Create a partial version of an interface with required fields
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Create a type that makes all properties optional except specified ones
export type OptionalExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

// Deep partial type for nested objects
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Type for async function return types
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : never;

// Create strongly typed event handlers
export type EventHandler<T = any> = (event: T) => void | Promise<void>;

// Mission Control specific event types
export type MissionControlEventHandler<T extends string = string> = 
  EventHandler<{ type: T; payload: any }>;

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Type-safe constants for Mission Control system
 */

export const SITE_TYPES = ['job', 'project', 'hobby'] as const;
export const ENGAGEMENT_TYPES = [
  'engage', 'deploy-uas', 'exfiltrate', 'integration-matrix', 
  'build-pipeline', 'scan-datacenter', 'dispatch-train', 'cbrn-protocol'
] as const;
export const SECURITY_CLEARANCES = ['unclassified', 'confidential', 'secret', 'top-secret'] as const;
export const OPERATIONAL_STATUSES = ['active', 'standby', 'terminated', 'archived'] as const;
export const MISSION_CLASSIFICATIONS = ['open-source', 'proprietary', 'classified'] as const;

export const SKILL_PROFICIENCY_LEVELS = ['novice', 'proficient', 'expert', 'master'] as const;
export const BRIEFING_TONES = ['professional', 'military', 'casual'] as const;
export const BRIEFING_DETAIL_LEVELS = ['executive', 'detailed', 'comprehensive'] as const;
export const BRIEFING_AUDIENCES = ['recruiter', 'technical', 'executive', 'general'] as const;

export const TELEMETRY_LEVELS = ['info', 'warning', 'success', 'error'] as const;
export const TERMINAL_STATES = ['idle', 'loading', 'viewing', 'tasking', 'briefing'] as const;
export const DOSSIER_TABS = ['briefing', 'logs', 'aar', 'media', 'skills', 'metrics'] as const;

// Type assertions for constants
export type SiteTypeConst = typeof SITE_TYPES[number];
export type EngagementTypeConst = typeof ENGAGEMENT_TYPES[number];
export type SecurityClearanceConst = typeof SECURITY_CLEARANCES[number];
export type OperationalStatusConst = typeof OPERATIONAL_STATUSES[number];
export type MissionClassificationConst = typeof MISSION_CLASSIFICATIONS[number];