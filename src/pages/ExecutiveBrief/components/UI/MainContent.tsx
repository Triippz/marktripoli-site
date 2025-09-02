import { Header, ContactCard, StrengthsCard, Timeline, TechStacks, ExperienceCard, EducationCard } from './';
import type { Resume, Profile } from '../../types/resume';

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
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-16">
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
        <div className="mission-panel p-6 md:p-8 mb-6">
          <div className="holo-text font-mono text-lg mb-3">Mission Timeline</div>
          <Timeline work={resume.work} />
        </div>
      )}

      {/* Experience & Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ExperienceCard resume={resume} />
        <EducationCard resume={resume} />
      </div>

      {/* Tech Stacks */}
      <TechStacks stacks={stacks} />
    </div>
  );
}