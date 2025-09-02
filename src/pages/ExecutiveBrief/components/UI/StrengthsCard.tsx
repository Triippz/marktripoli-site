interface StrengthsCardProps {
  strengths: string[];
}

export function StrengthsCard({ strengths }: StrengthsCardProps) {
  return (
    <div className="tactical-glass p-4 md:col-span-2">
      <div className="text-green-400 font-mono text-xs mb-2">Strengths</div>
      <div className="flex flex-wrap gap-2">
        {strengths.map((strength, i) => (
          <span
            key={i}
            className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[11px]"
          >
            {strength}
          </span>
        ))}
      </div>
    </div>
  );
}