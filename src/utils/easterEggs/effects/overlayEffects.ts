/**
 * DOM overlay effects that create visual overlays
 */

export function auroraOverlay(container: HTMLElement) {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.top = '0';
  div.style.left = '0';
  div.style.right = '0';
  div.style.height = '45%';
  div.style.pointerEvents = 'none';
  div.style.background = 'radial-gradient(ellipse at top, rgba(69,255,176,0.22), rgba(69,255,176,0.08) 60%, rgba(69,255,176,0.0) 75%)';
  div.style.filter = 'blur(0.6px)';
  div.style.zIndex = '57';
  div.style.opacity = '0';
  div.style.transition = 'opacity 500ms ease';
  container.appendChild(div);
  requestAnimationFrame(() => { div.style.opacity = '1'; });
  setTimeout(() => { 
    div.style.opacity = '0'; 
    setTimeout(() => { 
      if (div.parentNode) div.parentNode.removeChild(div); 
    }, 600); 
  }, 6000 + Math.random() * 2000);
}

export function scanlinesOverlay(container: HTMLElement, ms = 5000) {
  const div = document.createElement('div');
  div.className = 'scanlines-overlay';
  container.appendChild(div);
  setTimeout(() => { 
    if (div.parentNode) div.parentNode.removeChild(div); 
  }, ms);
}

export function neonSweep(container: HTMLElement, ms = 2500) {
  const bar = document.createElement('div');
  bar.style.position = 'absolute';
  bar.style.top = '0';
  bar.style.left = '-20%';
  bar.style.width = '20%';
  bar.style.height = '100%';
  bar.style.pointerEvents = 'none';
  bar.style.background = 'linear-gradient(90deg, rgba(0,0,0,0), rgba(69,255,176,0.18), rgba(0,0,0,0))';
  bar.style.filter = 'blur(1px)';
  bar.style.zIndex = '57';
  container.appendChild(bar);
  const start = performance.now();
  let raf = 0;
  const render = (ts: number) => {
    const t = Math.min(1, (ts - start) / ms);
    const x = -20 + t * 140; // -20% to 120%
    bar.style.left = `${x}%`;
    if (t < 1) raf = requestAnimationFrame(render); else cleanup();
  };
  raf = requestAnimationFrame(render);
  const cleanup = () => { 
    cancelAnimationFrame(raf); 
    if (bar.parentNode) bar.parentNode.removeChild(bar); 
  };
}

export function lightningFlash(container: HTMLElement) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '59';
  overlay.style.background = '#ffffff';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 80ms linear';
  container.appendChild(overlay);
  
  const flash = (delay: number) => setTimeout(() => {
    overlay.style.background = Math.random() > 0.5 ? '#bfe7ff' : '#ffffff';
    overlay.style.opacity = '0.6';
    setTimeout(() => overlay.style.opacity = '0', 100);
  }, delay);
  
  flash(200);
  flash(600);
  setTimeout(() => { 
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay); 
  }, 1200);
}

export const overlayEffects = {
  auroraOverlay,
  scanlinesOverlay,
  neonSweep,
  lightningFlash
};