import { useEffect, useState } from 'react';

export function MatrixRainOverlay() {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    if (!canvasEl) return;
    
    const canvas = canvasEl;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let raf: number;
    const fontSize = 14;
    const chars = 'アイウエオカキクケコｱｲｳｴｵｶｷｸｹｺ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charset = chars.split('');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * canvas.height / fontSize));
    
    const draw = () => {
      if (!ctx) return;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#45ffb0';
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = charset[Math.floor(Math.random() * charset.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);
        
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      
      raf = requestAnimationFrame(draw);
    };
    
    raf = requestAnimationFrame(draw);
    
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvasEl]);

  return (
    <div className="easter-egg-overlay">
      <canvas ref={setCanvasEl} width={0} height={0} />
    </div>
  );
}