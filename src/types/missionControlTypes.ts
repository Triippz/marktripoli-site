/**
 * Unified Mission Control Type System
 * Combines JSON Resume data with Mission Control theming for comprehensive type safety
 */

import type { 
  SiteData, 
  EnhancedSiteData, 
  ExecutiveBriefing, 
  TransformationMetadata,
  DataSyncState,
  EnhancedUserProgress,
  TelemetryEntry,
  Command,
  UserRank,
  MapView,
  Coordinates
} from './mission';

import type { 
  JsonResume,
  ResumeDataState,
  ResumeDataError,
  ResumeTransformConfig,
  SkillCategory,
  SkillWithProficiency,
  EnhancedWork,
  EnhancedProject,
  ResumeProcessingStatus,
  ResumeValidation,
  BriefingGenerationConfig,
  GeneratedBriefing,
  PerformanceMetrics
} from './resume';

// =============================================================================
// CORE MISSION CONTROL STATE
// =============================================================================

/**
 * Complete Mission Control application state
 * Unifies all data sources and UI state management
 */
export interface MissionControlState {
  // Data Layer
  data: {
    sites: EnhancedSiteData[];
    resumeData: JsonResume | null;
    executiveBriefing: ExecutiveBriefing | null;
    skillCategories: SkillCategory[];
    transformationMetadata: TransformationMetadata | null;
  };

  // Data Management
  dataSync: DataSyncState;
  resumeProcessing: ResumeProcessingStatus | null;
  validation: ResumeValidation | null;
  performance: PerformanceMetrics | null;

  // UI State
  ui: {
    selectedSite: EnhancedSiteData | null;
    mapView: MapView;
    terminalState: 'idle' | 'loading' | 'viewing' | 'tasking' | 'briefing';
    currentDossier: EnhancedSiteData | null;
    activeTab: 'briefing' | 'logs' | 'aar' | 'media' | 'skills' | 'metrics';
    briefingMode: 'interactive' | 'executive' | 'technical';
    
    // Display preferences
    theme: 'classic' | 'modern' | 'high-contrast';
    soundEnabled: boolean;
    hudVisible: boolean;
    animationsEnabled: boolean;
    debugMode: boolean;
  };

  // User Experience
  user: {
    visitedSites: string[];
    unlockedEasterEggs: string[];
    userRank: UserRank;
    progress: EnhancedUserProgress;
    preferences: UserPreferences;
    session: UserSession;
  };

  // System Monitoring
  telemetry: {
    logs: TelemetryEntry[];
    commandHistory: Command[];
    systemHealth: SystemHealthStatus;
    errorLog: ErrorLogEntry[];
  };

  // Configuration
  config: {
    resumeUrl: string | null;
    transformConfig: ResumeTransformConfig;
    briefingConfig: BriefingGenerationConfig;
    mapConfig: MapConfiguration;
    apiEndpoints: ApiEndpoints;
  };
}

// =============================================================================
// USER EXPERIENCE TYPES
// =============================================================================

export interface UserPreferences {
  // Display
  preferredView: 'map' | 'list' | 'timeline';
  defaultZoom: number;
  animationSpeed: 'slow' | 'normal' | 'fast' | 'disabled';
  
  // Content
  showTechnicalDetails: boolean;
  showMetrics: boolean;
  showClassifiedMissions: boolean;
  useCodenames: boolean;
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  
  // Privacy
  trackAnalytics: boolean;
  shareUsageData: boolean;
  enableTelemetry: boolean;
}

export interface UserSession {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  pageViews: number;
  sitesVisited: string[];
  commandsExecuted: number;
  timeSpentBySection: Record<string, number>; // seconds
  
  // Feature usage
  featuresUsed: string[];
  experimentsActive: string[];
  performanceFlags: string[];
}

// =============================================================================
// SYSTEM MONITORING
// =============================================================================

export interface SystemHealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  components: {
    dataLoader: ComponentHealth;
    mapRenderer: ComponentHealth;
    terminal: ComponentHealth;
    audioSystem: ComponentHealth;
    cacheManager: ComponentHealth;
  };
  lastCheck: Date;
  uptime: number; // milliseconds
}

export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'error' | 'disabled';
  message?: string;
  lastError?: Date;
  metrics?: {
    responseTime?: number;
    errorRate?: number;
    memoryUsage?: number;
  };
}

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  component: string;
  message: string;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  context?: Record<string, any>;
  resolved?: boolean;
  resolutionNotes?: string;
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface MapConfiguration {
  provider: 'mapbox' | 'openstreetmap' | 'satellite';
  style: string;
  defaultCenter: Coordinates;
  defaultZoom: number;
  maxZoom: number;
  minZoom: number;
  
  // Features
  enableClustering: boolean;
  enableHeatmap: boolean;
  enableTerrain: boolean;
  enable3D: boolean;
  
  // Performance
  tileSize: 256 | 512;
  maxPitch: number;
  maxBounds?: [Coordinates, Coordinates];
  rtlTextPlugin?: string;
}

export interface ApiEndpoints {
  resumeData?: string;
  geocoding?: string;
  skillsDatabase?: string;
  companyData?: string;
  analytics?: string;
  errorReporting?: string;
  
  // Authentication
  auth?: {
    login: string;
    logout: string;
    refresh: string;
    profile: string;
  };
}

// =============================================================================
// ACTION TYPES
// =============================================================================

/**
 * All possible actions in the Mission Control system
 * Used for type-safe state management and action logging
 */
export type MissionControlAction = 
  // Data Actions
  | { type: 'LOAD_RESUME_DATA'; payload: { url: string; config?: ResumeTransformConfig } }
  | { type: 'RESUME_DATA_LOADED'; payload: { data: JsonResume; sites: EnhancedSiteData[] } }
  | { type: 'RESUME_DATA_ERROR'; payload: { error: ResumeDataError } }
  | { type: 'GENERATE_BRIEFING'; payload: { config: BriefingGenerationConfig } }
  | { type: 'BRIEFING_GENERATED'; payload: { briefing: ExecutiveBriefing } }
  | { type: 'UPDATE_SITE'; payload: { siteId: string; updates: Partial<EnhancedSiteData> } }
  
  // UI Actions
  | { type: 'SELECT_SITE'; payload: { site: EnhancedSiteData | null } }
  | { type: 'SET_MAP_VIEW'; payload: { view: MapView } }
  | { type: 'SET_TERMINAL_STATE'; payload: { state: MissionControlState['ui']['terminalState'] } }
  | { type: 'SET_ACTIVE_TAB'; payload: { tab: MissionControlState['ui']['activeTab'] } }
  | { type: 'SET_BRIEFING_MODE'; payload: { mode: MissionControlState['ui']['briefingMode'] } }
  | { type: 'TOGGLE_HUD' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_THEME'; payload: { theme: MissionControlState['ui']['theme'] } }
  
  // User Actions
  | { type: 'VISIT_SITE'; payload: { siteId: string } }
  | { type: 'UNLOCK_EASTER_EGG'; payload: { id: string } }
  | { type: 'UPDATE_PREFERENCES'; payload: { preferences: Partial<UserPreferences> } }
  | { type: 'EXECUTE_COMMAND'; payload: { command: Command } }
  
  // System Actions
  | { type: 'ADD_TELEMETRY'; payload: { entry: Omit<TelemetryEntry, 'timestamp'> } }
  | { type: 'LOG_ERROR'; payload: { error: Omit<ErrorLogEntry, 'id' | 'timestamp'> } }
  | { type: 'UPDATE_SYSTEM_HEALTH'; payload: { health: SystemHealthStatus } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'SYNC_DATA' }
  | { type: 'EXPORT_DATA' }
  | { type: 'IMPORT_DATA'; payload: { data: Partial<MissionControlState> } };

// =============================================================================
// COMPUTED SELECTORS
// =============================================================================

/**
 * Computed data selectors for complex state derivations
 * These provide type-safe access to calculated values
 */
export interface MissionControlSelectors {
  // Data selectors
  getSiteById: (id: string) => EnhancedSiteData | undefined;
  getSitesByType: (type: SiteData['type']) => EnhancedSiteData[];
  getSkillsByCategory: (category: string) => SkillWithProficiency[];
  getRecentWork: (count?: number) => EnhancedWork[];
  getFeaturedProjects: (count?: number) => EnhancedProject[];
  
  // User progress selectors
  getCompletionPercentage: () => number;
  getUserStats: () => {
    totalSites: number;
    visitedSites: number;
    completionRate: number;
    currentRank: UserRank;
    nextRankProgress: number;
  };
  
  // System selectors
  getSystemStatus: () => SystemHealthStatus['overall'];
  getRecentTelemetry: (count?: number) => TelemetryEntry[];
  getPerformanceMetrics: () => PerformanceMetrics | null;
  
  // Map selectors
  getVisibleSites: (bounds: [Coordinates, Coordinates]) => EnhancedSiteData[];
  getSiteClusters: (zoom: number) => Array<{
    center: Coordinates;
    count: number;
    sites: EnhancedSiteData[];
  }>;
}

// =============================================================================
// HOOKS AND UTILITIES
// =============================================================================

/**
 * Type-safe hook interfaces for React components
 */
export interface MissionControlHooks {
  // Core state hooks
  useMissionData: () => MissionControlState['data'];
  useUIState: () => MissionControlState['ui'];
  useUserState: () => MissionControlState['user'];
  useTelemetry: () => MissionControlState['telemetry'];
  
  // Specific data hooks
  useSelectedSite: () => EnhancedSiteData | null;
  useResumeData: () => {
    data: JsonResume | null;
    state: ResumeDataState;
    error: ResumeDataError | null;
    isLoading: boolean;
  };
  useExecutiveBriefing: () => ExecutiveBriefing | null;
  useSkillMatrix: () => SkillCategory[];
  
  // Action hooks
  useMissionActions: () => {
    loadResumeData: (url: string) => Promise<void>;
    selectSite: (site: EnhancedSiteData | null) => void;
    generateBriefing: (config?: BriefingGenerationConfig) => Promise<void>;
    updateSite: (siteId: string, updates: Partial<EnhancedSiteData>) => void;
    executeCommand: (input: string) => void;
  };
  
  // Computed hooks
  useUserProgress: () => EnhancedUserProgress;
  useSystemHealth: () => SystemHealthStatus;
  usePerformanceMetrics: () => PerformanceMetrics | null;
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export * from './mission';
export * from './resume';

// Type guards and utilities
export const isMissionControlState = (obj: any): obj is MissionControlState => {
  return obj && typeof obj === 'object' && 'data' in obj && 'ui' in obj && 'user' in obj;
};

export const isEnhancedSiteData = (obj: any): obj is EnhancedSiteData => {
  return obj && typeof obj === 'object' && 'id' in obj && 'type' in obj && 'name' in obj;
};

export const isExecutiveBriefing = (obj: any): obj is ExecutiveBriefing => {
  return obj && typeof obj === 'object' && 'operatorProfile' in obj && 'missionSummary' in obj;
};