import { useState, useCallback, useRef } from 'react';
import { UXVState, UXVPosition, UXVProjectile, UXVLaser, UXVExplosion, UXVContextMenu, UXVControls, WeaponType, PatrolMode } from '../types';
import { missionAudio } from '../../../utils/audioSystem';

export function useUXVState(): UXVState & UXVControls {
  // Core state
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState<UXVPosition | null>(null);
  const [target, setTarget] = useState<UXVPosition | null>(null);
  const [base, setBase] = useState<UXVPosition | null>(null);
  const [trail, setTrail] = useState<UXVPosition[]>([]);
  const [speed, setSpeed] = useState(200);
  const [follow, setFollow] = useState(false);
  const [explosions, setExplosions] = useState<UXVExplosion[]>([]);
  const [projectiles, setProjectiles] = useState<UXVProjectile[]>([]);
  const [lasers, setLasers] = useState<UXVLaser[]>([]);
  const [preview, setPreview] = useState<UXVPosition | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<UXVContextMenu | null>(null);
  
  // New weapon and patrol state
  const [weaponType, setWeaponTypeState] = useState<WeaponType>('projectile');
  const [patrolMode, setPatrolModeState] = useState<PatrolMode>('none');
  const [patrolWaypoints, setPatrolWaypoints] = useState<UXVPosition[]>([]);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [altitude, setAltitudeState] = useState(1000);
  const [charging, setCharging] = useState(false);
  const [chargePower, setChargePower] = useState(0);

  // Trail configuration with persistence
  const [trailMax, setTrailMaxInternal] = useState<number>(() => {
    try {
      const v = parseInt(localStorage.getItem('uxvTrailMax') || '50');
      return isNaN(v) ? 50 : Math.min(200, Math.max(10, v));
    } catch {
      return 50;
    }
  });

  // Panel position with persistence
  const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(() => {
    try {
      const raw = localStorage.getItem('uxvPanelPos');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.left === 'number' && typeof parsed?.top === 'number') {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  // Panel dragging refs
  const panelRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Control functions
  const startUXV = useCallback((position?: UXVPosition) => {
    if (position) {
      setPos(position);
      setBase(position);
      setTrail([position]);
    }
    setActive(true);
    setPanelOpen(false);
    try {
      missionAudio.playEffect('engage');
    } catch {}
  }, []);

  const stopUXV = useCallback(() => {
    setActive(false);
    setTarget(null);
    try {
      missionAudio.playEffect('disengage');
    } catch {}
  }, []);

  const setTargetInternal = useCallback((newTarget: UXVPosition) => {
    setTarget(newTarget);
    try {
      missionAudio.playEffect('navigate');
    } catch {}
  }, []);

  const dropPayload = useCallback(() => {
    if (pos) {
      const id = `${Date.now()}`;
      const targetPos = target || pos;
      
      if (weaponType === 'projectile') {
        setProjectiles(prev => [...prev, {
          id,
          sx: pos.lng,
          sy: pos.lat,
          ex: targetPos.lng,
          ey: targetPos.lat,
          start: performance.now(),
          dur: 2000,
          type: weaponType
        }]);
      } else {
        // For laser types, use the laser system
        fireLaser(targetPos, chargePower);
        return;
      }
      
      try {
        missionAudio.playEffect('sweep');
      } catch {}
    }
  }, [pos, target, weaponType, chargePower]);

  const fireLaser = useCallback((targetPos: UXVPosition, power: number = 1) => {
    if (pos) {
      const id = `${Date.now()}`;
      let duration = 500; // Base laser duration
      
      switch (weaponType) {
        case 'laser':
          duration = 800;
          break;
        case 'pulse':
          duration = 300;
          break;
        case 'orbital':
          duration = 1500;
          break;
      }
      
      setLasers(prev => [...prev, {
        id,
        sx: pos.lng,
        sy: pos.lat,
        ex: targetPos.lng,
        ey: targetPos.lat,
        start: performance.now(),
        dur: duration,
        type: weaponType,
        power: Math.max(0.1, Math.min(2, power))
      }]);
      
      try {
        missionAudio.playEffect(weaponType === 'orbital' ? 'alert' : 'navigate');
      } catch {}
    }
  }, [pos, weaponType]);

  const startCharging = useCallback(() => {
    setCharging(true);
    setChargePower(0);
  }, []);

  const stopCharging = useCallback(() => {
    setCharging(false);
  }, []);

  const returnToBase = useCallback(() => {
    if (base) {
      setTarget({ ...base });
      try {
        missionAudio.playEffect('navigate');
      } catch {}
    }
  }, [base]);

  const setSpeedInternal = useCallback((newSpeed: number) => {
    setSpeed(Math.min(10000, Math.max(50, newSpeed)));
  }, []);

  const setTrailMax = useCallback((max: number) => {
    const clamped = Math.min(200, Math.max(10, max));
    setTrailMaxInternal(clamped);
    try {
      localStorage.setItem('uxvTrailMax', String(clamped));
    } catch {}
  }, []);

  const setFollowInternal = useCallback((shouldFollow: boolean) => {
    setFollow(shouldFollow);
  }, []);

  const setWeaponType = useCallback((weapon: WeaponType) => {
    setWeaponTypeState(weapon);
    setCharging(false);
    setChargePower(0);
  }, []);

  const setPatrolMode = useCallback((mode: PatrolMode) => {
    setPatrolModeState(mode);
    setCurrentWaypointIndex(0);
    
    // Generate waypoints based on mode
    if (mode !== 'none' && pos) {
      const waypoints: UXVPosition[] = [];
      
      switch (mode) {
        case 'circle':
          // Generate circular waypoints around current latitude
          for (let i = 0; i < 16; i++) {
            const angle = (i * 360 / 16) * (Math.PI / 180);
            waypoints.push({
              lng: pos.lng + Math.cos(angle) * 40,
              lat: pos.lat + Math.sin(angle) * 20
            });
          }
          break;
          
        case 'figure8':
          // Generate figure-8 pattern
          for (let i = 0; i < 32; i++) {
            const t = (i / 32) * 2 * Math.PI;
            waypoints.push({
              lng: pos.lng + Math.sin(t) * 30,
              lat: pos.lat + Math.sin(2 * t) * 15
            });
          }
          break;
          
        case 'random':
          // Generate random waypoints globally
          for (let i = 0; i < 12; i++) {
            waypoints.push({
              lng: -180 + Math.random() * 360,
              lat: -60 + Math.random() * 120
            });
          }
          break;
          
        case 'zigzag':
          // Generate zigzag pattern across the map
          for (let i = 0; i < 20; i++) {
            waypoints.push({
              lng: -170 + (i * 17),
              lat: pos.lat + (i % 2 === 0 ? 20 : -20)
            });
          }
          break;
      }
      
      setPatrolWaypoints(waypoints);
    } else {
      setPatrolWaypoints([]);
    }
  }, [pos]);

  const setAltitude = useCallback((newAltitude: number) => {
    setAltitudeState(Math.max(100, Math.min(5000, newAltitude)));
  }, []);

  const openPanel = useCallback(() => {
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const showContextMenu = useCallback((menu: UXVContextMenu) => {
    setContextMenu(menu);
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    // State
    active,
    pos,
    target,
    base,
    trail,
    trailMax,
    speed,
    follow,
    explosions,
    projectiles,
    lasers,
    preview,
    panelOpen,
    panelPos,
    contextMenu,
    weaponType,
    patrolMode,
    patrolWaypoints,
    currentWaypointIndex,
    altitude,
    charging,
    chargePower,
    
    // Controls
    startUXV,
    stopUXV,
    setTarget: setTargetInternal,
    dropPayload,
    fireLaser,
    startCharging,
    stopCharging,
    returnToBase,
    setSpeed: setSpeedInternal,
    setTrailMax,
    setFollow: setFollowInternal,
    setWeaponType,
    setPatrolMode,
    setAltitude,
    openPanel,
    closePanel,
    showContextMenu,
    hideContextMenu,

    // Internal setters for movement system
    setPos,
    setTrail,
    setExplosions,
    setProjectiles,
    setLasers,
    setPreview,
    setPanelPos,
    setPatrolWaypoints,
    setCurrentWaypointIndex,
    setChargePower,
    panelRef,
    draggingRef,
    dragOffsetRef
  } as any;
}