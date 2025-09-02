import { useState, useEffect } from 'react';
import type { Resume } from '../../types/resume';

interface EducationCardProps {
  resume: Resume | null;
}

export function EducationCard({ resume }: EducationCardProps) {
  const [repoMeta, setRepoMeta] = useState<Record<string, { stars: number; forks: number; fetchedAt: number }>>({});

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

  return (
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
  );
}