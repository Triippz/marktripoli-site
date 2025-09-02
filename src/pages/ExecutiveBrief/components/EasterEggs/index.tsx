import { MatrixRainOverlay } from './MatrixRainOverlay';
import { UFOFlyby, UFOBeam } from './UFOEffects';
import { PawPrintEffect } from './PawPrintEffect';
import { MountainEffect } from './MountainEffect';
import { ScanlinesOverlay, AlertOverlay } from './OverlayEffects';
import { useEasterEggs } from '../../hooks/useEasterEggs';

interface EasterEggSystemProps {
  alertMode?: boolean;
}

export function EasterEggSystem({ alertMode = false }: EasterEggSystemProps) {
  const {
    showMatrix,
    ufos,
    pawPrints, 
    mountains,
    scanlines,
    beamOn
  } = useEasterEggs();

  return (
    <>
      {/* Matrix Rain Effect */}
      {showMatrix && <MatrixRainOverlay />}
      
      {/* Scanlines Overlay */}
      <ScanlinesOverlay active={scanlines} />
      
      {/* UFO Effects */}
      <UFOBeam active={beamOn} />
      <UFOFlyby ufos={ufos} />
      
      {/* Other Effects */}
      <PawPrintEffect pawPrints={pawPrints} />
      <MountainEffect mountains={mountains} />
      
      {/* Alert Overlay */}
      <AlertOverlay active={alertMode} />
    </>
  );
}

// Export individual components for more granular usage
export {
  MatrixRainOverlay,
  UFOFlyby,
  UFOBeam,
  PawPrintEffect,
  MountainEffect,
  ScanlinesOverlay,
  AlertOverlay,
};

// Export hooks and types
export { useEasterEggs } from '../../hooks/useEasterEggs';
export type * from '../../types/easterEggs';