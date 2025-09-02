import type { UFOEntity } from '../../types/easterEggs';

interface UFOFlybyProps {
  ufos: UFOEntity[];
}

interface UFOBeamProps {
  active: boolean;
}

export function UFOFlyby({ ufos }: UFOFlybyProps) {
  return (
    <>
      {ufos.map(u => (
        <div 
          key={u.id} 
          className="ufo-flyby" 
          style={{ 
            ['--top' as any]: `${u.top}px`, 
            ['--dur' as any]: `${u.dur}s`, 
            width: `${u.width}px`, 
            height: `${u.height}px` 
          }}
        >
          <UFOSvg />
        </div>
      ))}
    </>
  );
}

export function UFOBeam({ active }: UFOBeamProps) {
  if (!active) return null;

  return (
    <div className="ufo-beam-container">
      <UFOSvg />
      <div className="ufo-beam-light" />
    </div>
  );
}

function UFOSvg() {
  return (
    <svg viewBox="0 0 200 100" width="140" height="70" xmlns="http://www.w3.org/2000/svg">
      <ellipse className="ufo-body" cx="100" cy="60" rx="80" ry="18" />
      <ellipse className="ufo-dome" cx="100" cy="45" rx="30" ry="18" />
      <ellipse className="ufo-light" cx="60" cy="60" rx="8" ry="5" />
      <ellipse className="ufo-light" cx="100" cy="60" rx="8" ry="5" />
      <ellipse className="ufo-light" cx="140" cy="60" rx="8" ry="5" />
    </svg>
  );
}