import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMissionControl } from '../store/missionControl';
import { createDefaultFS, resolvePath as fsResolve, isDir as fsIsDir, listDir as fsList, readFile as fsRead } from '../utils/fauxFS';

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
  const { unlockEasterEgg, triggerAlert } = useMissionControl() as any;
  const [resume, setResume] = useState<Resume | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [repoMeta, setRepoMeta] = useState<Record<string, { stars: number; forks: number; fetchedAt: number }>>({});
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [ufos, setUfos] = useState<Array<{ id: string; top: number; dur: number; width: number; height: number }>>([]);
  const [pawPrints, setPawPrints] = useState<Array<{ id: string; left: number; size: number; dur: number; delay: number }>>([]);
  const [glitchTitle, setGlitchTitle] = useState<boolean>(false);
  const [neonPulse, setNeonPulse] = useState<boolean>(false);
  const [scanlines, setScanlines] = useState<boolean>(false);
  const [mountains, setMountains] = useState<Array<{ id: string; left: number; size: number; dur: number; delay: number }>>([]);
  const [beamOn, setBeamOn] = useState<boolean>(false);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [termOpen, setTermOpen] = useState<boolean>(false);
  const [termLines, setTermLines] = useState<string[]>(["MC-TERM v0.1 — type 'help'", ""]);
  const [termInput, setTermInput] = useState<string>('');
  const [awaitPass, setAwaitPass] = useState<boolean>(false);
  const [admin, setAdmin] = useState<boolean>(false);
  const [wrongPass, setWrongPass] = useState<number>(0);
  const [alertMode, setAlertMode] = useState<boolean>(false);
  const [puzzleStage, setPuzzleStage] = useState<number>(0);
  const fsRoot = useMemo(() => createDefaultFS(), []);
  const [cwd, setCwd] = useState<string>('/');

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

  // Console hint for discoverability
  useEffect(() => {
    try { console.log('%c[Hint]', 'color:#45ffb0', 'Press ? on /briefing for hidden controls.'); } catch {}
  }, []);

  // Easter egg listeners: Konami (Matrix), U (UFO fleet), D (paws), G (glitch), P (neon), H (hiking), V (scanlines), B (beam), ` or Ctrl/Cmd+Alt+T (terminal)
  useEffect(() => {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let buffer: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      // UFO fleet on 'u'
      if (key.toLowerCase() === 'u') {
        const count = 3 + Math.floor(Math.random() * 3); // 3-5
        const newOnes = Array.from({ length: count }).map(() => {
          const top = 40 + Math.floor(Math.random() * 220); // px from top
          const dur = 6 + Math.random() * 5; // 6s - 11s
          const width = 80 + Math.floor(Math.random() * 80);
          const height = Math.round(width * 0.5);
          return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, top, dur, width, height };
        });
        newOnes.forEach(({ id, dur }) => setTimeout(() => setUfos(prev => prev.filter(u => u.id !== id)), Math.ceil(dur * 1000) + 300));
        setUfos(prev => [...prev, ...newOnes]);
      }
      // Paw prints on 'd'
      if (key.toLowerCase() === 'd') {
        const count = 16 + Math.floor(Math.random() * 16);
        const newPaws = Array.from({ length: count }).map(() => {
          const left = Math.floor(Math.random() * 100); // vw
          const size = 14 + Math.floor(Math.random() * 14); // px
          const dur = 5 + Math.random() * 6; // 5-11s
          const delay = Math.random() * 1.5; // 0-1.5s
          return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, left, size, dur, delay };
        });
        const maxDur = Math.max(...newPaws.map(p => p.dur + p.delay));
        setTimeout(() => setPawPrints(prev => prev.filter(p => !newPaws.find(n => n.id === p.id))), Math.ceil(maxDur * 1000) + 300);
        setPawPrints(prev => [...prev, ...newPaws]);
      }
      // Glitch title on 'g'
      if (key.toLowerCase() === 'g') {
        setGlitchTitle(true);
        setTimeout(() => setGlitchTitle(false), 3000);
      }
      // Neon pulse on 'p'
      if (key.toLowerCase() === 'p') {
        setNeonPulse(true);
        setTimeout(() => setNeonPulse(false), 2200);
      }
      // Hiking mode on 'h'
      if (key.toLowerCase() === 'h') {
        const count = 12 + Math.floor(Math.random() * 12);
        const newMountains = Array.from({ length: count }).map(() => {
          const left = Math.floor(Math.random() * 100);
          const size = 18 + Math.floor(Math.random() * 20);
          const dur = 7 + Math.random() * 6;
          const delay = Math.random() * 1.5;
          return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, left, size, dur, delay };
        });
        const maxDur = Math.max(...newMountains.map(m => m.dur + m.delay));
        setTimeout(() => setMountains(prev => prev.filter(m => !newMountains.find(n => n.id === m.id))), Math.ceil(maxDur * 1000) + 300);
        setMountains(prev => [...prev, ...newMountains]);
      }
      // Video game scanlines on 'v'
      if (key.toLowerCase() === 'v') {
        setScanlines(v => !v);
      }
      // UFO beam on 'b'
      if (key.toLowerCase() === 'b') {
        setBeamOn(true);
        setTimeout(() => setBeamOn(false), 3500);
      }
      // Secret help overlay on '?' (or Shift+/)
      if (key === '?' || (key === '/' && e.shiftKey)) {
        setHelpOpen(v => !v);
      }
      if (key === 'Escape' && helpOpen) {
        setHelpOpen(false);
      }
      // Secret terminal (support Ctrl+Alt+T and Cmd+Alt+T)
      if (
        key === '`' ||
        ((e.ctrlKey || e.metaKey) && e.altKey && key.toLowerCase() === 't')
      ) {
        setTermOpen(v => !v);
      }
      // Konami buffer
      buffer.push(key);
      if (buffer.length > seq.length) buffer.shift();
      if (seq.every((k, i) => buffer[i]?.toLowerCase() === k.toLowerCase())) {
        setShowMatrix(v => !v);
        buffer = [];
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); };
  }, [helpOpen]);

  // Terminal command handling
  const promptUser = () => (admin ? 'root@mc' : 'guest@mc') + ':' + cwd + '$';
  const appendTerm = (line: string = '') => setTermLines(prev => [...prev, line]);
  const triggerEgg = (name: string): boolean => {
    switch (name) {
      case 'matrix': setShowMatrix(v => !v); return true;
      case 'ufo': {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const top = 40 + Math.floor(Math.random() * 220);
        const dur = 6 + Math.random() * 5; const width = 100; const height = 50;
        setUfos(prev => [...prev, { id, top, dur, width, height }]);
        setTimeout(() => setUfos(prev => prev.filter(u => u.id !== id)), Math.ceil(dur * 1000) + 300);
        return true; }
      case 'paws': {
        const now = Date.now(); const count = 12;
        const batch = Array.from({ length: count }).map((_, i) => ({ id: `${now}-${i}`, left: Math.floor(Math.random()*100), size: 14+Math.floor(Math.random()*14), dur: 5+Math.random()*6, delay: Math.random()*1.2 }));
        setPawPrints(prev => [...prev, ...batch]);
        setTimeout(() => setPawPrints(prev => prev.filter(p => !batch.find(b => b.id === p.id))), 9000);
        return true; }
      case 'glitch': setGlitchTitle(true); setTimeout(() => setGlitchTitle(false), 3000); return true;
      case 'neon': setNeonPulse(true); setTimeout(() => setNeonPulse(false), 2200); return true;
      case 'scanlines': setScanlines(v => !v); return true;
      case 'beam': setBeamOn(true); setTimeout(() => setBeamOn(false), 3500); return true;
      case 'hiking': {
        const now = Date.now(); const count = 10;
        const batch = Array.from({ length: count }).map((_, i) => ({ id: `${now}-${i}`, left: Math.floor(Math.random()*100), size: 18+Math.floor(Math.random()*20), dur: 7+Math.random()*6, delay: Math.random()*1.5 }));
        setMountains(prev => [...prev, ...batch]);
        setTimeout(() => setMountains(prev => prev.filter(m => !batch.find(b => b.id === m.id))), 11000);
        return true; }
      default: return false;
    }
  };

  const runTermCommand = (raw: string) => {
    const input = raw.trim();
    // Puzzle handling
    if (puzzleStage === 1) {
      if (input.toLowerCase().includes('follow') && input.toLowerCase().includes('rabbit')) {
        appendTerm('RIDDLE SOLVED. The matrix acknowledges your curiosity.');
        setPuzzleStage(0);
        try { unlockEasterEgg('code_breaker'); } catch {}
      } else {
        appendTerm('Hint: what did Morpheus say to Neo?');
      }
      return;
    }
    if (awaitPass) {
      if (input === 'legion' || input === 'LEGION') {
        appendTerm('ACCESS GRANTED. Welcome, operator.');
        setAdmin(true); setAwaitPass(false); setWrongPass(0);
        try { unlockEasterEgg('hidden_commands'); } catch {}
      } else {
        appendTerm('ACCESS DENIED.');
        const next = wrongPass + 1; setWrongPass(next); setAwaitPass(false);
        if (next >= 3) { setAlertMode(true); try { triggerAlert(6000); } catch {}; setTimeout(() => setAlertMode(false), 4000); setWrongPass(0); }
      }
      return;
    }
    if (!input) { appendTerm(); return; }
    const [cmd, ...args] = input.split(/\s+/);
    switch (cmd.toLowerCase()) {
      case 'help':
        appendTerm('Commands: help, clear, login, eggs, trigger <name>, scan, unlock-all, exit');
        appendTerm('Linux-ish: pwd, ls, whoami, uname -a, date, echo <txt>, cat <file>, man <cmd>, sudo su');
        appendTerm('Map link: companies, goto hq <company>, hq <company>');
        appendTerm("Eggs: matrix, ufo, paws, glitch, neon, scanlines, beam, hiking");
        break;
      case 'clear':
      case 'cls':
        setTermLines(["MC-TERM v0.1 — type 'help'", ""]);
        break;
      case 'login':
        setAwaitPass(true); appendTerm('Password:');
        break;
      case 'eggs':
        appendTerm('Available (screen): matrix, ufo, paws, glitch, neon, scanlines, beam, hiking.');
        appendTerm('Map (idle/geofence): ping, streak, aurora, ring, radar, sand, stars, neonSweep.');
        break;
      case 'puzzle':
        appendTerm('RIDDLE: The signal hides in green rain. What must you do?');
        setPuzzleStage(1);
        break;
      case 'trigger': {
        const name = (args[0] || '').toLowerCase();
        if (!name) { appendTerm('Usage: trigger <name>'); break; }
        const ok = triggerEgg(name);
        appendTerm(ok ? `Triggered: ${name}` : `Unknown egg: ${name}`);
        break; }
      case 'scan':
        ['matrix','ufo','paws','glitch','neon','scanlines','beam','hiking'].forEach((n, i) => setTimeout(() => triggerEgg(n), i * 250));
        appendTerm('Scanning…');
        break;
      case 'unlock-all':
        if (!admin) { appendTerm('Insufficient clearance. Use login.'); break; }
        ['matrix','ufo','paws','glitch','neon','scanlines','beam','hiking'].forEach((n, i) => setTimeout(() => triggerEgg(n), i * 180));
        appendTerm('All systems engaged.');
        try { unlockEasterEgg('easter_hunter'); } catch {}
        break;
      case 'companies': {
        const names = Array.from(new Set((resume?.work || []).map(w => w.name).filter(Boolean)));
        appendTerm(names.join(', ') || '(none)');
        break; }
      case 'hq':
      case 'goto': {
        const isGotoHq = cmd.toLowerCase() === 'goto' && (args[0] || '').toLowerCase() === 'hq';
        const query = cmd.toLowerCase() === 'hq' ? args.join(' ') : (isGotoHq ? args.slice(1).join(' ') : '');
        if (!query) { appendTerm('Usage: hq <company> | goto hq <company>'); break; }
        // Navigate to map with query param
        const params = new URLSearchParams(window.location.search);
        params.set('hq', query);
        window.history.replaceState({}, '', '/');
        window.location.href = '/?'+params.toString();
        setTermOpen(false);
        appendTerm(`Opening map for HQ: ${query}`);
        break; }
      case 'exit':
      case 'close':
        setTermOpen(false);
        appendTerm('Session closed.');
        break;
      default:
        // Linux-ish
        if (cmd === 'pwd') { appendTerm(cwd); break; }
        if (cmd === 'cd') {
          const target = (args[0] || '/');
          const next = fsResolve(cwd, target);
          if (fsIsDir(fsRoot, next)) { setCwd(next); }
          else { appendTerm(`cd: no such file or directory: ${target}`); }
          break;
        }
        if (cmd === 'ls') {
          const target = fsResolve(cwd, args[0] || '.');
          const list = fsList(fsRoot, target);
          if (list) appendTerm(list.join('  ')); else appendTerm(`ls: cannot access '${args[0] || '.'}': Not a directory`);
          break;
        }
        if (cmd === 'whoami') { appendTerm(admin ? 'root' : 'guest'); break; }
        if (cmd === 'uname') { appendTerm(args[0] === '-a' ? 'Linux mc 6.2.0-mc #1 SMP x86_64 GNU/Linux' : 'Linux'); break; }
        if (cmd === 'date') { appendTerm(new Date().toString()); break; }
        if (cmd === 'echo') { appendTerm(args.join(' ')); break; }
        if (cmd === 'cat') {
          const fileArg = args[0];
          if (!fileArg) { appendTerm('cat: missing file operand'); break; }
          let path = fsResolve(cwd, fileArg);
          // convenience: allow 'cat easter-eggs.md'
          if (!fsRead(fsRoot, path) && !fileArg.includes('/')) path = fsResolve('/docs', fileArg);
          if (path.endsWith('/secrets') && !admin) { appendTerm('cat: secrets: Permission denied'); break; }
          const content = fsRead(fsRoot, path);
          appendTerm(content != null ? content : `cat: ${fileArg}: No such file`);
          break;
        }
        if (cmd === 'man') { appendTerm('No manual entry. This is not a real shell.'); break; }
        if (cmd === 'sudo') { if ((args[0] || '').toLowerCase() === 'su') { setAlertMode(true); try { triggerAlert(6000); } catch {}; setTimeout(() => setAlertMode(false), 4000); appendTerm('sudo: Authentication failure'); } else { appendTerm('sudo: permission denied'); } break; }
        appendTerm(`Unknown command: ${cmd}`);
    }
  };

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
      <div className={`screen-only ${neonPulse ? 'neon-pulse' : ''}`}>
        {/* Easter egg overlays */}
        {showMatrix && (<MatrixRainOverlay />)}
        {scanlines && (<div className="scanlines-overlay" />)}
        {beamOn && (
          <div className="ufo-beam-container">
            <svg viewBox="0 0 200 100" width="140" height="70" xmlns="http://www.w3.org/2000/svg">
              <ellipse className="ufo-body" cx="100" cy="60" rx="80" ry="18" />
              <ellipse className="ufo-dome" cx="100" cy="45" rx="30" ry="18" />
              <ellipse className="ufo-light" cx="60" cy="60" rx="8" ry="5" />
              <ellipse className="ufo-light" cx="100" cy="60" rx="8" ry="5" />
              <ellipse className="ufo-light" cx="140" cy="60" rx="8" ry="5" />
            </svg>
            <div className="ufo-beam-light" />
          </div>
        )}
        {ufos.map(u => (
          <div key={u.id} className="ufo-flyby" style={{ ['--top' as any]: `${u.top}px`, ['--dur' as any]: `${u.dur}s`, width: `${u.width}px`, height: `${u.height}px` }}>
            <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
              <ellipse className="ufo-body" cx="100" cy="60" rx="80" ry="18" />
              <ellipse className="ufo-dome" cx="100" cy="45" rx="30" ry="18" />
              <ellipse className="ufo-light" cx="60" cy="60" rx="8" ry="5" />
              <ellipse className="ufo-light" cx="100" cy="60" rx="8" ry="5" />
              <ellipse className="ufo-light" cx="140" cy="60" rx="8" ry="5" />
            </svg>
          </div>
        ))}
        {pawPrints.map(p => (
          <div key={p.id} className="paw-print" style={{ left: `${p.left}vw`, ['--size' as any]: `${p.size}px`, ['--dur' as any]: `${p.dur}s`, ['--delay' as any]: `${p.delay}s` }}>🐾</div>
        ))}
        {mountains.map(m => (
          <div key={m.id} className="mountain" style={{ left: `${m.left}vw`, ['--size' as any]: `${m.size}px`, ['--dur' as any]: `${m.dur}s`, ['--delay' as any]: `${m.delay}s` }}>🏔️</div>
        ))}
        {alertMode && (
          <>
            <div className="alert-overlay" />
            <div className="alert-banner">ALERT MODE — Unauthorized access detected</div>
          </>
        )}
        {termOpen && (
          <div className="terminal-overlay" role="dialog" aria-modal="true" aria-label="Mission Terminal">
            <div className="terminal-window">
              <div className="terminal-header">MISSION TERMINAL — Press Esc to close</div>
              <div className="terminal-body">
                {termLines.map((l, i) => (<div key={i} className="terminal-line">{l}</div>))}
              </div>
              <div className="terminal-input">
                <span className="terminal-prompt">{promptUser()}</span>
                <input
                  className="terminal-field"
                  autoFocus
                  value={termInput}
                  onChange={e => setTermInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = termInput;
                      setTermLines(prev => [...prev, `${promptUser()} ${val}`]);
                      setTermInput('');
                      runTermCommand(val);
                    } else if (e.key === 'Escape') {
                      setTermOpen(false);
                    }
                  }}
                  placeholder={awaitPass ? 'Password' : 'type help'}
                />
              </div>
              <div className="terminal-hint mt-2">Hints: try 'login', 'eggs', 'trigger ufo', 'scan'.</div>
            </div>
          </div>
        )}
        {helpOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center" style={{ zIndex: 70 }} role="dialog" aria-modal="true" aria-label="Hidden Controls">
            <div className="mission-panel p-6 md:p-8 max-w-lg w-[90%]">
              <div className="holo-text font-mono text-lg mb-3">Hidden Controls</div>
              <div className="text-sm font-mono text-gray-300 space-y-1">
                <div><span className="text-green-400">Konami</span>: Toggle Matrix rain</div>
                <div><span className="text-green-400">U</span>: UFO fleet flyby</div>
                <div><span className="text-green-400">D</span>: Paw print burst</div>
                <div><span className="text-green-400">G</span>: Glitch header</div>
                <div><span className="text-green-400">P</span>: Neon panel pulse</div>
                <div><span className="text-green-400">H</span>: Hiking mode (mountains)</div>
                <div><span className="text-green-400">V</span>: CRT scanlines</div>
                <div><span className="text-green-400">B</span>: UFO beam spotlight</div>
                <div><span className="text-green-400">?</span>: Toggle this help</div>
                <div><span className="text-green-400">`</span> or <span className="text-green-400">Ctrl/Cmd+Alt+T</span>: Secret terminal</div>
                <div className="pt-2 text-gray-400">Map: idle for random events (UFO blips, satellite streaks, anomaly pings, aurora).</div>
              </div>
              <div className="text-[11px] font-mono text-gray-400 mt-3">See docs/EASTER_EGGS.md for details.</div>
              <div className="mt-4 flex justify-end">
                <button className="tactical-button text-xs px-3 py-2" onClick={() => setHelpOpen(false)}>Close (Esc)</button>
              </div>
            </div>
          </div>
        )}
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <button className="tactical-button text-xs px-3 py-2" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-16">
          {/* Header */}
          <div className="mission-panel p-6 md:p-8 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className={`holo-text font-mono text-3xl md:text-4xl mb-1 ${glitchTitle ? 'glitch' : ''}`}>{name}</div>
                {/* HINT: Try pressing U, D, G, P, H, V, or B. Or a classic 10-key code. */}
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

function MatrixRainOverlay() {
  const canvasRef = useState<HTMLCanvasElement | null>(null)[0] as any;
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!canvasEl) return;
    const canvas = canvasEl;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const fontSize = 14;
    const chars = 'アイウエオカキクケコｱｲｳｴｵｶｷｸｹｺ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charset = chars.split('');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * canvas.height / fontSize));
    const draw = () => {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#45ffb0';
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = charset[Math.floor(Math.random() * charset.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [canvasEl]);
  return (
    <div className="easter-egg-overlay">
      <canvas ref={setCanvasEl} width={0} height={0} />
    </div>
  );
}
