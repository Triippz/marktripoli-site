import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Resume = {
  basics?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: { city?: string; region?: string; countryCode?: string };
    profiles?: { network?: string; url?: string; username?: string }[];
    summary?: string;
    label?: string;
  };
  work?: any[];
  education?: any[];
};

type Profile = {
  title?: string;
  tagline?: string;
  location?: string;
  contact?: { email?: string; website?: string; linkedin?: string; github?: string };
  strengths?: string[];
  interests?: string[];
};

export default function ExecutiveBrief() {
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, p] = await Promise.all([
          fetch('/resume.json').then(res => res.json()),
          fetch('/profile.json').then(res => res.ok ? res.json() : null).catch(() => null)
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

  const name = resume?.basics?.name || 'MARK TRIPOLI';
  const title = profile?.title || resume?.basics?.label || 'ENGINEERING MANAGER & TECHNICAL LEAD';
  const summary = resume?.basics?.summary || profile?.tagline;
  const location = profile?.location || [resume?.basics?.location?.city, resume?.basics?.location?.region].filter(Boolean).join(', ');

  // Aggregate tech from resume x_* fields
  const stacks = useMemo(() => {
    const agg = { languages: new Set<string>(), frameworks: new Set<string>(), technologies: new Set<string>(), skills: new Set<string>() };
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
      languages: Array.from(agg.languages),
      frameworks: Array.from(agg.frameworks),
      technologies: Array.from(agg.technologies),
      skills: Array.from(agg.skills)
    };
  }, [resume]);

  if (error) {
    return (
      <div className="p-6 text-red-400 font-mono">{error}</div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mission-panel p-6 text-center">
          <div className="holo-text font-mono text-xl mb-2">EXECUTIVE BRIEFING</div>
          <div className="text-green-400 font-mono text-sm">Loading dossier…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-y-auto text-white">
      <div className="fixed top-4 left-4 z-50">
        <button className="tactical-button text-xs px-3 py-2" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-16">
        {/* Header */}
        <div className="mission-panel p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="holo-text font-mono text-3xl md:text-4xl mb-1">{name}</div>
              <div className="text-green-500 font-mono text-sm md:text-base">{title}</div>
            </div>
          </div>
          {summary && (
            <div className="text-gray-300 font-mono text-sm mt-4">{summary}</div>
          )}
          <div className="text-gray-400 font-mono text-xs mt-3">{location}</div>
        </div>

        {/* Contact & Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="tactical-glass p-4">
            <div className="text-green-400 font-mono text-xs mb-2">Contact</div>
            <div className="text-xs font-mono space-y-1">
              <div>Email: <a className="text-green-300 hover:text-green-200" href={`mailto:${profile?.contact?.email || resume?.basics?.email}`}>{profile?.contact?.email || resume?.basics?.email}</a></div>
              {profile?.contact?.website && (<div>Web: <a className="text-green-300 hover:text-green-200" href={profile.contact.website} target="_blank">{profile.contact.website}</a></div>)}
              {profile?.contact?.linkedin && (<div>LinkedIn: <a className="text-green-300 hover:text-green-200" href={profile.contact.linkedin} target="_blank">Profile</a></div>)}
              {profile?.contact?.github && (<div>GitHub: <a className="text-green-300 hover:text-green-200" href={profile.contact.github} target="_blank">Repos</a></div>)}
            </div>
          </div>
          <div className="tactical-glass p-4 md:col-span-2">
            <div className="text-green-400 font-mono text-xs mb-2">Strengths</div>
            <div className="flex flex-wrap gap-2">
              {(profile?.strengths || []).map((s, i) => (
                <span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[11px]">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stacks */}
        <div className="mission-panel p-6 md:p-8 mb-6">
          <div className="flex flex-col gap-3">
            {stacks.languages.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-green-400 font-mono text-xs">Languages:</span>
                <div className="flex flex-wrap gap-1">
                  {stacks.languages.map((t, i) => (<span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>))}
                </div>
              </div>
            )}
            {stacks.frameworks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-green-400 font-mono text-xs">Frameworks:</span>
                <div className="flex flex-wrap gap-1">
                  {stacks.frameworks.map((t, i) => (<span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>))}
                </div>
              </div>
            )}
            {stacks.technologies.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-green-400 font-mono text-xs">Technologies:</span>
                <div className="flex flex-wrap gap-1">
                  {stacks.technologies.map((t, i) => (<span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>))}
                </div>
              </div>
            )}
            {stacks.skills.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-green-400 font-mono text-xs">Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {stacks.skills.map((t, i) => (<span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Experience & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="tactical-glass p-4">
            <div className="holo-text font-mono text-lg mb-2">Experience</div>
            <div className="space-y-3">
              {(resume?.work || []).map((w: any, i: number) => (
                <div key={i} className="border border-green-500/20 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm text-green-300">{w.name}</div>
                    <div className="text-xs font-mono text-gray-400">{w.startDate} – {w.endDate || 'Present'}</div>
                  </div>
                  {w.position && <div className="text-xs font-mono text-white">{w.position}</div>}
                  {w.summary && <div className="text-[11px] font-mono text-gray-300 mt-1">{w.summary}</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="tactical-glass p-4">
            <div className="holo-text font-mono text-lg mb-2">Education</div>
            <div className="space-y-3">
              {(resume?.education || []).map((e: any, i: number) => (
                <div key={i} className="border border-green-500/20 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm text-green-300">{e.institution}</div>
                    <div className="text-xs font-mono text-gray-400">{e.startDate ? `${e.startDate} – ${e.endDate || 'Present'}` : e.endDate}</div>
                  </div>
                  <div className="text-xs font-mono text-white">{e.studyType} {e.area && `in ${e.area}`}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
