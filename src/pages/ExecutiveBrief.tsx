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
  const [repoMeta, setRepoMeta] = useState<Record<string, { stars: number; forks: number; fetchedAt: number }>>({});

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
  const updatedAt = resume?.meta?.createdAt;
  const clearance = resume?.meta?.clearance;

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

  // Merge strengths: prefer resume.basics.x_strengths, fall back to profile.strengths
  const strengths = useMemo(() => {
    const a = (resume?.basics?.x_strengths || []) as string[];
    const b = (profile?.strengths || []) as string[];
    const merged = [...a, ...b].filter(Boolean);
    const seen = new Set<string>();
    return merged.filter(s => {
      const k = s.trim().toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [resume, profile]);

  // Top highlights for print-only resume: aggregate and prefer quantified items
  const topHighlights = useMemo(() => {
    const items: string[] = [];
    (resume?.work || []).forEach(w => {
      (w?.highlights || []).forEach(h => { if (h) items.push(h); });
    });
    const metricRe = /\b\d+(?:[.,]\d+)?%\b|\b\$\s?\d|\b\d+\s?(?:k|m|b)\b|\bSLA\b|\brequests\b|\bdeploy\b|\bbuild\b|\bIL5\b|\bIL6\b|\bFedRAMP\b/i;
    const withMetric: string[] = [];
    const withoutMetric: string[] = [];
    items.forEach(h => (metricRe.test(h) ? withMetric.push(h) : withoutMetric.push(h)));
    const ordered = [...withMetric, ...withoutMetric];
    const seen = new Set<string>();
    const uniq: string[] = [];
    for (const h of ordered) {
      const k = h.trim();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      uniq.push(k);
      if (uniq.length >= 6) break;
    }
    return uniq;
  }, [resume]);

  // Fetch GitHub repo meta (stars/forks) for side projects without API key, with simple localStorage cache
  useEffect(() => {
    const projects = (resume?.projects || []).filter(p => (p.url || '').includes('github.com'));
    if (projects.length === 0) return;

    const TTL_MS = 24 * 60 * 60 * 1000; // 24h
    const cacheKey = 'ghRepoMetaCache';
    let cache: Record<string, { stars: number; forks: number; fetchedAt: number }>; 
    try { cache = JSON.parse(localStorage.getItem(cacheKey) || '{}'); } catch { cache = {}; }

    const parseRepo = (url?: string) => {
      if (!url) return null;
      try {
        const u = new URL(url);
        if (u.hostname !== 'github.com') return null;
        const parts = u.pathname.split('/').filter(Boolean); // [owner, repo, ...]
        if (parts.length < 2) return null;
        return `${parts[0]}/${parts[1]}`;
      } catch {
        return null;
      }
    };

    const keys = Array.from(new Set(projects.map(p => parseRepo(p.url)).filter(Boolean) as string[]));
    const now = Date.now();
    const toFetch = keys.filter(k => !cache[k] || (now - cache[k].fetchedAt) > TTL_MS);

    if (toFetch.length === 0) {
      setRepoMeta(prev => ({ ...prev, ...cache }));
      return;
    }

    Promise.allSettled(toFetch.map(async k => {
      const resp = await fetch(`https://api.github.com/repos/${k}`);
      if (!resp.ok) throw new Error(`GitHub ${k}: ${resp.status}`);
      const data = await resp.json();
      const stars = typeof data.stargazers_count === 'number' ? data.stargazers_count : 0;
      const forks = typeof data.forks_count === 'number' ? data.forks_count : 0;
      cache[k] = { stars, forks, fetchedAt: now };
      return { k, stars, forks };
    })).then(() => {
      try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch {}
      setRepoMeta(prev => ({ ...prev, ...cache }));
    }).catch(() => {
      setRepoMeta(prev => ({ ...prev, ...cache }));
    });
  }, [resume]);

  // Removed impact badges from header; keeping UI minimal per feedback

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
      {/* Screen-only Briefing UI */}
      <div className="screen-only">
        <div className="fixed top-4 left-4 z-50 flex gap-2">
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
              <div className="flex flex-col items-end gap-1">
                {clearance && (
                  <div className="text-[10px] font-mono text-green-300 border border-green-500/40 px-2 py-0.5 rounded">Clearance: {clearance}</div>
                )}
                {updatedAt && (
                  <div className="text-[10px] font-mono text-gray-400">Updated: {new Date(updatedAt).toLocaleDateString()}</div>
                )}
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
                {strengths.map((s, i) => (
                  <span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[11px]">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Mission Timeline */}
          {(resume?.work && resume.work.length > 0) && (
            <div className="mission-panel p-6 md:p-8 mb-6">
              <div className="holo-text font-mono text-lg mb-3">Mission Timeline</div>
              <Timeline work={resume.work} />
            </div>
          )}

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
              {/* Awards */}
              {Array.isArray(resume?.awards) && resume!.awards!.length > 0 && (
                <div className="mt-4">
                  <div className="holo-text font-mono text-lg mb-2">Awards</div>
                  <div className="space-y-2">
                    {resume!.awards!.map((a, i) => (
                      <div key={i} className="border border-green-500/20 rounded p-3">
                        <div className="font-mono text-sm text-green-300">{a.title}</div>
                        <div className="text-[11px] font-mono text-gray-400">{[a.awarder, a.date].filter(Boolean).join(' • ')}</div>
                        {a.summary && (<div className="text-[11px] font-mono text-gray-300 mt-1">{a.summary}</div>)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Side Projects (GitHub) */}
              {Array.isArray(resume?.projects) && (resume!.projects!.some(p => (p.url || '').includes('github.com'))) && (
                <div className="mt-4">
                  <div className="holo-text font-mono text-lg mb-2">Side Projects</div>
                  <div className="space-y-2">
                    {resume!.projects!.filter(p => (p.url || '').includes('github.com')).slice(0, 6).map((p, i) => {
                      const url = p.url || '';
                      let repoKey: string | null = null;
                      try {
                        const u = new URL(url);
                        const parts = u.pathname.split('/').filter(Boolean);
                        if (u.hostname === 'github.com' && parts.length >= 2) repoKey = `${parts[0]}/${parts[1]}`;
                      } catch {}
                      const meta = repoKey ? repoMeta[repoKey] : undefined;
                      return (
                       <div key={i} className="border border-green-500/20 rounded p-3">
                         <div className="flex items-center justify-between gap-2">
                            <a className="font-mono text-sm text-green-300 truncate hover:text-green-200" title={p.name} href={url} target="_blank" rel="noreferrer">{p.name}</a>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-gray-300">
                              {typeof meta?.stars === 'number' && (<span>★ {meta.stars}</span>)}
                              {typeof meta?.forks === 'number' && (<span>⑂ {meta.forks}</span>)}
                              {!meta && (<span className="text-gray-500">…</span>)}
                            </div>
                          </div>
                        {p.description && (<div className="text-[11px] font-mono text-gray-300 mt-1">{p.description}</div>)}
                        {Array.isArray(p.keywords) && p.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.keywords.slice(0, 6).map((k, idx) => (
                              <span key={idx} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{k}</span>
                            ))}
                          </div>
                        )}
                        </div>
                      );})}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print-only: clean resume layout */}
      <div className="print-only p-8 text-black">
        <div style={{ pageBreakInside: 'avoid' }}>
          <div className="text-2xl font-semibold">{resume?.basics?.name}</div>
          <div className="text-sm mt-1">
            {resume?.basics?.email}{resume?.basics?.phone ? ` • ${resume?.basics?.phone}` : ''}{location ? ` • ${location}` : ''}
          </div>
        </div>
        {topHighlights.length > 0 && (
          <div className="mt-3" style={{ pageBreakInside: 'avoid' }}>
            <div className="font-semibold text-sm">Highlights</div>
            <ul className="list-disc ml-5 text-sm mt-1">
              {topHighlights.map((h, i) => (<li key={i}>{h}</li>))}
            </ul>
          </div>
        )}

        {/* Skills (compact) */}
        {Array.isArray((resume as any)?.skills) && (resume as any).skills.length > 0 && (
          <div className="mt-4" style={{ pageBreakInside: 'avoid' }}>
            <div className="font-semibold text-sm">Skills</div>
            <div className="text-sm">
              {((resume as any).skills as any[]).map((s, i) => (
                <div key={i}><span className="font-medium">{s.name}:</span> {(s.keywords || []).join(', ')}</div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {Array.isArray(resume?.work) && (resume!.work!.length > 0) && (
          <div className="mt-5" style={{ pageBreakInside: 'avoid' }}>
            <div className="font-semibold text-sm">Experience</div>
            <div className="mt-1 space-y-3">
              {resume!.work!.map((w, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between text-sm">
                    <div className="font-medium">{w.name}{w.position ? ` — ${w.position}` : ''}</div>
                    <div className="text-gray-700">{w.startDate} – {w.endDate || 'Present'}</div>
                  </div>
                  {w.summary && (<div className="text-sm">{w.summary}</div>)}
                  {Array.isArray(w.highlights) && w.highlights.length > 0 && (
                    <ul className="list-disc ml-5 text-sm mt-1">
                      {w.highlights.map((h, j) => (<li key={j}>{h}</li>))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {Array.isArray(resume?.education) && resume!.education!.length > 0 && (
          <div className="mt-5" style={{ pageBreakInside: 'avoid' }}>
            <div className="font-semibold text-sm">Education</div>
            <div className="mt-1 space-y-2">
              {resume!.education!.map((e: any, i: number) => (
                <div key={i} className="text-sm flex justify-between">
                  <div>
                    <div className="font-medium">{e.institution}</div>
                    <div>{e.studyType}{e.area ? ` in ${e.area}` : ''}</div>
                  </div>
                  <div className="text-gray-700">{e.startDate ? `${e.startDate} – ${e.endDate || 'Present'}` : e.endDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards (optional) */}
        {Array.isArray(resume?.awards) && resume!.awards!.length > 0 && (
          <div className="mt-5" style={{ pageBreakInside: 'avoid' }}>
            <div className="font-semibold text-sm">Awards</div>
            <div className="mt-1 space-y-1 text-sm">
              {resume!.awards!.map((a, i) => (
                <div key={i}>{a.title}{a.awarder ? ` — ${a.awarder}` : ''}{a.date ? ` (${a.date})` : ''}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components and utilities
function Timeline({ work }: { work: NonNullable<Resume['work']> }) {
  const items = useMemo(() => {
    const parse = (ym?: string) => {
      if (!ym) return null;
      // Accept YYYY or YYYY-MM; fallback to first day
      const d = ym.length === 7 ? new Date(`${ym}-01`) : new Date(`${ym}-01-01`);
      return isNaN(d.getTime()) ? null : d;
    };
    const dur = (start: Date | null, end: Date | null) => {
      const s = start ? start : null;
      const e = end ? end : new Date();
      if (!s || !e) return '';
      let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
      if (months < 0) months = 0;
      const years = Math.floor(months / 12);
      const rem = months % 12;
      const y = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : '';
      const m = rem > 0 ? `${rem} mo${rem > 1 ? 's' : ''}` : '';
      return [y, m].filter(Boolean).join(' ');
    };
    const metricRe = /\b\d+(?:[.,]\d+)?%\b|\b\$\s?\d|\b\d+\s?(?:k|m|b)\b|\bSLA\b|\brequests\b|\bdeploy\b|\bbuild\b|\bIL5\b|\bIL6\b|\bFedRAMP\b/i;
    const pickHighlight = (h: string[] | undefined) => {
      if (!h || h.length === 0) return null;
      const metric = h.find(x => metricRe.test(x));
      return metric || h[0];
    };
    const enriched = work.map(w => {
      const s = parse(w.startDate);
      const e = parse(w.endDate || undefined);
      return {
        name: w.name || '',
        position: w.position || '',
        startDate: w.startDate,
        endDate: w.endDate,
        start: s,
        end: e,
        duration: dur(s, e),
        logo: (w as any).x_logo as string | undefined,
        highlight: pickHighlight(w.highlights),
      };
    });
    enriched.sort((a, b) => {
      const at = a.start ? a.start.getTime() : 0;
      const bt = b.start ? b.start.getTime() : 0;
      return bt - at; // most recent first
    });
    return enriched;
  }, [work]);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-stretch gap-6 min-w-max pb-2">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col items-start">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <div className="text-xs font-mono text-gray-300">{it.startDate} – {it.endDate || 'Present'}</div>
            </div>
            <div className="mt-2 border border-green-500/30 rounded p-3 w-64">
              <div className="flex items-center gap-2">
                {it.logo && (<img src={it.logo} alt={it.name} className="h-6 w-6 object-contain" />)}
                <div className="font-mono text-green-300 text-sm truncate" title={it.name}>{it.name}</div>
              </div>
              {it.position && (<div className="text-[11px] font-mono text-white mt-0.5">{it.position}</div>)}
              {it.duration && (<div className="text-[10px] font-mono text-gray-400 mt-0.5">{it.duration}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
