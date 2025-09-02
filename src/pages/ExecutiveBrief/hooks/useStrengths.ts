import { useMemo } from 'react';
import type { Resume, Profile } from '../types/resume';

export function useStrengths(resume: Resume | null, profile: Profile | null) {
  return useMemo(() => {
    const resumeStrengths = resume?.basics?.x_strengths || [];
    const profileStrengths = profile?.strengths || [];
    const merged = [...resumeStrengths, ...profileStrengths];
    
    return merged.filter(s => {
      if (!s || typeof s !== 'string') return false;
      const clean = s.trim();
      return clean.length > 0 && clean.length < 50; // reasonable length
    }).slice(0, 12); // max 12 items for display
  }, [resume, profile]);
}