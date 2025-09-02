import type { StateCreator } from 'zustand';
import type { 
  SiteData, 
  EnhancedSiteData,
  ExecutiveBriefing,
  TransformationMetadata,
  DataSyncState 
} from '../../types';
import type { 
  JsonResume, 
  ResumeDataState, 
  ResumeDataError,
  ResumeTransformConfig,
  SkillCategory,
  ResumeProcessingStatus,
  ResumeValidation,
  BriefingGenerationConfig,
  GeneratedBriefing,
  PerformanceMetrics
} from '../../types';
import { resumeService } from '../../services/resumeService';

export interface DataSlice {
  // Enhanced State
  sites: EnhancedSiteData[];
  resumeData: JsonResume | null;
  resumeDataState: ResumeDataState;
  resumeDataError: ResumeDataError | null;
  lastResumeUpdate: Date | null;
  resumeUrl: string | null;
  
  // New enhanced data
  executiveBriefing: ExecutiveBriefing | null;
  skillCategories: SkillCategory[];
  transformationMetadata: TransformationMetadata | null;
  dataSync: DataSyncState;
  
  // Processing state
  processingStatus: ResumeProcessingStatus | null;
  validation: ResumeValidation | null;
  generatedBriefing: GeneratedBriefing | null;
  performanceMetrics: PerformanceMetrics | null;
  
  // Configuration
  transformConfig: ResumeTransformConfig;
  briefingConfig: BriefingGenerationConfig;
  
  // Enhanced Actions
  loadResumeData: (url: string, config?: ResumeTransformConfig) => Promise<void>;
  refreshResumeData: () => Promise<void>;
  setSites: (sites: EnhancedSiteData[]) => void;
  addSite: (site: EnhancedSiteData) => void;
  removeSite: (siteId: string) => void;
  updateSite: (siteId: string, updates: Partial<EnhancedSiteData>) => void;
  clearResumeData: () => void;
  retryResumeLoad: () => Promise<void>;
  
  // New actions
  generateExecutiveBriefing: (config?: BriefingGenerationConfig) => Promise<void>;
  updateTransformConfig: (config: Partial<ResumeTransformConfig>) => void;
  updateBriefingConfig: (config: Partial<BriefingGenerationConfig>) => void;
  validateResumeData: (data: JsonResume) => ResumeValidation;
  syncDataState: () => Promise<void>;
  enrichSiteData: (siteId: string, enrichments: any) => void;
  
  // Enhanced Selectors
  getSiteById: (id: string) => EnhancedSiteData | undefined;
  getSitesByType: (type: SiteData['type']) => EnhancedSiteData[];
  getWorkSites: () => EnhancedSiteData[];
  getProjectSites: () => EnhancedSiteData[];
  getHobbySites: () => EnhancedSiteData[];
  
  // New selectors
  getSkillsByCategory: (category: string) => SkillCategory | undefined;
  getSitesBySkill: (skill: string) => EnhancedSiteData[];
  getRecentWork: (count?: number) => EnhancedSiteData[];
  getFeaturedProjects: (count?: number) => EnhancedSiteData[];
  getDataQualityScore: () => number;
  getTransformationHealth: () => 'healthy' | 'warning' | 'error';
}

export const createDataSlice: StateCreator<
  DataSlice,
  [],
  [],
  DataSlice
> = (set, get) => ({
  // Initial state
  sites: [],
  resumeData: null,
  resumeDataState: 'idle',
  resumeDataError: null,
  lastResumeUpdate: null,
  resumeUrl: null,
  
  // Enhanced initial state
  executiveBriefing: null,
  skillCategories: [],
  transformationMetadata: null,
  dataSync: {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSync: null,
    syncInProgress: false,
    pendingChanges: 0,
    conflicts: []
  },
  
  // Processing state
  processingStatus: null,
  validation: null,
  generatedBriefing: null,
  performanceMetrics: null,
  
  // Default configurations
  transformConfig: {
    workPositionToTitle: true,
    highlightsToLogs: true,
    skillsToCapabilities: true,
    projectsToSites: true,
    inferLocations: true,
    generateCodenames: true,
    classifyMissions: false,
    calculateMetrics: true,
    militaryStyleSummaries: true,
    technicalDepthLevel: 'detailed',
    includeQuantifiedResults: true
  },
  briefingConfig: {
    includeMetrics: true,
    includeSkillMatrix: true,
    includeTimeline: true,
    includeLocation: true,
    includeClearance: false,
    tone: 'professional',
    detailLevel: 'executive',
    audience: 'technical',
    useCodenames: true,
    useMilitaryTime: false,
    useMetricSystem: false
  },

  // Enhanced Actions
  loadResumeData: async (url: string, config?: ResumeTransformConfig) => {
    const state = get();
    
    // Don't reload if already loading the same URL
    if (state.resumeDataState === 'loading' && state.resumeUrl === url) {
      return;
    }

    set({
      resumeDataState: 'loading',
      resumeDataError: null,
      resumeUrl: url
    });

    try {
      // Fetch resume data
      const resumeData = await resumeService.fetchResumeData(url);
      
      // Transform work experience and projects to sites
      const workSites = resumeService.transformWorkExperience(resumeData);
      const projectSites = resumeService.transformProjects(resumeData);
      const resumeSites = [...workSites, ...projectSites];
      
      // Merge with existing sites (preserving manually added sites)
      const currentState = get();
      const existingSites = currentState.sites.filter(site => 
        !site.id.startsWith('job-') && !site.id.startsWith('project-')
      );
      
      const mergedSites = resumeService.mergeSiteData(resumeSites, existingSites);

      set({
        resumeData,
        sites: mergedSites,
        resumeDataState: 'loaded',
        resumeDataError: null,
        lastResumeUpdate: new Date()
      });

      // Add telemetry log if telemetry slice is available
      const telemetryState = currentState as any;
      if (telemetryState.addTelemetry) {
        telemetryState.addTelemetry({
          source: 'DATA',
          message: `Resume data loaded successfully: ${workSites.length} jobs, ${projectSites.length} projects`,
          level: 'success'
        });
      }

    } catch (error) {
      const resumeError: ResumeDataError = error instanceof Error && 'code' in error
        ? error as unknown as ResumeDataError
        : {
            code: 'FETCH_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date(),
            url
          };

      set({
        resumeDataState: 'error',
        resumeDataError: resumeError
      });

      // Add telemetry log for error if available
      const currentState = get();
      const telemetryState = currentState as any;
      if (telemetryState.addTelemetry) {
        telemetryState.addTelemetry({
          source: 'DATA',
          message: `Resume data load failed: ${resumeError.message}`,
          level: 'error'
        });
      }

      throw resumeError;
    }
  },

  refreshResumeData: async () => {
    const state = get();
    if (!state.resumeUrl) {
      throw new Error('No resume URL configured for refresh');
    }
    
    // Clear cache and reload
    resumeService.clearCache();
    return state.loadResumeData(state.resumeUrl);
  },

  setSites: (sites: EnhancedSiteData[]) => {
    set({ sites });
  },

  addSite: (site: EnhancedSiteData) => {
    set((state) => ({
      sites: [...state.sites, site]
    }));
  },

  removeSite: (siteId: string) => {
    set((state) => ({
      sites: state.sites.filter(site => site.id !== siteId)
    }));
  },

  updateSite: (siteId: string, updates: Partial<EnhancedSiteData>) => {
    set((state) => ({
      sites: state.sites.map(site => 
        site.id === siteId ? { ...site, ...updates } : site
      )
    }));
  },

  clearResumeData: () => {
    set({
      resumeData: null,
      resumeDataState: 'idle',
      resumeDataError: null,
      lastResumeUpdate: null,
      resumeUrl: null,
      // Keep manually added sites, remove resume-generated ones
      sites: get().sites.filter(site => 
        !site.id.startsWith('job-') && !site.id.startsWith('project-')
      )
    });
    
    resumeService.clearCache();
  },

  retryResumeLoad: async () => {
    const state = get();
    if (!state.resumeUrl) {
      throw new Error('No resume URL to retry');
    }
    
    return state.loadResumeData(state.resumeUrl);
  },

  // Selectors
  getSiteById: (id: string) => {
    return get().sites.find(site => site.id === id);
  },

  getSitesByType: (type: EnhancedSiteData['type']) => {
    return get().sites.filter(site => site.type === type);
  },

  getWorkSites: () => {
    return get().sites.filter(site => site.type === 'job');
  },

  getProjectSites: () => {
    return get().sites.filter(site => site.type === 'project');
  },

  getHobbySites: () => {
    return get().sites.filter(site => site.type === 'hobby');
  },

  // Enhanced Actions (missing implementations)
  generateExecutiveBriefing: async (config?: BriefingGenerationConfig) => {
    const state = get();
    
    if (!state.resumeData) {
      throw new Error('No resume data available for briefing generation');
    }

    set({ processingStatus: {
      stage: 'generating',
      progress: 0,
      message: 'Generating executive briefing...',
      warnings: [],
      errors: [],
      startTime: new Date()
    }});

    try {
      // Simulate briefing generation process
      const briefingConfig = { ...state.briefingConfig, ...config };
      
      // Update progress
      set(state => ({ 
        processingStatus: state.processingStatus ? {
          ...state.processingStatus,
          progress: 50,
          message: 'Analyzing resume data...'
        } : null
      }));

      // Generate briefing content (simplified implementation)
      const generatedBriefing: GeneratedBriefing = {
        config: briefingConfig,
        generatedAt: new Date(),
        content: {
          executiveSummary: `Senior-level professional with extensive experience across ${state.sites.filter(s => s.type === 'job').length} positions and ${state.sites.filter(s => s.type === 'project').length} major projects.`,
          keyCapabilities: state.skillCategories.flatMap(cat => cat.skills.slice(0, 3).map(skill => skill.name)),
          recentMissions: state.sites.filter(s => s.type === 'job').slice(0, 3).map(job => `${job.name}: ${job.briefing}`),
          metricsHighlights: [
            `${state.sites.filter(s => s.type === 'job').length} successful missions completed`,
            `${state.skillCategories.length} technical specializations`,
            `${state.sites.length} total operational sites`
          ]
        },
        metadata: {
          wordCount: 250,
          readingTime: 2,
          confidenceScore: 85,
          dataPoints: state.sites.length
        }
      };

      // Final update
      set({ 
        generatedBriefing,
        processingStatus: {
          stage: 'complete',
          progress: 100,
          message: 'Executive briefing generated successfully',
          warnings: [],
          errors: [],
          startTime: new Date(),
          duration: 2000
        }
      });

      // Add telemetry
      const telemetryState = get() as any;
      if (telemetryState.addTelemetry) {
        telemetryState.addTelemetry({
          source: 'DATA',
          message: 'Executive briefing generated successfully',
          level: 'success'
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      set({ 
        processingStatus: {
          stage: 'generating',
          progress: 0,
          message: 'Briefing generation failed',
          warnings: [],
          errors: [errorMessage],
          startTime: new Date()
        }
      });

      throw error;
    }
  },

  updateTransformConfig: (config: Partial<ResumeTransformConfig>) => {
    set(state => ({
      transformConfig: { ...state.transformConfig, ...config }
    }));
  },

  updateBriefingConfig: (config: Partial<BriefingGenerationConfig>) => {
    set(state => ({
      briefingConfig: { ...state.briefingConfig, ...config }
    }));
  },

  validateResumeData: (data: JsonResume): ResumeValidation => {
    const issues: ResumeValidation['issues'] = [];
    
    // Basic validation
    if (!data.basics?.name) {
      issues.push({
        severity: 'error',
        field: 'basics.name',
        message: 'Name is required',
        suggestion: 'Add a name field to the basics section'
      });
    }

    if (!data.work || data.work.length === 0) {
      issues.push({
        severity: 'warning',
        field: 'work',
        message: 'No work experience provided',
        suggestion: 'Add work experience entries'
      });
    }

    // Calculate completeness scores
    const completeness = {
      basics: data.basics ? 80 : 0,
      work: data.work?.length ? Math.min(100, data.work.length * 25) : 0,
      skills: data.skills?.length ? Math.min(100, data.skills.length * 10) : 0,
      education: data.education?.length ? Math.min(100, data.education.length * 50) : 0,
      projects: data.projects?.length ? Math.min(100, data.projects.length * 20) : 0,
      overall: 0
    };

    completeness.overall = Math.round(
      (completeness.basics + completeness.work + completeness.skills + completeness.education + completeness.projects) / 5
    );

    const validation: ResumeValidation = {
      isValid: issues.filter(i => i.severity === 'error').length === 0,
      score: completeness.overall,
      issues,
      completeness
    };

    set({ validation });
    return validation;
  },

  syncDataState: async () => {
    set(state => ({
      dataSync: {
        ...state.dataSync,
        syncInProgress: true,
        lastSync: new Date()
      }
    }));

    try {
      // Perform sync operations
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate sync

      set(state => ({
        dataSync: {
          ...state.dataSync,
          syncInProgress: false,
          lastSync: new Date(),
          pendingChanges: 0
        }
      }));
    } catch (error) {
      set(state => ({
        dataSync: {
          ...state.dataSync,
          syncInProgress: false
        }
      }));
      throw error;
    }
  },

  enrichSiteData: (siteId: string, enrichments: any) => {
    set(state => ({
      sites: state.sites.map(site => 
        site.id === siteId 
          ? { ...site, ...enrichments }
          : site
      )
    }));
  },

  // Enhanced selectors (missing implementations)
  getSkillsByCategory: (category: string) => {
    return get().skillCategories.find(cat => cat.name === category);
  },

  getSitesBySkill: (skill: string) => {
    const state = get();
    return state.sites.filter(site => 
      'skills' in site && Array.isArray(site.skills) && site.skills.includes(skill)
    );
  },

  getRecentWork: (count = 5) => {
    const state = get();
    return state.sites
      .filter(site => site.type === 'job')
      .sort((a, b) => {
        const aDate = a.period?.start ? new Date(a.period.start).getTime() : 0;
        const bDate = b.period?.start ? new Date(b.period.start).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, count);
  },

  getFeaturedProjects: (count = 5) => {
    const state = get();
    return state.sites
      .filter(site => site.type === 'project')
      .sort((a, b) => {
        const aDate = a.period?.start ? new Date(a.period.start).getTime() : 0;
        const bDate = b.period?.start ? new Date(b.period.start).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, count);
  },

  getDataQualityScore: () => {
    const state = get();
    if (!state.validation) return 0;
    return state.validation.score;
  },

  getTransformationHealth: (): 'healthy' | 'warning' | 'error' => {
    const state = get();
    
    if (state.resumeDataState === 'error' || (state.validation && !state.validation.isValid)) {
      return 'error';
    }
    
    if (state.processingStatus?.warnings.length || (state.validation && state.validation.score < 70)) {
      return 'warning';
    }
    
    return 'healthy';
  }
});