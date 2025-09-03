import { useState, useCallback, useRef } from 'react';
import { UXVState, UXVPosition, UXVProjectile, UXVExplosion, UXVContextMenu, UXVControls } from '../types';
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
  const [preview, setPreview] = useState<UXVPosition | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<UXVContextMenu | null>(null);

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
      setProjectiles(prev => [...prev, {
        id,
        sx: pos.lng,
        sy: pos.lat,
        ex: targetPos.lng,
        ey: targetPos.lat,
        start: performance.now(),
        dur: 2000
      }]);
      try {
        missionAudio.playEffect('sweep');
      } catch {}
    }
  }, [pos, target]);

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
    preview,
    panelOpen,
    panelPos,
    contextMenu,
    
    // Controls
    startUXV,
    stopUXV,
    setTarget: setTargetInternal,
    dropPayload,
    returnToBase,
    setSpeed: setSpeedInternal,
    setTrailMax,
    setFollow: setFollowInternal,
    openPanel,
    closePanel,
    showContextMenu,
    hideContextMenu,

    // Internal setters for movement system
    setPos,
    setTrail,
    setExplosions,
    setProjectiles,
    setPreview,
    setPanelPos,
    panelRef,
    draggingRef,
    dragOffsetRef
  } as any;
}