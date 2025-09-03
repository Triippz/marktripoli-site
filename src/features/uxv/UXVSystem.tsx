import React from 'react';
import { useUXVState } from './hooks/useUXVState';
import { useUXVMovement } from './hooks/useUXVMovement';
import { WeaponType, PatrolMode } from './types';
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
    lasers: uxvState.lasers,
    patrolMode: uxvState.patrolMode,
    patrolWaypoints: uxvState.patrolWaypoints,
    currentWaypointIndex: uxvState.currentWaypointIndex,
    charging: uxvState.charging,
    chargePower: uxvState.chargePower,
    setPos: (uxvState as any).setPos,
    setTarget: (uxvState as any).setTarget,
    setTrail: (uxvState as any).setTrail,
    setProjectiles: (uxvState as any).setProjectiles,
    setLasers: (uxvState as any).setLasers,
    setExplosions: (uxvState as any).setExplosions,
    setCurrentWaypointIndex: (uxvState as any).setCurrentWaypointIndex,
    setChargePower: (uxvState as any).setChargePower,
    map
  });

  // Handle map interactions for UXV
  React.useEffect(() => {
    if (!map || !uxvState.active) return;

    const handleClick = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      const { lng, lat } = e.lngLat;
      
      // If holding shift and using laser weapons, fire immediately
      if (e.originalEvent.shiftKey && uxvState.weaponType !== 'projectile') {
        uxvState.fireLaser({ lng, lat }, uxvState.chargePower);
      } else {
        uxvState.setTarget({ lng, lat });
      }
      
      if (onMapClick) onMapClick(e);
    };

    const handleContextMenu = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      const { lng, lat } = e.lngLat;
      const { x, y } = e.point as { x: number; y: number };
      
      // Right-click for quick laser fire
      if (uxvState.weaponType !== 'projectile') {
        uxvState.fireLaser({ lng, lat }, Math.max(0.5, uxvState.chargePower));
      } else {
        uxvState.showContextMenu({ open: true, x, y, lng, lat });
      }
      
      if (onMapContextMenu) onMapContextMenu(e);
    };

    // Keyboard shortcuts for enhanced combat
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!map) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
          // Spacebar to fire at current target or center of screen
          e.preventDefault();
          if (uxvState.target) {
            uxvState.dropPayload();
          } else {
            // Fire at center of screen
            const center = map.getCenter();
            if (uxvState.weaponType !== 'projectile') {
              uxvState.fireLaser({ lng: center.lng, lat: center.lat }, uxvState.chargePower);
            }
          }
          break;
          
        case 'p':
          // P to toggle patrol mode
          const modes: PatrolMode[] = ['none', 'circle', 'figure8', 'random', 'zigzag'];
          const currentIndex = modes.indexOf(uxvState.patrolMode);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          uxvState.setPatrolMode(nextMode);
          break;
          
        case '1':
        case '2':
        case '3':
        case '4':
          // Number keys for weapon selection
          const weapons: WeaponType[] = ['projectile', 'laser', 'pulse', 'orbital'];
          uxvState.setWeaponType(weapons[parseInt(e.key) - 1]);
          break;
          
        case 'c':
          // C to start/stop charging
          if (uxvState.charging) {
            uxvState.stopCharging();
          } else {
            uxvState.startCharging();
          }
          break;
          
        case 'r':
          // R to return to base
          uxvState.returnToBase();
          break;
      }
    };

    map.on('click', handleClick);
    map.on('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      try {
        map.off('click', handleClick);
        map.off('contextmenu', handleContextMenu);
        window.removeEventListener('keydown', handleKeyDown);
      } catch {}
    };
  }, [map, uxvState.active, uxvState.setTarget, uxvState.showContextMenu, uxvState.weaponType, uxvState.target, uxvState.chargePower, uxvState.charging, uxvState.patrolMode, onMapClick, onMapContextMenu]);

  // Don't render anything if map isn't loaded or UXV isn't active
  if (!isMapLoaded || !uxvState.active || !uxvState.pos || !map) {
    return null;
  }

  return (
    <>
      {/* Canvas renderer for trail, projectiles, lasers, and explosions */}
      <UXVRenderer
        map={map}
        pos={uxvState.pos}
        target={uxvState.target}
        trail={uxvState.trail}
        projectiles={uxvState.projectiles}
        lasers={uxvState.lasers}
        explosions={uxvState.explosions}
        charging={uxvState.charging}
        chargePower={uxvState.chargePower}
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
          weaponType={uxvState.weaponType}
          patrolMode={uxvState.patrolMode}
          altitude={uxvState.altitude}
          charging={uxvState.charging}
          chargePower={uxvState.chargePower}
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
          onSetWeaponType={uxvState.setWeaponType}
          onSetPatrolMode={uxvState.setPatrolMode}
          onSetAltitude={uxvState.setAltitude}
          onStartCharging={uxvState.startCharging}
          onStopCharging={uxvState.stopCharging}
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
