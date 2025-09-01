/**
 * React Hook Type Definitions for Mission Control
 * Provides type-safe interfaces for all custom hooks
 */

import type {
  EnhancedSiteData,
  ExecutiveBriefing,
  JsonResume,
  ResumeDataState,
  ResumeDataError,
  SkillCategory,
  MissionControlState,
  UserRank,
  TelemetryEntry,
  Command,
  SystemHealthStatus,
  PerformanceMetrics,
  ResumeTransformConfig,
  BriefingGenerationConfig,
  EnhancedUserProgress,
  UserPreferences,
  UserSession,
  MapView,
  Coordinates,
  TransformationResult,
  QualityAssessment
} from './index';

// =============================================================================
// CORE DATA HOOKS
// =============================================================================

export interface UseMissionDataReturn {
  // Current data state
  sites: EnhancedSiteData[];
  resumeData: JsonResume | null;
  executiveBriefing: ExecutiveBriefing | null;
  skillCategories: SkillCategory[];
  
  // Loading states
  isLoading: boolean;
  isResumeLoading: boolean;
  isBriefingLoading: boolean;
  
  // Error states
  error: ResumeDataError | null;
  
  // Actions
  loadResumeData: (url: string, config?: ResumeTransformConfig) => Promise<void>;
  refreshData: () => Promise<void>;
  generateBriefing: (config?: BriefingGenerationConfig) => Promise<void>;
  clearData: () => void;
  
  // Metadata
  lastUpdated: Date | null;
  dataQuality: number;
  transformationHealth: 'healthy' | 'warning' | 'error';
}

export interface UseSelectedSiteReturn {
  selectedSite: EnhancedSiteData | null;
  selectSite: (site: EnhancedSiteData | null) => void;
  isSelected: (siteId: string) => boolean;
  clearSelection: () => void;
  
  // Related data
  relatedSites: EnhancedSiteData[];
  similarSkills: string[];
  
  // Actions
  visitSite: (siteId: string) => void;
  bookmarkSite: (siteId: string) => void;
  isVisited: (siteId: string) => boolean;
  isBookmarked: (siteId: string) => boolean;
}

export interface UseResumeDataReturn {
  data: JsonResume | null;
  state: ResumeDataState;
  error: ResumeDataError | null;
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  isLoaded: boolean;
  
  // Actions
  load: (url: string, config?: ResumeTransformConfig) => Promise<void>;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  clear: () => void;
  
  // Configuration
  config: ResumeTransformConfig;
  updateConfig: (config: Partial<ResumeTransformConfig>) => void;
  
  // Quality metrics
  quality: QualityAssessment | null;
  completeness: number;
  lastUpdated: Date | null;
}

export interface UseSkillMatrixReturn {
  categories: SkillCategory[];
  
  // Computed data
  allSkills: Array<{
    name: string;
    category: string;
    proficiency: string;
    yearsExperience?: number;
    projectCount: number;
  }>;
  
  // Filtering and searching
  filterByCategory: (category: string) => SkillCategory | undefined;
  searchSkills: (query: string) => string[];
  getSkillsByProficiency: (level: string) => string[];
  
  // Related functionality
  getRelatedSites: (skill: string) => EnhancedSiteData[];
  getSkillUsage: (skill: string) => {
    totalProjects: number;
    recentUsage: Date | null;
    primaryCategory: string;
  };
}

// =============================================================================
// UI STATE HOOKS
// =============================================================================

export interface UseUIStateReturn {
  // Current UI state
  terminalState: MissionControlState['ui']['terminalState'];
  activeTab: MissionControlState['ui']['activeTab'];
  briefingMode: MissionControlState['ui']['briefingMode'];
  theme: MissionControlState['ui']['theme'];
  
  // Display preferences
  soundEnabled: boolean;
  hudVisible: boolean;
  animationsEnabled: boolean;
  debugMode: boolean;
  
  // Actions
  setTerminalState: (state: MissionControlState['ui']['terminalState']) => void;
  setActiveTab: (tab: MissionControlState['ui']['activeTab']) => void;
  setBriefingMode: (mode: MissionControlState['ui']['briefingMode']) => void;
  setTheme: (theme: MissionControlState['ui']['theme']) => void;
  
  // Toggles
  toggleSound: () => void;
  toggleHUD: () => void;
  toggleAnimations: () => void;
  toggleDebug: () => void;
  
  // Computed states
  isInteractive: boolean;
  canExecuteCommands: boolean;
  showAdvancedFeatures: boolean;
}

export interface UseMapStateReturn {
  // Current map state
  mapView: MapView;
  selectedSite: EnhancedSiteData | null;
  
  // Actions
  setMapView: (view: MapView) => void;
  panTo: (coordinates: Coordinates) => void;
  zoomTo: (level: number) => void;
  fitBounds: (bounds: [Coordinates, Coordinates]) => void;
  resetView: () => void;
  
  // Site interactions
  selectSite: (site: EnhancedSiteData | null) => void;
  hoverSite: (siteId: string | null) => void;
  
  // Computed data
  visibleSites: EnhancedSiteData[];
  clusteredSites: Array<{
    center: Coordinates;
    count: number;
    sites: EnhancedSiteData[];
  }>;
  
  // Map utilities
  isInView: (coordinates: Coordinates) => boolean;
  getDistance: (from: Coordinates, to: Coordinates) => number;
  getBounds: () => [Coordinates, Coordinates];
}

// =============================================================================
// USER EXPERIENCE HOOKS
// =============================================================================

export interface UseUserProgressReturn {
  // Current progress
  progress: EnhancedUserProgress;
  rank: UserRank;
  visitedSites: string[];
  unlockedEasterEggs: string[];
  
  // Computed stats
  completionPercentage: number;
  totalSites: number;
  nextRankProgress: number;
  isMaxRank: boolean;
  
  // Actions
  visitSite: (siteId: string) => void;
  unlockEasterEgg: (id: string) => void;
  
  // Session data
  session: UserSession;
  timeSpent: number;
  pagesViewed: number;
  
  // Achievements
  recentAchievements: Array<{
    id: string;
    title: string;
    description: string;
    unlockedAt: Date;
  }>;
}

export interface UseUserPreferencesReturn {
  preferences: UserPreferences;
  
  // Update actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetToDefaults: () => void;
  
  // Specific preference updates
  setDisplayPreference: (key: keyof UserPreferences, value: any) => void;
  setAccessibilityPreference: (key: string, value: boolean) => void;
  setPrivacyPreference: (key: string, value: boolean) => void;
  
  // Computed preferences
  effectiveTheme: string;
  shouldShowAnimations: boolean;
  shouldPlaySounds: boolean;
  accessibilityMode: boolean;
}

// =============================================================================
// SYSTEM MONITORING HOOKS
// =============================================================================

export interface UseTelemetryReturn {
  // Current telemetry
  logs: TelemetryEntry[];
  commandHistory: Command[];
  
  // Actions
  addTelemetry: (entry: Omit<TelemetryEntry, 'timestamp'>) => void;
  clearTelemetry: () => void;
  executeCommand: (input: string) => void;
  
  // Filtering and searching
  getLogsByLevel: (level: string) => TelemetryEntry[];
  getRecentLogs: (count?: number) => TelemetryEntry[];
  searchLogs: (query: string) => TelemetryEntry[];
  
  // Statistics
  stats: {
    errorCount: number;
    warningCount: number;
    successCount: number;
    infoCount: number;
    totalCommands: number;
  };
  
  // Real-time updates
  isReceivingUpdates: boolean;
  lastUpdate: Date | null;
}

export interface UseSystemHealthReturn {
  // Current health status
  health: SystemHealthStatus;
  
  // Component health
  isHealthy: boolean;
  degradedComponents: string[];
  criticalComponents: string[];
  
  // Performance metrics
  performance: PerformanceMetrics | null;
  
  // Actions
  refreshHealth: () => Promise<void>;
  acknowledgeIssues: (componentIds: string[]) => void;
  
  // History and trends
  healthHistory: Array<{
    timestamp: Date;
    overall: string;
    details: Record<string, any>;
  }>;
  
  // Alerts
  activeAlerts: Array<{
    id: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
    acknowledged: boolean;
  }>;
}

// =============================================================================
// EXECUTIVE BRIEFING HOOKS
// =============================================================================

export interface UseExecutiveBriefingReturn {
  // Current briefing
  briefing: ExecutiveBriefing | null;
  isLoading: boolean;
  error: string | null;
  
  // Generation
  generate: (config?: BriefingGenerationConfig) => Promise<void>;
  regenerate: () => Promise<void>;
  
  // Configuration
  config: BriefingGenerationConfig;
  updateConfig: (config: Partial<BriefingGenerationConfig>) => void;
  
  // Export options
  exportAsPDF: () => Promise<Blob>;
  exportAsMarkdown: () => string;
  exportAsJSON: () => string;
  
  // Customization
  customizeSections: (sections: string[]) => void;
  setAudience: (audience: string) => void;
  setDetailLevel: (level: string) => void;
  
  // Metadata
  lastGenerated: Date | null;
  generationDuration: number;
  dataCompleteness: number;
  confidence: number;
}

// =============================================================================
// ADVANCED FUNCTIONALITY HOOKS
// =============================================================================

export interface UseDataTransformationReturn {
  // Transformation state
  isTransforming: boolean;
  transformationProgress: number;
  transformationStage: string;
  
  // Results
  lastTransformation: TransformationResult<any> | null;
  transformationHistory: Array<{
    timestamp: Date;
    type: string;
    success: boolean;
    duration: number;
  }>;
  
  // Actions
  transformWork: (workData: any, config?: ResumeTransformConfig) => Promise<void>;
  transformProjects: (projectData: any, config?: ResumeTransformConfig) => Promise<void>;
  batchTransform: (data: any[], type: string) => Promise<void>;
  
  // Configuration
  transformConfig: ResumeTransformConfig;
  updateTransformConfig: (config: Partial<ResumeTransformConfig>) => void;
  
  // Quality metrics
  dataQuality: QualityAssessment | null;
  improvementSuggestions: Array<{
    field: string;
    suggestion: string;
    impact: number;
  }>;
}

export interface UseSearchAndFilterReturn {
  // Search state
  searchQuery: string;
  searchResults: EnhancedSiteData[];
  isSearching: boolean;
  
  // Filter state
  activeFilters: Record<string, any>;
  availableFilters: Array<{
    key: string;
    label: string;
    type: 'select' | 'multi-select' | 'range' | 'toggle';
    options?: any[];
  }>;
  
  // Actions
  search: (query: string) => void;
  clearSearch: () => void;
  addFilter: (key: string, value: any) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  
  // Advanced search
  searchBySkills: (skills: string[]) => EnhancedSiteData[];
  searchByDateRange: (start: Date, end: Date) => EnhancedSiteData[];
  searchByLocation: (coordinates: Coordinates, radius: number) => EnhancedSiteData[];
  
  // Saved searches
  saveSearch: (name: string, query: string, filters: Record<string, any>) => void;
  loadSavedSearch: (name: string) => void;
  deleteSavedSearch: (name: string) => void;
  savedSearches: Array<{
    name: string;
    query: string;
    filters: Record<string, any>;
    createdAt: Date;
  }>;
}

// =============================================================================
// HOOK COMPOSITION UTILITIES
// =============================================================================

export interface UseMissionControlReturn {
  // Composed data
  data: UseMissionDataReturn;
  ui: UseUIStateReturn;
  user: UseUserProgressReturn;
  map: UseMapStateReturn;
  telemetry: UseTelemetryReturn;
  health: UseSystemHealthReturn;
  
  // Combined actions
  engageSite: (site: EnhancedSiteData) => void;
  completeMission: (siteId: string) => void;
  resetAllSystems: () => void;
  
  // Global state
  isReady: boolean;
  isOffline: boolean;
  maintenanceMode: boolean;
  
  // Performance
  renderMetrics: {
    lastRenderTime: number;
    averageRenderTime: number;
    componentRenderCount: Record<string, number>;
  };
}

// Type guard utilities for hooks
export const HookTypeGuards = {
  isUseMissionDataReturn: (obj: any): obj is UseMissionDataReturn => {
    return obj && Array.isArray(obj.sites) && typeof obj.isLoading === 'boolean';
  },
  
  isUseSelectedSiteReturn: (obj: any): obj is UseSelectedSiteReturn => {
    return obj && typeof obj.selectSite === 'function' && typeof obj.isSelected === 'function';
  },
  
  isUseResumeDataReturn: (obj: any): obj is UseResumeDataReturn => {
    return obj && typeof obj.state === 'string' && typeof obj.load === 'function';
  }
};