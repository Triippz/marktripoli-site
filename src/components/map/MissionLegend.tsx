interface MissionLegendProps {
  className?: string;
}

export default function MissionLegend({ className = '' }: MissionLegendProps) {
  return (
    <div className={`bg-gray-900/90 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm ${className}`}>
      <div className="text-green-500 text-xs font-mono mb-2">MISSION LEGEND</div>
      <div className="space-y-2 text-xs font-mono text-white">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(0,255,0,0.6)]" />
          <span>Job</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
          <span>Project</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
          <span>Hobby</span>
        </div>
      </div>
    </div>
  );
}

