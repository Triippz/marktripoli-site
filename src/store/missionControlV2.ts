import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createMapSlice, type MapSlice } from './slices/mapSlice';
import { createTerminalSlice, type TerminalSlice } from './slices/terminalSlice';
import { createUserSlice, type UserSlice } from './slices/userSlice';
import { createTelemetrySlice, type TelemetrySlice } from './slices/telemetrySlice';
import { createUISlice, type UISlice } from './slices/uiSlice';
import { createDataSlice, type DataSlice } from './slices/dataSlice';

// Combined store type
export type MissionControlStore = MapSlice & TerminalSlice & UserSlice & TelemetrySlice & UISlice & DataSlice;

// Create the combined store
export const useMissionControlV2 = create<MissionControlStore>()(
  persist(
    (...a) => ({
      ...createMapSlice(...a),
      ...createTerminalSlice(...a),
      ...createUserSlice(...a),
      ...createTelemetrySlice(...a),
      ...createUISlice(...a),
      ...createDataSlice(...a),
    }),
    {
      name: 'mission-control-store',
      partialize: (state) => ({
        // Only persist certain parts of the state
        visitedSites: state.visitedSites,
        unlockedEasterEggs: state.unlockedEasterEggs,
        userRank: state.userRank,
        soundEnabled: state.soundEnabled,
        theme: state.theme,
        mapView: state.mapView,
        resumeUrl: state.resumeUrl,
        lastResumeUpdate: state.lastResumeUpdate,
        
        // Enhanced persistence fields
        transformConfig: state.transformConfig,
        briefingConfig: state.briefingConfig,
        skillCategories: state.skillCategories,
        executiveBriefing: state.executiveBriefing,
      }),
    }
  )
);

// Make store globally accessible for error boundaries and other utilities
if (typeof window !== 'undefined') {
  (window as any).useMissionControlV2 = useMissionControlV2;
}

// Individual slice hooks for better performance
export const useMapStore = () => useMissionControlV2(state => ({
  selectedSite: state.selectedSite,
  mapView: state.mapView,
  selectSite: state.selectSite,
  setMapView: state.setMapView,
}));

export const useTerminalStore = () => useMissionControlV2(state => ({
  terminalState: state.terminalState,
  currentDossier: state.currentDossier,
  activeTab: state.activeTab,
  commandHistory: state.commandHistory,
  setTerminalState: state.setTerminalState,
  setCurrentDossier: state.setCurrentDossier,
  setActiveTab: state.setActiveTab,
  addCommand: state.addCommand,
}));

export const useUserStore = () => useMissionControlV2(state => ({
  visitedSites: state.visitedSites,
  unlockedEasterEggs: state.unlockedEasterEggs,
  userRank: state.userRank,
  visitSite: state.visitSite,
  unlockEasterEgg: state.unlockEasterEgg,
  calculateRank: state.calculateRank,
}));

export const useTelemetryStore = () => useMissionControlV2(state => ({
  telemetryLogs: state.telemetryLogs,
  addTelemetry: state.addTelemetry,
  clearTelemetry: state.clearTelemetry,
  getTelemetryByLevel: state.getTelemetryByLevel,
}));

export const useUIStore = () => useMissionControlV2(state => ({
  soundEnabled: state.soundEnabled,
  hudVisible: state.hudVisible,
  theme: state.theme,
  toggleSound: state.toggleSound,
  toggleHUD: state.toggleHUD,
  setTheme: state.setTheme,
}));

// Memoized selector to prevent infinite re-renders
const dataStoreSelector = (state: any) => ({
  // Core data
  sites: state.sites,
  resumeData: state.resumeData,
  resumeDataState: state.resumeDataState,
  resumeDataError: state.resumeDataError,
  lastResumeUpdate: state.lastResumeUpdate,
  resumeUrl: state.resumeUrl,
  
  // Enhanced data
  executiveBriefing: state.executiveBriefing,
  skillCategories: state.skillCategories,
  transformationMetadata: state.transformationMetadata,
  dataSync: state.dataSync,
  
  // Processing state
  processingStatus: state.processingStatus,
  validation: state.validation,
  generatedBriefing: state.generatedBriefing,
  performanceMetrics: state.performanceMetrics,
  
  // Configuration
  transformConfig: state.transformConfig,
  briefingConfig: state.briefingConfig,
  
  // Core actions
  loadResumeData: state.loadResumeData,
  refreshResumeData: state.refreshResumeData,
  setSites: state.setSites,
  addSite: state.addSite,
  removeSite: state.removeSite,
  updateSite: state.updateSite,
  clearResumeData: state.clearResumeData,
  retryResumeLoad: state.retryResumeLoad,
  
  // Enhanced actions
  generateExecutiveBriefing: state.generateExecutiveBriefing,
  updateTransformConfig: state.updateTransformConfig,
  updateBriefingConfig: state.updateBriefingConfig,
  validateResumeData: state.validateResumeData,
  syncDataState: state.syncDataState,
  enrichSiteData: state.enrichSiteData,
  
  // Selectors
  getSiteById: state.getSiteById,
  getSitesByType: state.getSitesByType,
  getWorkSites: state.getWorkSites,
  getProjectSites: state.getProjectSites,
  getHobbySites: state.getHobbySites,
  getSkillsByCategory: state.getSkillsByCategory,
  getSitesBySkill: state.getSitesBySkill,
  getRecentWork: state.getRecentWork,
  getFeaturedProjects: state.getFeaturedProjects,
  getDataQualityScore: state.getDataQualityScore,
  getTransformationHealth: state.getTransformationHealth,
});

export const useDataStore = () => useMissionControlV2(dataStoreSelector);

// Computed selectors for complex state derivations
export const useUserStats = () => useMissionControlV2(state => {
  const totalSites = state.visitedSites.length;
  const totalEasterEggs = state.unlockedEasterEggs.length;
  const completionPercentage = Math.round((totalSites / 8) * 100); // Assuming 8 total sites
  
  return {
    totalSites,
    totalEasterEggs,
    completionPercentage,
    currentRank: state.userRank,
    isMaxRank: state.userRank.level >= 3,
  };
});

export const useRecentTelemetry = (count: number = 5) => useMissionControlV2(state => 
  state.telemetryLogs.slice(-count)
);

export const useTelemetryStats = () => useMissionControlV2(state => {
  const errors = state.telemetryLogs.filter(log => log.level === 'error').length;
  const successes = state.telemetryLogs.filter(log => log.level === 'success').length;
  const warnings = state.telemetryLogs.filter(log => log.level === 'warning').length;
  const info = state.telemetryLogs.filter(log => log.level === 'info').length;
  
  return { errors, successes, warnings, info };
});

// Actions that span multiple slices
export const useCombinedActions = () => useMissionControlV2(state => ({
  // Select site and set terminal state
  engageSite: (site: any) => {
    state.selectSite(site);
    state.setTerminalState('loading');
    state.visitSite(site.id);
    state.addTelemetry({
      source: 'SYSTEM',
      message: `Engaging target: ${site.codename || site.name}`,
      level: 'success'
    });
  },
  
  // Complete mission engagement
  completeMission: (site: any) => {
    state.setTerminalState('viewing');
    state.setCurrentDossier(site);
    state.addTelemetry({
      source: 'MISSION',
      message: `Mission completed: ${site.codename || site.name}`,
      level: 'success'
    });
  },
  
  // Reset all systems
  resetAllSystems: () => {
    state.selectSite(null);
    state.setTerminalState('idle');
    state.setCurrentDossier(null);
    state.setActiveTab('briefing');
    state.clearTelemetry();
    state.addTelemetry({
      source: 'SYSTEM',
      message: 'All systems reset to standby',
      level: 'info'
    });
  },
}));

// =============================================================================
// ENHANCED HOOKS FOR JSON RESUME INTEGRATION
// =============================================================================

// Hook for executive briefing functionality
export const useExecutiveBriefing = () => useMissionControlV2(state => ({
  briefing: state.executiveBriefing,
  isGenerating: state.processingStatus?.stage === 'generating',
  config: state.briefingConfig,
  
  generate: state.generateExecutiveBriefing,
  updateConfig: state.updateBriefingConfig,
  
  // Computed properties
  hasValidBriefing: !!state.executiveBriefing,
  lastGenerated: state.generatedBriefing?.generatedAt || null,
  dataQuality: state.getDataQualityScore(),
}));

// Hook for skills matrix and categories
export const useSkillsMatrix = () => useMissionControlV2(state => ({
  categories: state.skillCategories,
  
  // Actions
  getSkillsByCategory: state.getSkillsByCategory,
  getSitesBySkill: state.getSitesBySkill,
  
  // Computed properties
  totalSkills: state.skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0),
  topSkills: state.skillCategories
    .flatMap(cat => cat.skills)
    .sort((a, b) => (b.yearsExperience || 0) - (a.yearsExperience || 0))
    .slice(0, 10),
  
  skillsByProficiency: (level: string) => 
    state.skillCategories
      .flatMap(cat => cat.skills)
      .filter(skill => skill.level === level),
}));

// Hook for data transformation and processing
export const useDataTransformation = () => useMissionControlV2(state => ({
  // Processing state
  isProcessing: state.processingStatus !== null,
  processingStage: state.processingStatus?.stage || null,
  progress: state.processingStatus?.progress || 0,
  
  // Configuration
  transformConfig: state.transformConfig,
  updateConfig: state.updateTransformConfig,
  
  // Quality metrics
  validation: state.validation,
  dataQuality: state.getDataQualityScore(),
  health: state.getTransformationHealth(),
  
  // Performance
  metrics: state.performanceMetrics,
  
  // Metadata
  transformationMeta: state.transformationMetadata,
  syncState: state.dataSync,
}));

// Hook for enhanced site data management
export const useEnhancedSites = () => useMissionControlV2(state => ({
  sites: state.sites,
  
  // Enhanced selectors
  getRecentWork: state.getRecentWork,
  getFeaturedProjects: state.getFeaturedProjects,
  getSitesBySkill: state.getSitesBySkill,
  
  // Site enhancement
  enrichSite: state.enrichSiteData,
  updateSite: state.updateSite,
  
  // Analytics
  sitesByType: {
    jobs: state.getWorkSites(),
    projects: state.getProjectSites(),
    hobbies: state.getHobbySites(),
  },
  
  totalSites: state.sites.length,
  enhancedSitesCount: state.sites.filter(site => 
    'skills' in site || 'achievements' in site || 'clearanceLevel' in site
  ).length,
}));

// Hook for comprehensive mission control analytics
export const useMissionAnalytics = () => useMissionControlV2(state => {
  const workSites = state.getWorkSites();
  const projectSites = state.getProjectSites();
  const hobbySites = state.getHobbySites();
  
  return {
    // Data composition
    composition: {
      totalSites: state.sites.length,
      workSites: workSites.length,
      projectSites: projectSites.length,
      hobbySites: hobbySites.length,
      enhancedSites: state.sites.filter(site => 'skills' in site).length,
    },
    
    // Skills analysis
    skills: {
      totalCategories: state.skillCategories.length,
      totalSkills: state.skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0),
      expertLevel: state.skillCategories
        .flatMap(cat => cat.skills)
        .filter(skill => skill.level === 'expert').length,
    },
    
    // Timeline analysis
    timeline: {
      careerSpan: workSites.length > 0 ? {
        start: Math.min(...workSites.map(site => 
          new Date(site.period?.start || Date.now()).getFullYear()
        )),
        end: Math.max(...workSites.map(site => 
          new Date(site.period?.end || Date.now()).getFullYear()
        )),
      } : null,
      
      averageJobDuration: workSites.length > 0 ? 
        workSites
          .filter(site => site.period?.start && site.period?.end)
          .reduce((sum, site) => {
            const start = new Date(site.period!.start);
            const end = new Date(site.period!.end!);
            return sum + (end.getTime() - start.getTime());
          }, 0) / workSites.length / (1000 * 60 * 60 * 24 * 365) // Convert to years
        : 0,
    },
    
    // Quality metrics
    quality: {
      dataQualityScore: state.getDataQualityScore(),
      transformationHealth: state.getTransformationHealth(),
      completeness: state.validation?.completeness?.overall || 0,
      resumeLinked: !!state.resumeData,
    },
    
    // User engagement
    engagement: {
      visitedSites: state.visitedSites.length,
      completionRate: state.visitedSites.length / Math.max(state.sites.length, 1) * 100,
      currentRank: state.userRank,
    },
  };
});