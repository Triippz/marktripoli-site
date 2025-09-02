import { useEffect, useRef } from 'react';
import { UXVPosition, UXVProjectile, UXVExplosion } from '../types';
import { missionAudio } from '../../../utils/audioSystem';

interface UseUXVMovementProps {
  active: boolean;
  pos: UXVPosition | null;
  target: UXVPosition | null;
  speed: number;
  follow: boolean;
  trailMax: number;
  projectiles: UXVProjectile[];
  setPos: (pos: UXVPosition) => void;
  setTarget: (target: UXVPosition | null) => void;
  setTrail: (trail: UXVPosition[] | ((prev: UXVPosition[]) => UXVPosition[])) => void;
  setProjectiles: (projectiles: UXVProjectile[] | ((prev: UXVProjectile[]) => UXVProjectile[])) => void;
  setExplosions: (explosions: UXVExplosion[] | ((prev: UXVExplosion[]) => UXVExplosion[])) => void;
  map?: mapboxgl.Map | null;
}

export function useUXVMovement({
  active,
  pos,
  target,
  speed,
  follow,
  trailMax,
  projectiles,
  setPos,
  setTarget,
  setTrail,
  setProjectiles,
  setExplosions,
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

      // Update UXV position
      if (pos && target) {
        const dLng = target.lng - pos.lng;
        const dLat = target.lat - pos.lat;
        const dist = Math.sqrt(dLng * dLng + dLat * dLat);
        
        if (dist < 0.0003) {
          // Reached target
          setPos(target);
          setTarget(null);
        } else {
          // Move towards target
          const degPerSec = speed / 111000; // approx degrees/sec
          const stepSize = Math.min(dist, degPerSec * Math.max(0.001, dt));
          const nx = pos.lng + (dLng / dist) * stepSize;
          const ny = pos.lat + (dLat / dist) * stepSize;
          
          setPos({ lng: nx, lat: ny });

          // Update trail
          if (now - lastTrail > 120) {
            setTrail(prev => {
              const arr = prev.slice();
              const lastPt = arr[arr.length - 1];
              const moved = !lastPt || Math.hypot((lastPt.lng - nx), (lastPt.lat - ny)) > 0.0001;
              
              if (moved) {
                arr.push({ lng: nx, lat: ny });
                if (arr.length > trailMax) {
                  arr.splice(0, arr.length - trailMax);
                }
              }
              
              return arr;
            });
            lastTrail = now;
          }

          // Follow camera
          if (follow && map) {
            try {
              map.easeTo({ center: [nx, ny], duration: 280, essential: false });
            } catch {}
          }
        }
      }

      // Update projectiles and spawn explosions
      if (projectiles.length > 0) {
        setProjectiles(prev => {
          const remain: UXVProjectile[] = [];
          
          prev.forEach(p => {
            const t = (now - p.start) / p.dur;
            if (t >= 1) {
              // Projectile hit, create explosion
              setExplosions(ex => [...ex, {
                id: p.id,
                lng: p.ex,
                lat: p.ey,
                start: now
              }]);
              try {
                missionAudio.playEffect('alert');
              } catch {}
            } else {
              remain.push(p);
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
  }, [active, pos, target, speed, follow, trailMax, projectiles, setPos, setTarget, setTrail, setProjectiles, setExplosions, map]);
}