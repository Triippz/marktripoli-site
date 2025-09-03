import React, { useEffect, useRef } from 'react';
import { UXVPosition, UXVProjectile, UXVLaser, UXVExplosion, WeaponType } from '../types';

interface UXVRendererProps {
  map: mapboxgl.Map;
  pos: UXVPosition;
  target: UXVPosition | null;
  trail: UXVPosition[];
  projectiles: UXVProjectile[];
  lasers: UXVLaser[];
  explosions: UXVExplosion[];
  charging: boolean;
  chargePower: number;
  onExplosionsChange: (explosions: UXVExplosion[]) => void;
}

const UXVRenderer: React.FC<UXVRendererProps> = ({
  map,
  pos,
  target,
  trail,
  projectiles,
  lasers,
  explosions,
  charging,
  chargePower,
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
      
      // Rotation based on movement or time for idle animation
      const time = performance.now() * 0.001;
      const rotationAngle = target ? 0 : time * 0.5; // Slow rotation when idle
      ctx.rotate(rotationAngle);
      
      // Charging glow effect
      if (charging) {
        const glowSize = 20 + chargePower * 15;
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        grd.addColorStop(0, `rgba(255, 100, 255, ${chargePower * 0.3})`);
        grd.addColorStop(1, 'rgba(255, 100, 255, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Main mothership body (UFO-like)
      const gradient = ctx.createLinearGradient(0, -12, 0, 12);
      gradient.addColorStop(0, 'rgba(69, 255, 176, 0.9)');
      gradient.addColorStop(0.5, 'rgba(200, 255, 200, 0.7)');
      gradient.addColorStop(1, 'rgba(69, 255, 176, 0.9)');
      
      // Main hull
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Top dome
      ctx.fillStyle = 'rgba(150, 255, 180, 0.8)';
      ctx.beginPath();
      ctx.ellipse(0, -2, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Engine glow effects
      for (let i = 0; i < 3; i++) {
        const angle = (i * 120) * Math.PI / 180;
        const x = Math.cos(angle) * 10;
        const y = Math.sin(angle) * 6;
        
        ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(time * 4 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Outer glow
      const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
      outerGlow.addColorStop(0, 'rgba(69, 255, 176, 0.1)');
      outerGlow.addColorStop(1, 'rgba(69, 255, 176, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawExplosion = (pt: { x: number; y: number }, age: number, type?: WeaponType) => {
      if (!ctx) return;
      
      let r = Math.min(60, age * 120);
      let colors: string[];
      
      switch (type) {
        case 'laser':
          colors = ['rgba(255, 100, 255, 0.9)', 'rgba(255, 0, 255, 0.5)', 'rgba(128, 0, 255, 0)'];
          break;
        case 'pulse':
          colors = ['rgba(0, 255, 255, 0.9)', 'rgba(0, 200, 255, 0.5)', 'rgba(0, 100, 255, 0)'];
          r = Math.min(40, age * 80); // Smaller explosion
          break;
        case 'orbital':
          colors = ['rgba(255, 255, 100, 0.9)', 'rgba(255, 100, 0, 0.7)', 'rgba(255, 0, 0, 0)'];
          r = Math.min(120, age * 200); // Larger explosion
          break;
        default:
          colors = ['rgba(255, 200, 80, 0.9)', 'rgba(255, 80, 60, 0.5)', 'rgba(255, 0, 0, 0)'];
      }
      
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      
      const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
      grd.addColorStop(0, colors[0]);
      grd.addColorStop(0.6, colors[1]);
      grd.addColorStop(1, colors[2]);
      
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fill();
      
      // Additional effects for orbital strike
      if (type === 'orbital') {
        const shockwave = Math.min(150, age * 300);
        ctx.strokeStyle = `rgba(255, 255, 0, ${0.8 - age * 0.8})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, shockwave, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const drawLaser = (start: { x: number; y: number }, end: { x: number; y: number }, progress: number, type: WeaponType, power: number = 1) => {
      if (!ctx) return;
      
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      
      let colors: string[];
      let width = 3 * power;
      
      switch (type) {
        case 'laser':
          colors = ['rgba(255, 100, 255, 0.9)', 'rgba(255, 0, 255, 0.6)'];
          break;
        case 'pulse':
          colors = ['rgba(0, 255, 255, 0.9)', 'rgba(0, 200, 255, 0.6)'];
          width = 2 * power;
          break;
        case 'orbital':
          colors = ['rgba(255, 255, 100, 0.9)', 'rgba(255, 200, 0, 0.8)'];
          width = 6 * power;
          break;
        default:
          colors = ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.6)'];
      }
      
      // Draw outer glow
      ctx.strokeStyle = colors[1];
      ctx.lineWidth = width + 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      
      // Draw main beam
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      
      // Add energy pulses along the beam for certain types
      if (type === 'pulse' || type === 'orbital') {
        const time = performance.now() * 0.01;
        for (let i = 0; i < 5; i++) {
          const t = (i / 5 + time) % 1;
          const pulseX = start.x + (end.x - start.x) * t;
          const pulseY = start.y + (end.y - start.y) * t;
          
          ctx.fillStyle = colors[0];
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, width * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
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

      // Laser beams
      lasers.forEach((laser) => {
        const t = Math.min(1, (now - laser.start) / laser.dur);
        const startPt = map.project({ lng: laser.sx, lat: laser.sy } as any);
        const endPt = map.project({ lng: laser.ex, lat: laser.ey } as any);
        
        drawLaser(startPt, endPt, t, laser.type, laser.power || 1);
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
        
        const maxAge = ex.type === 'orbital' ? 2.0 : 1.0;
        if (age < maxAge) {
          drawExplosion(pt, age, ex.type);
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
  }, [map, pos, target, trail, projectiles, lasers, explosions, charging, chargePower, onExplosionsChange]);

  return null;
};

export default UXVRenderer;