import { useMemo } from 'react';
import type { Resume } from '../types/resume';

export function useTechStacks(resume: Resume | null) {
  return useMemo(() => {
    const agg = { 
      languages: new Set<string>(), 
      frameworks: new Set<string>(), 
      technologies: new Set<string>(), 
      skills: new Set<string>() 
    };

    (resume?.work || []).forEach((w: any) => {
      (w.x_languages || []).forEach((x: string) => agg.languages.add(x));
      (w.x_frameworks || []).forEach((x: string) => agg.frameworks.add(x));
      (w.x_technologies || []).forEach((x: string) => agg.technologies.add(x));
      (w.x_skills || []).forEach((x: string) => agg.skills.add(x));
    });

    (resume?.education || []).forEach((e: any) => {
      (e.x_languages || []).forEach((x: string) => agg.languages.add(x));
      (e.x_frameworks || []).forEach((x: string) => agg.frameworks.add(x));
      (e.x_technologies || []).forEach((x: string) => agg.technologies.add(x));
      (e.x_skills || []).forEach((x: string) => agg.skills.add(x));
    });

    return {
      languages: Array.from(agg.languages).sort(),
      frameworks: Array.from(agg.frameworks).sort(),
      technologies: Array.from(agg.technologies).sort(),
      skills: Array.from(agg.skills).sort(),
    };
  }, [resume]);
}