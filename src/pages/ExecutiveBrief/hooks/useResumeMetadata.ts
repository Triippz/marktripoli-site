import { useMemo } from 'react';
import type { Resume, Profile } from '../types/resume';

export function useResumeMetadata(resume: Resume | null, profile: Profile | null) {
  return useMemo(() => {
    const name = resume?.basics?.name || 'MARK TRIPOLI';
    const title = profile?.title || resume?.basics?.label || 'ENGINEERING MANAGER & TECHNICAL LEAD';
    const summary = resume?.basics?.summary || profile?.tagline;
    const location = profile?.location || [resume?.basics?.location?.city, resume?.basics?.location?.region].filter(Boolean).join(', ');
    const updatedAt = resume?.meta?.createdAt;
    const clearance = resume?.meta?.clearance;

    return {
      name,
      title,
      summary,
      location,
      updatedAt,
      clearance
    };
  }, [resume, profile]);
}