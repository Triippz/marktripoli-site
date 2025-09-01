import { EngagementType } from '../types/mission';

/**
 * Generate a Mission Control codename for a company/organization
 */
export function generateCodename(name: string, index: number = 0, prefix: string = 'OPERATION'): string {
  const codewords = [
    'FALCON', 'EAGLE', 'HAWK', 'VIPER', 'TITAN', 'STORM', 'THUNDER', 'LIGHTNING',
    'NEXUS', 'APEX', 'DELTA', 'OMEGA', 'ALPHA', 'BETA', 'GAMMA', 'SIGMA',
    'SUMMIT', 'ZENITH', 'PRIME', 'CORE', 'FORGE', 'BLADE', 'SHIELD', 'SPEAR'
  ];
  
  const suffixes = [
    'ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL'
  ];

  // Extract key words from company name
  const words = name.replace(/[^a-zA-Z\s]/g, '').split(' ')
    .filter(word => word.length > 2)
    .map(word => word.toUpperCase());

  let codename = prefix;
  
  if (words.length > 0) {
    // Use first significant word if available
    const keyWord = words[0];
    codename += ` ${keyWord}`;
  } else {
    // Fallback to codename based on index
    const codewordIndex = index % codewords.length;
    codename += ` ${codewords[codewordIndex]}`;
  }

  // Add suffix if needed for uniqueness
  if (index > 0) {
    const suffixIndex = index % suffixes.length;
    codename += `-${suffixes[suffixIndex]}`;
  }

  return codename;
}

/**
 * Format date string to YYYY-MM format for periods
 */
export function formatPeriod(dateString?: string): string | undefined {
  if (!dateString) return undefined;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Try parsing YYYY-MM format directly
      if (/^\d{4}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      return undefined;
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  } catch (error) {
    console.warn('Failed to format date:', dateString, error);
    return undefined;
  }
}

/**
 * Get coordinates for a location string
 */
export function getCoordinatesForLocation(location?: string): { lat: number; lng: number } | undefined {
  if (!location) return undefined;

  const locationMappings: Record<string, { lat: number; lng: number }> = {
    'el segundo, ca': { lat: 33.9164, lng: -118.4103 },
    'cambridge, ma': { lat: 42.3601, lng: -71.0942 },
    'philadelphia, pa': { lat: 39.9526, lng: -75.1652 },
    'boston, ma': { lat: 42.3601, lng: -71.0589 },
    'new york, ny': { lat: 40.7128, lng: -74.0060 },
    'san francisco, ca': { lat: 37.7749, lng: -122.4194 },
    'los angeles, ca': { lat: 34.0522, lng: -118.2437 },
    'university park, pa': { lat: 40.7982, lng: -77.8599 },
    'camp lejeune, nc': { lat: 34.6834, lng: -77.3464 }
  };

  const normalizedLocation = location.toLowerCase().trim();
  return locationMappings[normalizedLocation];
}

/**
 * Determine engagement type based on company and role
 */
export function getEngagementType(company: string, role?: string): EngagementType {
  const companyLower = company.toLowerCase();
  const roleLower = (role || '').toLowerCase();

  // Company-specific engagement types
  if (companyLower.includes('picogrid')) return 'integration-matrix';
  if (companyLower.includes('hubspot')) return 'build-pipeline';
  if (companyLower.includes('comcast')) return 'network-optimization';
  if (companyLower.includes('amtrak')) return 'infrastructure-upgrade';
  if (companyLower.includes('marine')) return 'intelligence-analysis';

  // Role-based engagement types
  if (roleLower.includes('architect') || roleLower.includes('design')) return 'integration-matrix';
  if (roleLower.includes('platform') || roleLower.includes('devops')) return 'build-pipeline';
  if (roleLower.includes('network') || roleLower.includes('infrastructure')) return 'network-optimization';
  if (roleLower.includes('security') || roleLower.includes('analyst')) return 'intelligence-analysis';
  if (roleLower.includes('deploy') || roleLower.includes('ops')) return 'deploy-uas';

  // Default
  return 'deploy-uas';
}

/**
 * Generate a mission briefing based on role and company
 */
export function generateMissionBriefing(company: string, role: string, summary?: string): string {
  if (summary && summary.length > 10) {
    return summary;
  }

  const templates = [
    `Led strategic ${role.toLowerCase()} initiatives at ${company}, focusing on mission-critical system operations and team leadership.`,
    `Executed ${role.toLowerCase()} responsibilities at ${company} with emphasis on operational excellence and technical innovation.`,
    `Commanded ${role.toLowerCase()} operations for ${company}, driving system reliability and organizational effectiveness.`,
    `Directed ${role.toLowerCase()} mission objectives at ${company}, ensuring compliance and optimal performance delivery.`
  ];

  const templateIndex = (company.length + role.length) % templates.length;
  return templates[templateIndex];
}

/**
 * Extract key achievements from job highlights
 */
export function extractDeploymentLogs(highlights?: string[], maxLogs: number = 4): string[] {
  if (!highlights || !Array.isArray(highlights)) {
    return ['Successfully executed primary mission objectives'];
  }

  return highlights
    .slice(0, maxLogs)
    .map(highlight => {
      // Ensure each log sounds like a military deployment log
      if (highlight.toLowerCase().startsWith('led') || 
          highlight.toLowerCase().startsWith('managed') ||
          highlight.toLowerCase().startsWith('built') ||
          highlight.toLowerCase().startsWith('implemented')) {
        return highlight;
      }
      
      // Add action verb if missing
      return `Executed ${highlight.toLowerCase()}`;
    });
}

/**
 * Generate after-action report from job summary
 */
export function generateAfterActionReport(summary?: string, role?: string, company?: string): string[] {
  if (summary && summary.length > 20) {
    return [
      summary,
      `Gained valuable expertise in ${role?.toLowerCase() || 'technical leadership'} operations`,
      `Enhanced operational capabilities through ${company || 'organizational'} mission experience`
    ];
  }

  const genericReports = [
    `Gained valuable expertise in ${role?.toLowerCase() || 'technical'} operations and system management`,
    `Enhanced leadership capabilities through complex project delivery and team coordination`,
    `Developed advanced problem-solving skills in high-stakes operational environments`
  ];

  return genericReports;
}

/**
 * Calculate USA center coordinates for map flyTo initialization
 */
export function getUSACenterCoordinates(): { lat: number; lng: number; zoom: number } {
  return {
    lat: 39.8283,
    lng: -98.5795,
    zoom: 4
  };
}

/**
 * Validate and sanitize site data
 */
export function validateSiteData(site: any): boolean {
  const required = ['id', 'type', 'name', 'hq', 'briefing'];
  
  for (const field of required) {
    if (!site[field]) {
      console.warn(`Site validation failed: missing ${field}`, site);
      return false;
    }
  }

  if (!site.hq.lat || !site.hq.lng) {
    console.warn('Site validation failed: invalid coordinates', site);
    return false;
  }

  return true;
}