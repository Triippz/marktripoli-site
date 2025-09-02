import { Dispatch, SetStateAction } from 'react';

export type Resume = {
  basics?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: { city?: string; region?: string; countryCode?: string };
    profiles?: { network?: string; url?: string; username?: string }[];
    summary?: string;
    label?: string;
    x_strengths?: string[];
  };
  work?: Array<{
    name?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
    x_languages?: string[];
    x_frameworks?: string[];
    x_technologies?: string[];
    x_skills?: string[];
  }>;
  education?: any[];
  awards?: Array<{ title?: string; date?: string; awarder?: string; summary?: string }>;
  meta?: { clearance?: string; createdAt?: string };
  projects?: Array<{ name?: string; description?: string; url?: string; keywords?: string[] }>;
};

export type Profile = {
  title?: string;
  tagline?: string;
  location?: string;
  contact?: { email?: string; website?: string; linkedin?: string; github?: string };
  strengths?: string[];
  interests?: string[];
};

export interface ResumeDataContextType {
  resume: Resume | null;
  profile: Profile | null;
  error: string | null;
  loading: boolean;
  repoMeta: Record<string, { stars: number; forks: number; fetchedAt: number }>;
  setRepoMeta: Dispatch<SetStateAction<Record<string, { stars: number; forks: number; fetchedAt: number }>>>;
}