import type { Mountain } from '../../types/easterEggs';

interface MountainEffectProps {
  mountains: Mountain[];
}

export function MountainEffect({ mountains }: MountainEffectProps) {
  return (
    <>
      {mountains.map(m => (
        <div 
          key={m.id} 
          className="mountain" 
          style={{ 
            left: `${m.left}vw`, 
            ['--size' as any]: `${m.size}px`, 
            ['--dur' as any]: `${m.dur}s`, 
            ['--delay' as any]: `${m.delay}s` 
          }}
        >
          🏔️
        </div>
      ))}
    </>
  );
}