import type { Resume } from '../../types/resume';

interface ExperienceCardProps {
  resume: Resume | null;
}

export function ExperienceCard({ resume }: ExperienceCardProps) {
  return (
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
            {w.summary && <div className="text-xs text-gray-300 mt-1">{w.summary}</div>}
            {Array.isArray(w.highlights) && w.highlights.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-mono text-green-400 mb-1">Key achievements:</div>
                <ul className="text-xs text-gray-300 space-y-0.5">
                  {w.highlights.slice(0, 3).map((h: string, j: number) => (
                    <li key={j} className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}