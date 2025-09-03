import { MatrixRainOverlay } from './MatrixRainOverlay';
import { UFOFlyby, UFOBeam } from './UFOEffects';
import { PawPrintEffect } from './PawPrintEffect';
import { MountainEffect } from './MountainEffect';
import { ScanlinesOverlay, AlertOverlay } from './OverlayEffects';
import CrayonSelector from './CrayonSelector';
import type { EasterEggState, EasterEggActions } from '../../types/easterEggs';

interface EasterEggSystemProps {
  alertMode?: boolean;
  easterEggs: EasterEggState & EasterEggActions;
}

export function EasterEggSystem({ alertMode = false, easterEggs }: EasterEggSystemProps) {
  const {
    showMatrix,
    ufos,
    pawPrints, 
    mountains,
    scanlines,
    beamOn,
    showCrayonSelector,
    selectedFlavor,
    tastedFlavors,
    selectCrayonFlavor,
    closeCrayonSelector
  } = easterEggs;

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
      
      {/* Crayon Selector */}
      <CrayonSelector 
        isOpen={showCrayonSelector}
        selectedFlavor={selectedFlavor}
        tastedFlavors={tastedFlavors}
        onSelectFlavor={selectCrayonFlavor}
        onClose={closeCrayonSelector}
      />
      
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
  CrayonSelector,
};

// Export hooks and types
export { useEasterEggs } from '../../hooks/useEasterEggs';
export type * from '../../types/easterEggs';