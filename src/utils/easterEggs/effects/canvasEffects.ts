/**
 * Canvas-based effects that create animated graphics
 */

export function satelliteStreak(container: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '59';
  container.appendChild(canvas);

  let raf = 0;
  const ctx = canvas.getContext('2d');
  const start = performance.now();
  const dur = 3500;
  const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
  resize();
  window.addEventListener('resize', resize);

  const render = (ts: number) => {
    if (!ctx) return;
    const t = Math.min(1, (ts - start) / dur);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.85 * (1 - Math.abs(0.5 - t) * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    // Diagonal from left-top offscreen to right-bottom
    const x = -0.2 * canvas.width + t * 1.4 * canvas.width;
    const y = 0.1 * canvas.height + t * 0.8 * canvas.height;
    ctx.beginPath();
    ctx.moveTo(x - 30, y - 15);
    ctx.lineTo(x + 30, y + 15);
    ctx.stroke();
    if (t < 1) raf = requestAnimationFrame(render); else cleanup();
  };
  raf = requestAnimationFrame(render);

  const cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };
}

export function sandDrift(container: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '58';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
  resize();
  window.addEventListener('resize', resize);
  const particles = Array.from({ length: 200 }).map(() => ({ 
    x: Math.random() * canvas.width, 
    y: Math.random() * canvas.height, 
    s: Math.random() * 1.2 + 0.2, 
    v: Math.random() * 0.3 + 0.1 
  }));
  const start = performance.now();
  const dur = 7000;
  let raf = 0;
  const render = (ts: number) => {
    if (!ctx) return;
    const t = Math.min(1, (ts - start) / dur);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(230,224,201,0.4)';
    particles.forEach(p => {
      p.x += p.v;
      if (p.x > canvas.width) p.x = 0;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    });
    if (t < 1) raf = requestAnimationFrame(render); else cleanup();
  };
  raf = requestAnimationFrame(render);
  const cleanup = () => { 
    cancelAnimationFrame(raf); 
    window.removeEventListener('resize', resize); 
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas); 
  };
}

export function starTwinkle(container: HTMLElement, ms = 6000) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '58';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
  resize();
  window.addEventListener('resize', resize);
  const stars = Array.from({ length: 120 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.6,
    r: Math.random() * 1.2 + 0.3,
    p: Math.random() * Math.PI * 2
  }));
  const start = performance.now();
  let raf = 0;
  const render = (ts: number) => {
    if (!ctx) return;
    const t = (ts - start) / ms;
    if (t > 1) return cleanup();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const a = 0.4 + 0.6 * Math.abs(Math.sin((ts / 500) + s.p));
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    raf = requestAnimationFrame(render);
  };
  raf = requestAnimationFrame(render);
  const cleanup = () => { 
    cancelAnimationFrame(raf); 
    window.removeEventListener('resize', resize); 
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas); 
  };
}

export function particleRing(container: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '58';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
  resize();
  window.addEventListener('resize', resize);
  const start = performance.now();
  const dur = 3000;
  let raf = 0;
  const render = (ts: number) => {
    if (!ctx) return;
    const t = Math.min(1, (ts - start) / dur);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = t * Math.hypot(cx, cy) * 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 225, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (t < 1) raf = requestAnimationFrame(render); else cleanup();
  };
  raf = requestAnimationFrame(render);
  const cleanup = () => { 
    cancelAnimationFrame(raf); 
    window.removeEventListener('resize', resize); 
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas); 
  };
}

export function radarSweep(container: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '58';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
  resize();
  window.addEventListener('resize', resize);
  const start = performance.now();
  const dur = 4000;
  let raf = 0;
  const render = (ts: number) => {
    if (!ctx) return;
    const t = (ts - start) / dur;
    if (t > 1) return cleanup();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.max(cx, cy) * 1.2;
    const angle = t * Math.PI * 2 * 2; // two sweeps
    const width = Math.PI / 8;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, 'rgba(69,255,176,0.25)');
    grad.addColorStop(1, 'rgba(69,255,176,0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + width);
    ctx.closePath();
    ctx.fill();
    raf = requestAnimationFrame(render);
  };
  raf = requestAnimationFrame(render);
  const cleanup = () => { 
    cancelAnimationFrame(raf); 
    window.removeEventListener('resize', resize); 
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas); 
  };
}

export const canvasEffects = {
  satelliteStreak,
  sandDrift,
  starTwinkle,
  particleRing,
  radarSweep
};