import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Resume, Profile, ResumeDataContextType } from '../types/resume';

const ResumeDataContext = createContext<ResumeDataContextType | null>(null);

interface ResumeDataProviderProps {
  children: ReactNode;
}

export function ResumeDataProvider({ children }: ResumeDataProviderProps) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [repoMeta, setRepoMeta] = useState<Record<string, { stars: number; forks: number; fetchedAt: number }>>({});

  useEffect(() => {
    const load = async () => {
      try {
        // Add cache-busting timestamp to prevent stale data
        const timestamp = Date.now();
        const [r, p] = await Promise.all([
          fetch(`/resume.json?v=${timestamp}`).then(res => res.json()),
          fetch(`/profile.json?v=${timestamp}`).then(res => res.ok ? res.json() : null).catch(() => null)
        ]);
        setResume(r);
        setProfile(p);
      } catch (e: any) {
        setError(e?.message || 'Failed to load briefing');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const value: ResumeDataContextType = {
    resume,
    profile,
    error,
    loading,
    repoMeta,
    setRepoMeta
  };

  return (
    <ResumeDataContext.Provider value={value}>
      {children}
    </ResumeDataContext.Provider>
  );
}

export function useResumeData() {
  const context = useContext(ResumeDataContext);
  if (!context) {
    throw new Error('useResumeData must be used within ResumeDataProvider');
  }
  return context;
}