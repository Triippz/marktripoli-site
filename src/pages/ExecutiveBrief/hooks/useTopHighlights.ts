import { useMemo } from 'react';
import type { Resume } from '../types/resume';

export function useTopHighlights(resume: Resume | null) {
  return useMemo(() => {
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
      if (uniq.length >= 8) break; // cap for readability
    }
    
    return uniq;
  }, [resume]);
}