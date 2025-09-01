import type { JsonResume, ResumeCache, ResumeDataError as ResumeDataErrorT } from '../types/resume';
import type { SiteData, DateRange, EngagementType } from '../types';
import { getLocationCoordinates, getEngagementTypeForLocation } from '../utils/coordinates';

// Cache configuration
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
const CACHE_KEY = 'mc-resume-cache';

export class ResumeService {
  private cache: Map<string, ResumeCache> = new Map();
  private requestInFlight: Map<string, Promise<JsonResume>> = new Map();

  constructor() {
    this.loadCacheFromStorage();
  }

  /**
   * Load cached resume data from localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached);
        Object.entries(cacheData).forEach(([url, cache]) => {
          this.cache.set(url, {
            ...cache as ResumeCache,
            timestamp: new Date((cache as ResumeCache).timestamp)
          });
        });
      }
    } catch (error) {
      console.warn('[ResumeService] Failed to load cache from localStorage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCacheToStorage(): void {
    try {
      const cacheData: Record<string, ResumeCache> = {};
      this.cache.forEach((cache, url) => {
        cacheData[url] = cache;
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('[ResumeService] Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(cache: ResumeCache): boolean {
    const age = Date.now() - cache.timestamp.getTime();
    return age < CACHE_DURATION_MS;
  }

  /**
   * Fetch resume data from local public asset with caching.
   * Note: the `url` parameter is ignored and kept for API compatibility.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchResumeData(_url: string): Promise<JsonResume> {
    const localUrl = '/resume.json';

    // Check cache first
    const cached = this.cache.get(localUrl);
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    // Coalesce concurrent requests
    const inFlightRequest = this.requestInFlight.get(localUrl);
    if (inFlightRequest) {
      return inFlightRequest;
    }

    const request = this.performLocalFetch(localUrl);
    this.requestInFlight.set(localUrl, request);

    try {
      const data = await request;
      this.cache.set(localUrl, {
        data,
        timestamp: new Date(),
        url: localUrl
      });
      this.saveCacheToStorage();
      return data;
    } finally {
      this.requestInFlight.delete(localUrl);
    }
  }

  /**
   * Perform fetch from same-origin public file with error handling
   */
  private async performLocalFetch(url: string): Promise<JsonResume> {
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache',
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new ResumeDataErrorEx(
          'FETCH_ERROR',
          `HTTP ${response.status}: ${response.statusText}`,
          new Date(),
          url
        );
      }

      const text = await response.text();
      try {
        return JSON.parse(text) as JsonResume;
      } catch (parseError) {
        throw new ResumeDataErrorEx(
          'PARSE_ERROR',
          `Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          new Date(),
          url
        );
      }
    } catch (error) {
      if (error instanceof ResumeDataErrorEx) throw error;
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ResumeDataErrorEx('FETCH_ERROR', 'Request timeout after 15 seconds', new Date(), url);
      }
      throw new ResumeDataErrorEx(
        'FETCH_ERROR',
        error instanceof Error ? error.message : 'Unknown fetch error',
        new Date(),
        url
      );
    }
  }

  /**
   * Transform resume work experience into SiteData
   */
  transformWorkExperience(resume: JsonResume): SiteData[] {
    if (!resume.work || !Array.isArray(resume.work)) {
      return [];
    }

    return resume.work
      .filter(job => job.name && job.position) // Filter out incomplete entries
      .map((job, index) => {
        const id = `job-${job.name?.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`;
        const coordinates = getLocationCoordinates(job.location || 'remote');
        const engagementType = getEngagementTypeForLocation(job.location || 'remote');
        
        // Parse dates
        const period: DateRange | undefined = job.startDate ? {
          start: job.startDate,
          end: job.endDate
        } : undefined;

        // Generate codename from company name
        const codename = this.generateCodename(job.name!);

        return {
          id,
          type: 'job' as const,
          name: job.name!,
          codename,
          hq: coordinates,
          period,
          briefing: job.summary || `${job.position} at ${job.name}`,
          deploymentLogs: job.highlights || [
            `Position: ${job.position}`,
            ...(job.location ? [`Location: ${job.location}`] : [])
          ],
          afterAction: job.highlights ? [
            'Mission objectives achieved',
            'Key competencies developed',
            'Team collaboration excellence'
          ] : undefined,
          engagementType: engagementType as EngagementType,
          links: job.url ? [{
            label: 'Company Website',
            url: job.url,
            type: 'other' as const
          }] : undefined
        };
      });
  }

  /**
   * Transform resume projects into SiteData
   */
  transformProjects(resume: JsonResume): SiteData[] {
    if (!resume.projects || !Array.isArray(resume.projects)) {
      return [];
    }

    return resume.projects
      .filter(project => project.name) // Filter out incomplete entries
      .map((project, index) => {
        const id = `project-${project.name?.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`;
        
        // Use a default location or try to infer from entity
        const coordinates = getLocationCoordinates('remote');
        
        // Parse dates
        const period: DateRange | undefined = project.startDate ? {
          start: project.startDate,
          end: project.endDate
        } : undefined;

        return {
          id,
          type: 'project' as const,
          name: project.name!,
          codename: this.generateCodename(project.name!),
          hq: coordinates,
          period,
          briefing: project.description || `Project: ${project.name}`,
          deploymentLogs: project.highlights || [
            ...(project.keywords ? [`Technologies: ${project.keywords.join(', ')}`] : []),
            ...(project.roles ? [`Roles: ${project.roles.join(', ')}`] : [])
          ],
          engagementType: 'build-pipeline' as EngagementType,
          links: project.url ? [{
            label: 'Project Link',
            url: project.url,
            type: 'github' as const
          }] : undefined
        };
      });
  }

  /**
   * Merge resume-generated sites with existing static sites
   */
  mergeSiteData(resumeSites: SiteData[], existingSites: SiteData[] = []): SiteData[] {
    const merged = [...existingSites];
    const existingIds = new Set(existingSites.map(site => site.id));

    // Add resume sites that don't conflict with existing ones
    resumeSites.forEach(resumeSite => {
      if (!existingIds.has(resumeSite.id)) {
        merged.push(resumeSite);
      }
    });

    return merged.sort((a, b) => {
      // Sort by type priority and then by period (most recent first)
      const typePriority = { job: 0, project: 1, hobby: 2 };
      const aPriority = typePriority[a.type];
      const bPriority = typePriority[b.type];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Sort by start date (most recent first)
      const aDate = a.period?.start ? new Date(a.period.start).getTime() : 0;
      const bDate = b.period?.start ? new Date(b.period.start).getTime() : 0;
      return bDate - aDate;
    });
  }

  /**
   * Generate Mission Control themed codenames
   */
  private generateCodename(name: string): string {
    
    const codewords = [
      'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot',
      'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima',
      'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo',
      'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'xray',
      'yankee', 'zulu'
    ];

    const operations = [
      'falcon', 'lightning', 'thunder', 'storm', 'eagle', 'hawk',
      'viper', 'phoenix', 'ghost', 'shadow', 'blade', 'steel',
      'crimson', 'silver', 'golden', 'rapid', 'silent', 'swift'
    ];

    // Use first letter of company/project name for codeword selection
    const firstChar = name.charAt(0).toLowerCase();
    const charCode = firstChar.charCodeAt(0) - 97; // 'a' = 0
    const codewordIndex = Math.max(0, Math.min(charCode, codewords.length - 1));
    const operationIndex = (charCode * 7) % operations.length; // Some variation

    return `${operations[operationIndex]}-${codewords[codewordIndex]}`.toUpperCase();
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(CACHE_KEY);
  }

  /**
   * Get cache statistics
   */
  getCacheInfo() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([url, cache]) => ({
        url,
        timestamp: cache.timestamp,
        isValid: this.isCacheValid(cache)
      }))
    };
  }
}

/**
 * Custom error class for resume data operations
 */
class ResumeDataErrorEx extends Error implements ResumeDataErrorT {
  code: ResumeDataErrorT['code'];
  timestamp: Date;
  url?: string;

  constructor(code: ResumeDataErrorT['code'], message: string, timestamp: Date, url?: string) {
    super(message);
    this.name = 'ResumeDataError';
    this.code = code;
    this.timestamp = timestamp;
    this.url = url;
  }
}

// Singleton instance
export const resumeService = new ResumeService();
