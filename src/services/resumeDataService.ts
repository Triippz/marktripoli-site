import type { CareerMarker, CareerMapData, ResumeData, ResumeWorkEntry, ResumeEducationEntry } from '../types/careerData';

// Mission control codenames for companies/institutions
const TACTICAL_CODENAMES: { [key: string]: string } = {
  'Picogrid': 'OPERATION NEXUS',
  'HubSpot': 'OPERATION GROWTH ENGINE',
  'Comcast': 'OPERATION BROADBAND',
  'Amtrak': 'OPERATION RAIL NETWORK',
  'United States Marine Corps': 'OPERATION SEMPER FI',
  'The Pennsylvania State University': 'OPERATION NITTANY LION',
  'Ghillied Up': 'OPERATION GHOST PROTOCOL'
};

// Category styling configuration
const CAREER_CATEGORIES = {
  work: {
    color: '#00ff00', // Mission control green
    glowColor: 'rgba(0, 255, 0, 0.6)',
    icon: '🏢',
    label: 'CORPORATE MISSIONS'
  },
  military: {
    color: '#ff4444', // Tactical red
    glowColor: 'rgba(255, 68, 68, 0.6)', 
    icon: '🪖',
    label: 'MILITARY SERVICE'
  },
  education: {
    color: '#4488ff', // Academic blue
    glowColor: 'rgba(68, 136, 255, 0.6)',
    icon: '🎓',
    label: 'EDUCATION & TRAINING'
  },
  project: {
    color: '#ff8800', // Project orange
    glowColor: 'rgba(255, 136, 0, 0.6)',
    icon: '⚡',
    label: 'SPECIAL PROJECTS'
  }
};

class ResumeDataService {
  private resumeData: ResumeData | null = null;

  async loadResumeData(): Promise<ResumeData> {
    if (this.resumeData) {
      return this.resumeData;
    }

    try {
      const response = await fetch('/resume.json');
      if (!response.ok) {
        throw new Error(`Failed to load resume data: ${response.status}`);
      }
      
      this.resumeData = await response.json();
      return this.resumeData!;
    } catch (error) {
      console.error('[ResumeDataService] Failed to load resume data:', error);
      throw error;
    }
  }

  private generateMarkerId(name: string, type: string): string {
    return `${type}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  private determineCareerCategory(workEntry: ResumeWorkEntry): 'work' | 'military' | 'project' {
    const name = workEntry.name.toLowerCase();
    
    if (name.includes('marine') || name.includes('corps') || name.includes('military')) {
      return 'military';
    }
    
    if (name.includes('ghillied') || workEntry.position.toLowerCase().includes('co-founder')) {
      return 'project';
    }
    
    return 'work';
  }

  private transformWorkEntry(entry: ResumeWorkEntry): CareerMarker | null {
    // Skip entries without location data
    if (!entry.x_location?.geo) {
      console.warn(`[ResumeDataService] Skipping ${entry.name} - no location data`);
      return null;
    }

    const category = this.determineCareerCategory(entry);
    const currentDate = new Date();
    const isCurrent = !entry.endDate || new Date(entry.endDate) > currentDate;

    const coordinates = {
      lat: entry.x_location.geo.lat,
      lng: entry.x_location.geo.lon
    };

    console.log(`[ResumeDataService] ${entry.name} coordinates:`, coordinates);

    return {
      id: this.generateMarkerId(entry.name, 'work'),
      type: category,
      category: CAREER_CATEGORIES[category].label,
      name: entry.name,
      position: entry.position,
      location: {
        lat: coordinates.lat,
        lng: coordinates.lng,
        city: entry.x_location.city,
        region: entry.x_location.region,
        countryCode: entry.x_location.countryCode
      },
      startDate: entry.startDate,
      endDate: entry.endDate,
      summary: entry.summary,
      highlights: entry.highlights,
      logo: entry.x_logo,
      codename: TACTICAL_CODENAMES[entry.name] || `OPERATION ${entry.name.toUpperCase()}`,
      isCurrent
    };
  }

  private transformEducationEntry(entry: ResumeEducationEntry): CareerMarker | null {
    // Skip entries without location data
    if (!entry.x_location?.geo) {
      console.warn(`[ResumeDataService] Skipping ${entry.institution} - no location data`);
      return null;
    }

    return {
      id: this.generateMarkerId(entry.institution, 'education'),
      type: 'education',
      category: CAREER_CATEGORIES.education.label,
      name: entry.institution,
      position: `${entry.studyType} in ${entry.area}`,
      location: {
        lat: entry.x_location.geo.lat,
        lng: entry.x_location.geo.lon,
        city: entry.x_location.city,
        region: entry.x_location.region,
        countryCode: entry.x_location.countryCode
      },
      startDate: entry.startDate || 'N/A',
      endDate: entry.endDate,
      summary: `Completed ${entry.studyType} degree in ${entry.area}`,
      highlights: [], // Education entries don't have highlights in resume schema
      logo: entry.x_logo,
      codename: TACTICAL_CODENAMES[entry.institution] || `OPERATION ${entry.institution.toUpperCase()}`,
      isCurrent: false
    };
  }

  async getCareerMapData(): Promise<CareerMapData> {
    const resumeData = await this.loadResumeData();
    const markers: CareerMarker[] = [];

    // Transform work experience entries
    resumeData.work.forEach(workEntry => {
      const marker = this.transformWorkEntry(workEntry);
      if (marker) {
        markers.push(marker);
      }
    });

    // Transform education entries
    resumeData.education.forEach(educationEntry => {
      const marker = this.transformEducationEntry(educationEntry);
      if (marker) {
        markers.push(marker);
      }
    });

    // Sort markers chronologically (newest first for display)
    markers.sort((a, b) => {
      const aDate = new Date(a.endDate || a.startDate);
      const bDate = new Date(b.endDate || b.startDate);
      return bDate.getTime() - aDate.getTime();
    });

    return {
      markers,
      categories: CAREER_CATEGORIES
    };
  }

  // Get category-specific styling
  getCategoryStyle(type: CareerMarker['type']) {
    return CAREER_CATEGORIES[type];
  }

  // Get formatted date range for display
  getDateRange(marker: CareerMarker): string {
    const startYear = new Date(marker.startDate).getFullYear();
    const endDisplay = marker.endDate 
      ? new Date(marker.endDate).getFullYear().toString()
      : 'PRESENT';
    return `${startYear} - ${endDisplay}`;
  }

  // Generate tactical display coordinates
  getTacticalCoords(marker: CareerMarker): string {
    return `LAT: ${marker.location.lat.toFixed(4)} LNG: ${marker.location.lng.toFixed(4)}`;
  }
}

// Export singleton instance
export const resumeDataService = new ResumeDataService();
export default resumeDataService;