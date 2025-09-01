/**
 * Type Transformation Utilities
 * Provides type-safe transformation functions between JSON Resume and Mission Control data
 */

import type {
  JsonResume,
  Work,
  Project,
  Skill,
  Education,
  EnhancedWork,
  EnhancedProject,
  SkillCategory,
  EnhancedSiteData,
  ExecutiveBriefing,
  ResumeTransformConfig,
  BriefingGenerationConfig,
  Coordinates,
  SecurityClearance,
  MissionClassification,
  OperationalStatus
} from './index';

// =============================================================================
// TRANSFORMATION RESULT TYPES
// =============================================================================

export interface TransformationResult<T> {
  success: boolean;
  data: T | null;
  warnings: string[];
  errors: string[];
  metadata: {
    sourceFields: string[];
    transformedFields: string[];
    confidence: number; // 0-100
    timestamp: Date;
  };
}

export interface BatchTransformationResult<T> {
  results: TransformationResult<T>[];
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
    warnings: number;
    overallConfidence: number;
  };
}

// =============================================================================
// FIELD MAPPING TYPES
// =============================================================================

export interface FieldMappingRule {
  sourceField: string;
  targetField: string;
  transform?: (value: any, context: any) => any;
  required: boolean;
  fallback?: any;
  validation?: (value: any) => boolean;
}

export interface MappingSchema {
  name: string;
  version: string;
  description: string;
  rules: FieldMappingRule[];
  postProcessors?: Array<(data: any, context: any) => any>;
  validators?: Array<(data: any) => { valid: boolean; message?: string }>;
}

// =============================================================================
// WORK EXPERIENCE TRANSFORMATION
// =============================================================================

export interface WorkToSiteTransformOptions {
  generateCodenames: boolean;
  inferLocations: boolean;
  classifyMissions: boolean;
  extractMetrics: boolean;
  enhanceWithCompanyData: boolean;
  militaryStyleSummaries: boolean;
}

export interface WorkTransformationContext {
  config: ResumeTransformConfig;
  companySizeMapping: Map<string, string>;
  locationMapping: Map<string, Coordinates>;
  industryClassification: Map<string, MissionClassification>;
  skillsDatabase: Map<string, { category: string; level: number }>;
  index: number;
  total: number;
}

export interface EnhancedWorkTransformation {
  enhanced: EnhancedWork;
  siteData: EnhancedSiteData;
  metrics: {
    dataCompleteness: number;
    enhancementApplied: string[];
    inferencesUsed: string[];
  };
}

// =============================================================================
// PROJECT TRANSFORMATION
// =============================================================================

export interface ProjectToSiteTransformOptions {
  categorizeProjects: boolean;
  extractTechStack: boolean;
  generateDemoData: boolean;
  inferProjectType: boolean;
  quantifyImpact: boolean;
}

export interface ProjectTransformationContext {
  config: ResumeTransformConfig;
  techStackMapping: Map<string, string[]>;
  projectTypeMapping: Map<string, string>;
  githubIntegration: boolean;
  portfolioData: Map<string, any>;
  index: number;
  total: number;
}

export interface EnhancedProjectTransformation {
  enhanced: EnhancedProject;
  siteData: EnhancedSiteData;
  metrics: {
    techStackDetected: string[];
    projectTypeInferred: string;
    linksValidated: string[];
  };
}

// =============================================================================
// SKILLS TRANSFORMATION
// =============================================================================

export interface SkillsTransformOptions {
  categorizeSkills: boolean;
  inferProficiency: boolean;
  addCertifications: boolean;
  linkToExperience: boolean;
  generateSkillMatrix: boolean;
}

export interface SkillsTransformationContext {
  config: ResumeTransformConfig;
  skillsCategorization: Map<string, string>;
  proficiencyInference: Map<string, number>;
  certificationData: Map<string, any>;
  workExperience: EnhancedWork[];
  projects: EnhancedProject[];
}

export interface SkillsTransformationResult {
  categories: SkillCategory[];
  skillMatrix: Array<{
    skill: string;
    category: string;
    proficiency: string;
    yearsExperience: number;
    lastUsed: string;
    projectsUsed: string[];
    certifications: string[];
  }>;
  recommendations: Array<{
    skill: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// =============================================================================
// EXECUTIVE BRIEFING GENERATION
// =============================================================================

export interface BriefingGenerationContext {
  config: BriefingGenerationConfig;
  resumeData: JsonResume;
  enhancedSites: EnhancedSiteData[];
  skillCategories: SkillCategory[];
  userPreferences: {
    hidePersonalInfo: boolean;
    emphasizeRecent: boolean;
    focusAreas: string[];
  };
}

export interface BriefingSection {
  type: 'profile' | 'summary' | 'competencies' | 'deployments' | 'commendations' | 'training' | 'contact';
  title: string;
  content: string;
  priority: number;
  confidence: number;
  sources: string[];
}

export interface BriefingGenerationResult {
  briefing: ExecutiveBriefing;
  sections: BriefingSection[];
  metadata: {
    generatedAt: Date;
    config: BriefingGenerationConfig;
    dataQuality: number;
    completeness: Record<string, number>;
    recommendations: string[];
  };
}

// =============================================================================
// LOCATION AND GEOCODING
// =============================================================================

export interface LocationInferenceOptions {
  useCompanyHQ: boolean;
  fallbackToRegion: boolean;
  validateCoordinates: boolean;
  addTimezone: boolean;
  inferFromContext: boolean;
}

export interface LocationInferenceResult {
  coordinates: Coordinates | null;
  confidence: number;
  source: 'exact' | 'company' | 'region' | 'country' | 'inferred' | 'fallback';
  timezone?: string;
  region?: string;
  metadata: {
    originalInput: string;
    searchTerms: string[];
    alternatives: Array<{
      coordinates: Coordinates;
      confidence: number;
      source: string;
    }>;
  };
}

// =============================================================================
// VALIDATION AND QUALITY ASSURANCE
// =============================================================================

export interface DataQualityMetrics {
  completeness: {
    overall: number;
    sections: Record<string, number>;
  };
  accuracy: {
    locationAccuracy: number;
    dateConsistency: number;
    skillRelevance: number;
  };
  richness: {
    quantifiedResults: number;
    mediaContent: number;
    externalLinks: number;
  };
  consistency: {
    namingConventions: number;
    dateFormats: number;
    classifications: number;
  };
}

export interface QualityIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'missing-data' | 'invalid-format' | 'inconsistent' | 'low-quality' | 'enhancement-opportunity';
  field: string;
  message: string;
  suggestion?: string;
  autoFixAvailable: boolean;
  impact: number; // 0-10
}

export interface QualityAssessment {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  metrics: DataQualityMetrics;
  issues: QualityIssue[];
  recommendations: Array<{
    category: string;
    description: string;
    impact: number;
    effort: 'low' | 'medium' | 'high';
    priority: number;
  }>;
}

// =============================================================================
// TRANSFORMER FUNCTION TYPES
// =============================================================================

export interface ResumeTransformers {
  // Core transformers
  workToSite: (
    work: Work, 
    context: WorkTransformationContext
  ) => TransformationResult<EnhancedWorkTransformation>;

  projectToSite: (
    project: Project, 
    context: ProjectTransformationContext
  ) => TransformationResult<EnhancedProjectTransformation>;

  skillsToCategories: (
    skills: Skill[], 
    context: SkillsTransformationContext
  ) => TransformationResult<SkillsTransformationResult>;

  // Location services
  inferLocation: (
    locationString: string, 
    options: LocationInferenceOptions
  ) => Promise<LocationInferenceResult>;

  // Briefing generation
  generateBriefing: (
    context: BriefingGenerationContext
  ) => Promise<BriefingGenerationResult>;

  // Quality assurance
  assessDataQuality: (
    data: JsonResume, 
    enhancedData: any
  ) => QualityAssessment;

  // Batch operations
  batchTransformWork: (
    workItems: Work[], 
    context: WorkTransformationContext
  ) => Promise<BatchTransformationResult<EnhancedWorkTransformation>>;

  batchTransformProjects: (
    projects: Project[], 
    context: ProjectTransformationContext
  ) => Promise<BatchTransformationResult<EnhancedProjectTransformation>>;
}

// =============================================================================
// CACHING AND PERFORMANCE
// =============================================================================

export interface TransformationCache {
  locationCache: Map<string, LocationInferenceResult>;
  companyCache: Map<string, any>;
  skillsCache: Map<string, SkillsTransformationResult>;
  ttl: number;
  maxSize: number;
  hitRate: number;
}

export interface TransformationPerformance {
  transformations: {
    work: number;
    projects: number;
    skills: number;
    location: number;
    briefing: number;
  };
  cachePerformance: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  memory: {
    used: number;
    peak: number;
    limit: number;
  };
  timing: {
    total: number;
    average: number;
    median: number;
    p95: number;
  };
}

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

export const TransformationUtils = {
  /**
   * Create a default transformation context
   */
  createDefaultWorkContext: (config: ResumeTransformConfig): WorkTransformationContext => ({
    config,
    companySizeMapping: new Map(),
    locationMapping: new Map(),
    industryClassification: new Map(),
    skillsDatabase: new Map(),
    index: 0,
    total: 0
  }),

  /**
   * Create a default project context
   */
  createDefaultProjectContext: (config: ResumeTransformConfig): ProjectTransformationContext => ({
    config,
    techStackMapping: new Map(),
    projectTypeMapping: new Map(),
    githubIntegration: false,
    portfolioData: new Map(),
    index: 0,
    total: 0
  }),

  /**
   * Validate transformation result
   */
  isValidTransformationResult: <T>(result: any): result is TransformationResult<T> => {
    return result && 
           typeof result.success === 'boolean' &&
           Array.isArray(result.warnings) &&
           Array.isArray(result.errors) &&
           result.metadata &&
           typeof result.metadata.confidence === 'number';
  },

  /**
   * Calculate overall confidence from multiple results
   */
  calculateOverallConfidence: (results: TransformationResult<any>[]): number => {
    if (results.length === 0) return 0;
    
    const weights = results.map(r => r.success ? 1 : 0.1);
    const weightedSum = results.reduce((sum, result, index) => 
      sum + (result.metadata.confidence * weights[index]), 0
    );
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }
};