import { useMemo } from 'react';
import type { Resume } from '../../types/resume';

interface TimelineProps {
  work: NonNullable<Resume['work']>;
}

export function Timeline({ work }: TimelineProps) {
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
              <div className="text-xs font-mono text-gray-300">
                {it.startDate} – {it.endDate || 'Present'}
              </div>
            </div>
            <div className="mt-2 border border-green-500/30 rounded p-3 w-64">
              <div className="flex items-center gap-2">
                {it.logo && (
                  <img src={it.logo} alt={it.name} className="h-6 w-6 object-contain" />
                )}
                <div className="font-mono text-green-300 text-sm truncate" title={it.name}>
                  {it.name}
                </div>
              </div>
              {it.position && (
                <div className="text-[11px] font-mono text-white mt-0.5">{it.position}</div>
              )}
              {it.duration && (
                <div className="text-[10px] font-mono text-gray-400 mt-0.5">{it.duration}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}