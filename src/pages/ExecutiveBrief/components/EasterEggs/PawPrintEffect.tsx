import type { PawPrint } from '../../types/easterEggs';

interface PawPrintEffectProps {
  pawPrints: PawPrint[];
}

export function PawPrintEffect({ pawPrints }: PawPrintEffectProps) {
  return (
    <>
      {pawPrints.map(p => (
        <div 
          key={p.id} 
          className="paw-print" 
          style={{ 
            left: `${p.left}vw`, 
            ['--size' as any]: `${p.size}px`, 
            ['--dur' as any]: `${p.dur}s`, 
            ['--delay' as any]: `${p.delay}s` 
          }}
        >
          🐾
        </div>
      ))}
    </>
  );
}