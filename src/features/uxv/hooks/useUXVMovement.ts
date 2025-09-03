import { useEffect, useRef } from 'react';
import { UXVPosition } from '../types';
import { missionAudio } from '../../../utils/audioSystem';

export interface UseUXVMovementProps {
  active: boolean;
  pos: UXVPosition;
  target: UXVPosition | null;
  speed: number;
  follow: boolean;
  trailMax: number;
  projectiles: Array<{
    id: string;
    sx: number;
    sy: number;
    ex: number;
    ey: number;
    start: number;
    type: string;
  }>;
  lasers: Array<{
    id: string;
    sx: number;
    sy: number;
    ex: number;
    ey: number;
    start: number;
    type: string;
  }>;
  patrolMode: boolean;
  patrolWaypoints: UXVPosition[];
  currentWaypointIndex: number;
  charging: boolean;
  chargePower: number;
  setPos: (pos: UXVPosition) => void;
  setTarget: (target: UXVPosition | null) => void;
  setTrail: (trail: UXVPosition[]) => void;
  setProjectiles: (projectiles: Array<any>) => void;
  setLasers: (lasers: Array<any>) => void;
  setExplosions: (explosions: Array<any>) => void;
  setCurrentWaypointIndex: (index: number) => void;
  setChargePower: (power: number) => void;
  map: mapboxgl.Map | null;
}

export function useUXVMovement({
  active,
  pos,
  target,
  speed,
  follow,
  trailMax,
  projectiles,
  lasers,
  patrolMode,
  patrolWaypoints,
  currentWaypointIndex,
  charging,
  chargePower,
  setPos,
  setTarget,
  setTrail,
  setProjectiles,
  setLasers,
  setExplosions,
  setCurrentWaypointIndex,
  setChargePower,
  map
}: UseUXVMovementProps) {
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const lastTrailRef = useRef<number>(performance.now());

  useEffect(() => {
    if (!active) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
      return;
    }

    let last = performance.now();
    let lastTrail = last;
    
    const step = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;

      // Movement logic
      if (target) {
        const dx = target.lng - pos.lng;
        const dy = target.lat - pos.lat;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.0001) {
          const moveDistance = speed * dt;
          if (moveDistance >= distance) {
            setPos(target);
            if (!follow) {
              setTarget(null);
            }
          } else {
            const ratio = moveDistance / distance;
            setPos({
              lng: pos.lng + dx * ratio,
              lat: pos.lat + dy * ratio
            });
          }
        }
      }

      // Patrol mode logic
      if (patrolMode && patrolWaypoints.length > 0) {
        const currentWaypoint = patrolWaypoints[currentWaypointIndex];
        if (currentWaypoint) {
          const dx = currentWaypoint.lng - pos.lng;
          const dy = currentWaypoint.lat - pos.lat;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 0.001) {
            const nextIndex = (currentWaypointIndex + 1) % patrolWaypoints.length;
            setCurrentWaypointIndex(nextIndex);
          }
        }
      }

      // Charging logic
      if (charging) {
        setChargePower(prev => Math.min(100, prev + 25 * dt));
      }

      // Trail logic
      if (now - lastTrail > 100) {
        setTrail(prevTrail => {
          const newTrail = [...prevTrail, { ...pos }];
          return newTrail.length > trailMax ? newTrail.slice(-trailMax) : newTrail;
        });
        lastTrail = now;
      }

      // Projectile updates
      if (projectiles.length > 0) {
        setProjectiles(prev => {
          const remain = [];
          prev.forEach(p => {
            const age = now - p.start;
            if (age < 2000) {
              remain.push(p);
            } else {
              const explosionType = p.type === 'orbital' ? 'orbital' : 'impact';
              setExplosions(ex => [...ex, {
                id: p.id,
                lng: p.ex,
                lat: p.ey,
                start: now,
                type: explosionType
              }]);
              try {
                missionAudio.playEffect(p.type === 'orbital' ? 'sweep' : 'alert');
              } catch {}
            }
          });
          return remain;
        });
      }

      // Laser updates
      if (lasers.length > 0) {
        setLasers(prev => {
          const remain = [];
          prev.forEach(l => {
            const age = now - l.start;
            if (age < 1500) {
              remain.push(l);
            } else {
              const explosionType = l.type === 'orbital' ? 'orbital' : 'impact';
              setExplosions(ex => [...ex, {
                id: l.id,
                lng: l.ex,
                lat: l.ey,
                start: now,
                type: explosionType
              }]);
              try {
                missionAudio.playEffect(l.type === 'orbital' ? 'sweep' : 'alert');
              } catch {}
            }
          });
          
          return remain;
        });
      }

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
    };
  }, [active, pos, target, speed, follow, trailMax, projectiles, lasers, patrolMode, patrolWaypoints, currentWaypointIndex, charging, chargePower, setPos, setTarget, setTrail, setProjectiles, setLasers, setExplosions, setCurrentWaypointIndex, setChargePower, map]);
}