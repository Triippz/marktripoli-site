import { JsonResume } from '../types';
import { SiteData, EngagementType } from '../types';
import { generateCodename, formatPeriod } from '../utils/dataTransforms';

/**
 * Company location mapping based on JSON resume analysis
 */
const COMPANY_LOCATIONS: Record<string, { lat: number; lng: number; city: string; state: string }> = {
  'picogrid': { lat: 33.9164, lng: -118.4103, city: 'El Segundo', state: 'CA' },
  'hubspot': { lat: 42.3601, lng: -71.0942, city: 'Cambridge', state: 'MA' },
  'comcast': { lat: 39.9526, lng: -75.1652, city: 'Philadelphia', state: 'PA' },
  'amtrak': { lat: 39.9526, lng: -75.1652, city: 'Philadelphia', state: 'PA' },
  'ghillied up': { lat: 39.9526, lng: -75.1652, city: 'Philadelphia', state: 'PA' }, // Default to Philly
  'penn state university': { lat: 40.7982, lng: -77.8599, city: 'University Park', state: 'PA' },
  'us marine corps': { lat: 34.6834, lng: -77.3464, city: 'Camp Lejeune', state: 'NC' }
};

/**
 * Engagement types based on company/role analysis
 */
const ENGAGEMENT_TYPE_MAPPING: Record<string, EngagementType> = {
  'picogrid': 'integration-matrix',
  'hubspot': 'build-pipeline', 
  'comcast': 'network-optimization',
  'amtrak': 'infrastructure-upgrade',
  'ghillied up': 'deploy-uas',
  'us marine corps': 'intelligence-analysis'
};

/**
 * Transform JSON Resume work experience into Mission Control SiteData
 */
export function transformWorkExperienceToSites(resume: JsonResume): SiteData[] {
  if (!resume.work || !Array.isArray(resume.work)) {
    console.warn('Resume work experience not found or invalid');
    return [];
  }

  return resume.work.map((job, index) => {
    const companyKey = (job.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const location = COMPANY_LOCATIONS[companyKey];
    const engagementType = ENGAGEMENT_TYPE_MAPPING[companyKey] || 'deploy-uas';

    // Generate deployment logs from highlights
    const deploymentLogs = job.highlights && Array.isArray(job.highlights) 
      ? job.highlights.slice(0, 4) // Limit to 4 key achievements
      : [`Led ${job.position || 'assigned'} responsibilities at ${job.name || 'organization'}`];

    // Generate after-action report from summary
    const afterAction = job.summary 
      ? [job.summary]
      : [`Gained valuable experience in ${job.position || 'assigned'} role`];

    const siteData: SiteData = {
      id: companyKey,
      type: 'job',
      name: job.name || 'Unknown Organization',
      codename: generateCodename(job.name || 'Unknown', index),
      hq: location || { lat: 39.8283, lng: -98.5795 }, // Center of US fallback
      period: {
        start: formatPeriod(job.startDate) || 'Unknown',
        end: job.endDate ? formatPeriod(job.endDate) : undefined
      },
      briefing: job.summary || `${job.position || 'Role'} focused on ${job.name || 'organizational'} operations and strategic initiatives.`,
      deploymentLogs,
      afterAction,
      engagementType,
      links: job.url ? [{
        label: `${job.name || 'Organization'} Website`,
        url: job.url,
        type: 'demo' as const
      }] : []
    };

    return siteData;
  });
}

/**
 * Transform education data into sites if needed
 */
export function transformEducationToSites(resume: JsonResume): SiteData[] {
  if (!resume.education || !Array.isArray(resume.education)) {
    return [];
  }

  return resume.education.map((edu, index) => {
    const institutionKey = (edu.institution || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const location = COMPANY_LOCATIONS[institutionKey] || { lat: 39.8283, lng: -98.5795 };

    const siteData: SiteData = {
      id: `edu-${institutionKey}`,
      type: 'project',
      name: edu.institution || 'Unknown Institution',
      codename: generateCodename(edu.institution || 'Unknown', index, 'ACADEMY'),
      hq: location,
      period: {
        start: formatPeriod(edu.startDate) || 'Unknown',
        end: edu.endDate ? formatPeriod(edu.endDate) : undefined
      },
      briefing: `Academic mission: ${edu.studyType || 'Studies'} in ${edu.area || 'General Field'}`,
      deploymentLogs: [
        `Completed ${edu.studyType || 'academic'} program in ${edu.area || 'chosen field'}`,
        `Graduated ${edu.endDate ? new Date(edu.endDate).getFullYear() : 'In Progress'}`,
        (edu as any).score ? `Achieved academic performance score: ${(edu as any).score}` : 'Maintained academic excellence',
        'Developed critical thinking and analytical capabilities'
      ],
      afterAction: [
        `Gained comprehensive knowledge in ${edu.area || 'academic field'}`,
        'Built foundation for technical career advancement',
        'Developed research and problem-solving methodologies'
      ],
      engagementType: 'intelligence-analysis',
      links: edu.url ? [{
        label: `${edu.institution || 'Institution'} Profile`,
        url: edu.url,
        type: 'docs' as const
      }] : []
    };

    return siteData;
  });
}

/**
 * Merge JSON Resume sites with existing static sites
 */
export function mergeSitesData(resumeSites: SiteData[], staticSites: SiteData[]): SiteData[] {
  const mergedSites = [...staticSites];
  const existingIds = new Set(staticSites.map(site => site.id));

  // Add resume sites that don't already exist
  resumeSites.forEach(resumeSite => {
    if (!existingIds.has(resumeSite.id)) {
      mergedSites.push(resumeSite);
    } else {
      // Update existing site with resume data
      const existingIndex = mergedSites.findIndex(site => site.id === resumeSite.id);
      if (existingIndex !== -1) {
        mergedSites[existingIndex] = {
          ...mergedSites[existingIndex],
          ...resumeSite,
          // Preserve static data links and media if they exist
          links: [
            ...(mergedSites[existingIndex].links || []),
            ...(resumeSite.links || [])
          ],
          media: mergedSites[existingIndex].media || resumeSite.media
        };
      }
    }
  });

  return mergedSites;
}

/**
 * Extract skills data for Executive Briefing
 */
export function extractSkillsData(resume: JsonResume) {
  if (!resume.skills || !Array.isArray(resume.skills)) {
    return {
      leadership: [],
      technical: [],
      compliance: [],
      infrastructure: []
    };
  }

  const skillsMap = {
    leadership: [] as string[],
    technical: [] as string[],
    compliance: [] as string[],
    infrastructure: [] as string[]
  };

  resume.skills.forEach(skillGroup => {
    if (skillGroup.name && skillGroup.keywords && Array.isArray(skillGroup.keywords)) {
      const category = skillGroup.name.toLowerCase();
      
      if (category.includes('leadership') || category.includes('management')) {
        skillsMap.leadership.push(...skillGroup.keywords);
      } else if (category.includes('compliance') || category.includes('security')) {
        skillsMap.compliance.push(...skillGroup.keywords);
      } else if (category.includes('infrastructure') || category.includes('devops')) {
        skillsMap.infrastructure.push(...skillGroup.keywords);
      } else {
        skillsMap.technical.push(...skillGroup.keywords);
      }
    }
  });

  return skillsMap;
}

/**
 * Generate Executive Briefing data from resume
 */
export function generateExecutiveBriefing(resume: JsonResume) {
  const skillsData = extractSkillsData(resume);
  
  return {
    name: resume.basics?.name || 'Mark Tripoli',
    title: resume.basics?.label || 'Engineering Manager & Technical Lead',
    location: resume.basics?.location?.city && resume.basics?.location?.region 
      ? `${resume.basics.location.city}, ${resume.basics.location.region}`
      : 'Los Angeles, CA',
    summary: resume.basics?.summary || 'Technical leader with expertise in C2 systems, data integration, and platform engineering.',
    contact: {
      email: resume.basics?.email || 'me@marktripoli.com',
      phone: resume.basics?.phone || '(610) 908-2901',
      linkedin: resume.basics?.profiles?.find(p => p.network?.toLowerCase() === 'linkedin')?.url,
      twitter: resume.basics?.profiles?.find(p => p.network?.toLowerCase() === 'twitter')?.url,
      github: resume.basics?.profiles?.find(p => p.network?.toLowerCase() === 'github')?.url
    },
    skills: skillsData,
    currentRole: resume.work?.[0] ? {
      company: resume.work[0].name,
      position: resume.work[0].position,
      startDate: resume.work[0].startDate,
      summary: resume.work[0].summary
    } : undefined
  };
}

/**
 * Main transformation function
 */
export function transformResumeToMissionControlData(resume: JsonResume) {
  const workSites = transformWorkExperienceToSites(resume);
  const educationSites = transformEducationToSites(resume);
  const executiveBriefing = generateExecutiveBriefing(resume);

  return {
    sites: [...workSites, ...educationSites],
    executiveBriefing,
    metadata: {
      transformedAt: new Date().toISOString(),
      workExperienceCount: resume.work?.length || 0,
      educationCount: resume.education?.length || 0,
      skillsCount: resume.skills?.reduce((total, skill) => 
        total + (skill.keywords?.length || 0), 0) || 0
    }
  };
}