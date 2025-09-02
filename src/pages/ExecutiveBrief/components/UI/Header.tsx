interface HeaderProps {
  name: string;
  title: string;
  location: string;
  summary?: string;
  clearance?: string;
  updatedAt?: string;
  glitchTitle: boolean;
}

export function Header({
  name,
  title,
  location,
  summary,
  clearance,
  updatedAt,
  glitchTitle
}: HeaderProps) {
  return (
    <div className="mission-panel p-6 md:p-8 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className={`holo-text font-mono text-3xl md:text-4xl mb-1 ${glitchTitle ? 'glitch' : ''}`}>
            {name}
          </div>
          <div className="text-green-500 font-mono text-sm md:text-base">{title}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {clearance && (
            <div className="text-[10px] font-mono text-green-300 border border-green-500/40 px-2 py-0.5 rounded">
              Clearance: {clearance}
            </div>
          )}
          {updatedAt && (
            <div className="text-[10px] font-mono text-gray-400">
              Updated: {new Date(updatedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      {summary && (
        <div className="text-gray-300 font-mono text-sm mt-4">{summary}</div>
      )}
      <div className="text-gray-400 font-mono text-xs mt-3">{location}</div>
    </div>
  );
}