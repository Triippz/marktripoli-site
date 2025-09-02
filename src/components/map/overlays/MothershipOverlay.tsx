import React, { useEffect, useRef } from 'react';

interface MothershipOverlayProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const MothershipOverlay: React.FC<MothershipOverlayProps> = ({ containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '52';
    
    containerRef.current.appendChild(canvas);
    canvasRef.current = canvas;
    
    const ctx = canvas.getContext('2d');
    let raf = 0;

    const resize = () => { 
      if (!containerRef.current) return; 
      canvas.width = containerRef.current.clientWidth; 
      canvas.height = containerRef.current.clientHeight; 
    };

    resize();
    window.addEventListener('resize', resize);
    
    const start = performance.now();
    
    const drawShip = (x: number, y: number, scale: number, hue: number) => {
      if (!ctx) return;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      
      // Glow
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.7)`;
      ctx.shadowBlur = 16;
      
      // Body
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 80, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Dome
      ctx.fillStyle = 'rgba(200,255,240,0.8)';
      ctx.beginPath();
      ctx.ellipse(0, -10, 26, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Lights
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.9)`;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath(); 
        ctx.ellipse(i * 18, 12, 6, 4, 0, 0, Math.PI * 2); 
        ctx.fill();
      }
      
      ctx.restore();
    };
    
    const drawEscort = (x: number, y: number, scale: number, hue: number) => {
      if (!ctx) return;
      
      ctx.save(); 
      ctx.translate(x, y); 
      ctx.scale(scale, scale);
      
      ctx.shadowColor = `hsla(${hue},100%,60%,0.7)`; 
      ctx.shadowBlur = 10;
      
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.9)`;
      ctx.beginPath(); 
      ctx.ellipse(0, 0, 26, 9, 0, 0, Math.PI * 2); 
      ctx.fill();
      
      ctx.restore();
    };
    
    const render = (ts: number) => {
      if (!ctx) return;
      
      const t = (ts - start) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width * 0.5;
      const cy = canvas.height * 0.15; // near top edge (orbit above earth)
      const radius = Math.min(canvas.width, canvas.height) * 0.45;
      
      // Mothership orbit params
      const theta = t * 0.2;
      const mx = cx + Math.cos(theta) * radius;
      const my = cy + Math.sin(theta) * (radius * 0.2);
      
      drawShip(mx, my, 0.6, 150);
      
      // Escorts
      for (let i = 0; i < 5; i++) {
        const a = theta + i * (Math.PI * 2 / 5) + Math.sin(t * 0.8 + i) * 0.2;
        const ex = cx + Math.cos(a) * (radius * 0.8);
        const ey = cy + Math.sin(a) * (radius * 0.18);
        drawEscort(ex, ey, 0.35, 150);
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
  }, [containerRef]);

  return null;
};

export default MothershipOverlay;