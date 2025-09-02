import React, { useEffect, useRef } from 'react';
import { UXVPosition, UXVProjectile, UXVExplosion } from '../types';

interface UXVRendererProps {
  map: mapboxgl.Map;
  pos: UXVPosition;
  target: UXVPosition | null;
  trail: UXVPosition[];
  projectiles: UXVProjectile[];
  explosions: UXVExplosion[];
  onExplosionsChange: (explosions: UXVExplosion[]) => void;
}

const UXVRenderer: React.FC<UXVRendererProps> = ({
  map,
  pos,
  target,
  trail,
  projectiles,
  explosions,
  onExplosionsChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = map.getContainer();
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '53';
    
    container.appendChild(canvas);
    canvasRef.current = canvas;
    
    const ctx = canvas.getContext('2d');
    let raf = 0;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const drawUXV = (pt: { x: number; y: number }) => {
      if (!ctx) return;
      
      ctx.save();
      ctx.translate(pt.x, pt.y);
      
      // UXV body (tactical triangle)
      ctx.fillStyle = 'rgba(69,255,176,0.9)';
      ctx.strokeStyle = 'rgba(69,255,176,0.9)';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(6, 10);
      ctx.lineTo(-6, 10);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };

    const drawExplosion = (pt: { x: number; y: number }, age: number) => {
      if (!ctx) return;
      
      const r = Math.min(60, age * 120);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      
      const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
      grd.addColorStop(0, 'rgba(255,200,80,0.9)');
      grd.addColorStop(0.6, 'rgba(255,80,60,0.5)');
      grd.addColorStop(1, 'rgba(255,0,0,0)');
      
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const render = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const p = map.project(pos as any);

      // Trail rendering with smooth curves and glow
      if (trail && trail.length > 1) {
        const pts = trail.map(ll => map.project(ll as any));
        pts.push(p); // Connect to current position

        // Configure smooth line rendering
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Outer glow stroke
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(69,255,176,0.25)';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        
        for (let i = 1; i < pts.length - 1; i++) {
          const cp = pts[i];
          const mid = { 
            x: (pts[i].x + pts[i + 1].x) / 2, 
            y: (pts[i].y + pts[i + 1].y) / 2 
          };
          ctx.quadraticCurveTo(cp.x, cp.y, mid.x, mid.y);
        }
        
        // Curve to the last point
        const last = pts[pts.length - 1];
        ctx.quadraticCurveTo(last.x, last.y, last.x, last.y);
        ctx.stroke();

        // Inner stroke
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = 'rgba(69,255,176,0.85)';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        
        for (let i = 1; i < pts.length - 1; i++) {
          const cp = pts[i];
          const mid = { 
            x: (pts[i].x + pts[i + 1].x) / 2, 
            y: (pts[i].y + pts[i + 1].y) / 2 
          };
          ctx.quadraticCurveTo(cp.x, cp.y, mid.x, mid.y);
        }
        
        ctx.quadraticCurveTo(last.x, last.y, last.x, last.y);
        ctx.stroke();
      }

      // Projectiles with parabolic arc
      const now = performance.now();
      projectiles.forEach((pr) => {
        const t = Math.min(1, (now - pr.start) / pr.dur);
        const lng = pr.sx + (pr.ex - pr.sx) * t;
        const lat = pr.sy + (pr.ey - pr.sy) * t;
        const pt = map.project({ lng, lat } as any);
        
        // Parabolic arc height
        const arc = Math.sin(Math.PI * t);
        const yOffset = arc * 40; // pixels

        ctx.save();
        ctx.fillStyle = 'rgba(255,200,80,0.9)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y - yOffset, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw UXV
      drawUXV(p);

      // Target line
      if (target) {
        const t = map.project(target as any);
        ctx.strokeStyle = 'rgba(69,255,176,0.6)';
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Explosions with fade out
      const remaining: UXVExplosion[] = [];
      for (const ex of explosions) {
        const pt = map.project({ lng: ex.lng, lat: ex.lat } as any);
        const age = (now - ex.start) / 1000;
        
        if (age < 1.0) {
          drawExplosion(pt, age);
          remaining.push(ex);
        }
      }
      
      if (remaining.length !== explosions.length) {
        onExplosionsChange(remaining);
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, pos, target, trail, projectiles, explosions, onExplosionsChange]);

  return null;
};

export default UXVRenderer;