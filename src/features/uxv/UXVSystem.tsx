import React from 'react';
import { useUXVState } from './hooks/useUXVState';
import { useUXVMovement } from './hooks/useUXVMovement';
import UXVRenderer from './components/UXVRenderer';
import UXVControlPanel from './components/UXVControlPanel';
import UXVMarker from './components/UXVMarker';
import UXVContextMenu from './components/UXVContextMenu';

interface UXVSystemProps {
  map: mapboxgl.Map | null;
  isMapLoaded: boolean;
  containerDimensions: { width: number; height: number };
  onMapClick?: (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => void;
  onMapContextMenu?: (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => void;
  uxv?: ReturnType<typeof useUXVState>;
}

const UXVSystem: React.FC<UXVSystemProps> = ({
  map,
  isMapLoaded,
  containerDimensions,
  onMapClick,
  onMapContextMenu,
  uxv
}) => {
  const uxvState = uxv ?? useUXVState();

  // Set up movement animation
  useUXVMovement({
    active: uxvState.active,
    pos: uxvState.pos,
    target: uxvState.target,
    speed: uxvState.speed,
    follow: uxvState.follow,
    trailMax: uxvState.trailMax,
    projectiles: uxvState.projectiles,
    setPos: (uxvState as any).setPos,
    setTarget: (uxvState as any).setTarget,
    setTrail: (uxvState as any).setTrail,
    setProjectiles: (uxvState as any).setProjectiles,
    setExplosions: (uxvState as any).setExplosions,
    map
  });

  // Handle map interactions for UXV
  React.useEffect(() => {
    if (!map || !uxvState.active) return;

    const handleClick = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      const { lng, lat } = e.lngLat;
      uxvState.setTarget({ lng, lat });
      if (onMapClick) onMapClick(e);
    };

    const handleContextMenu = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      const { lng, lat } = e.lngLat;
      const { x, y } = e.point as { x: number; y: number };
      uxvState.showContextMenu({ open: true, x, y, lng, lat });
      if (onMapContextMenu) onMapContextMenu(e);
    };

    map.on('click', handleClick);
    map.on('contextmenu', handleContextMenu);

    return () => {
      try {
        map.off('click', handleClick);
        map.off('contextmenu', handleContextMenu);
      } catch {}
    };
  }, [map, uxvState.active, uxvState.setTarget, uxvState.showContextMenu, onMapClick, onMapContextMenu]);

  // Don't render anything if map isn't loaded or UXV isn't active
  if (!isMapLoaded || !uxvState.active || !uxvState.pos || !map) {
    return null;
  }

  return (
    <>
      {/* Canvas renderer for trail, projectiles, and explosions */}
      <UXVRenderer
        map={map}
        pos={uxvState.pos}
        target={uxvState.target}
        trail={uxvState.trail}
        projectiles={uxvState.projectiles}
        explosions={uxvState.explosions}
        onExplosionsChange={(uxvState as any).setExplosions}
      />

      {/* Clickable UXV marker */}
      <UXVMarker
        map={map}
        pos={uxvState.pos}
        target={uxvState.target}
        onClick={uxvState.openPanel}
      />

      {/* Control panel */}
      {uxvState.panelOpen && (
        <UXVControlPanel
          pos={uxvState.pos}
          target={uxvState.target}
          base={uxvState.base}
          speed={uxvState.speed}
          trailMax={uxvState.trailMax}
          follow={uxvState.follow}
          panelPos={uxvState.panelPos}
          containerDimensions={containerDimensions}
          panelRef={(uxvState as any).panelRef}
          draggingRef={(uxvState as any).draggingRef}
          dragOffsetRef={(uxvState as any).dragOffsetRef}
          onClose={uxvState.closePanel}
          onSetTarget={uxvState.setTarget}
          onSetSpeed={uxvState.setSpeed}
          onSetTrailMax={uxvState.setTrailMax}
          onSetFollow={uxvState.setFollow}
          onDropPayload={uxvState.dropPayload}
          onStop={uxvState.stopUXV}
          onReturnToBase={uxvState.returnToBase}
          onSetPanelPos={(uxvState as any).setPanelPos}
        />
      )}

      {/* Context menu */}
      {uxvState.contextMenu?.open && (
        <UXVContextMenu
          contextMenu={uxvState.contextMenu}
          onSetTarget={uxvState.setTarget}
          onDropPayload={(target) => {
            if (uxvState.pos) {
              const id = `${Date.now()}`;
              (uxvState as any).setProjectiles((prev: any) => [...prev, {
                id,
                sx: uxvState.pos!.lng,
                sy: uxvState.pos!.lat,
                ex: target.lng,
                ey: target.lat,
                start: performance.now(),
                dur: 1800
              }]);
            }
          }}
          onClose={uxvState.hideContextMenu}
        />
      )}
    </>
  );
};

// Export the hook for external use (e.g., terminal commands)
export { useUXVState };
export default UXVSystem;
