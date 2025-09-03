import { Header, ContactCard, StrengthsCard, Timeline, TechStacks, ExperienceCard, EducationCard, ProjectsCard, LeadershipSection, TechnicalCraftSection, CollapsibleCard } from './';
import type { Resume, Profile } from '../../types/resume';
import { useResponsive } from '../../../../hooks/useResponsive';

interface MainContentProps {
  metadata: {
    name: string;
    title: string;
    location: string;
    summary?: string;
    clearance?: string;
    updatedAt?: string;
  };
  resume: Resume | null;
  profile: Profile | null;
  stacks: {
    languages: string[];
    frameworks: string[];
    technologies: string[];
    skills: string[];
  };
  strengths: string[];
  glitchTitle: boolean;
}

export function MainContent({ 
  metadata, 
  resume, 
  profile, 
  stacks, 
  strengths, 
  glitchTitle 
}: MainContentProps) {
  const { isMobile } = useResponsive();
  
  return (
    <div className={`max-w-5xl mx-auto px-4 md:px-8 pb-16 ${
      isMobile ? 'pt-4' : 'py-8' // Reduced top padding on mobile since sticky nav handles spacing
    }`}>
      {/* Header Section */}
      <Header
        name={metadata.name}
        title={metadata.title}
        location={metadata.location}
        summary={metadata.summary}
        clearance={metadata.clearance}
        updatedAt={metadata.updatedAt}
        glitchTitle={glitchTitle}
      />

      {/* Contact & Strengths Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ContactCard resume={resume} profile={profile} />
        <StrengthsCard strengths={strengths} />
      </div>

      {/* Mission Timeline */}
      {(resume?.work && resume.work.length > 0) && (
        <CollapsibleCard title="Mission Timeline" storageKey="mission-timeline">
          <Timeline work={resume.work} />
        </CollapsibleCard>
      )}

      {/* Leadership Section */}
      <LeadershipSection profile={profile} />

      {/* Technical Craft Section */}
      <TechnicalCraftSection profile={profile} />

      {/* Experience & Education/Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <CollapsibleCard title="Experience" storageKey="experience" className="tactical-glass p-4">
          <ExperienceCard resume={resume} />
        </CollapsibleCard>
        <div className="space-y-6">
          <CollapsibleCard title="Education" storageKey="education" className="tactical-glass p-4">
            <EducationCard resume={resume} />
          </CollapsibleCard>
          <CollapsibleCard title="Key Projects" storageKey="projects" className="tactical-glass p-4">
            <ProjectsCard resume={resume} />
          </CollapsibleCard>
        </div>
      </div>

      {/* Tech Stacks */}
      <CollapsibleCard title="Tech Stacks" storageKey="tech-stacks">
        <TechStacks stacks={stacks} />
      </CollapsibleCard>
    </div>
  );
}