/**
 * Particle-based effects using emojis and animated elements
 */

export function hikingBurst(container: HTMLElement) {
  const count = 10 + Math.floor(Math.random() * 10);
  const elems: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'mountain';
    const left = Math.floor(Math.random() * 100); // vw
    const size = 18 + Math.floor(Math.random() * 18); // px
    const dur = 7 + Math.random() * 6; // 7-13s
    const delay = Math.random() * 1.2; // 0-1.2s
    el.style.left = `${left}vw`;
    (el.style as any)['--size'] = `${size}px`;
    (el.style as any)['--dur'] = `${dur}s`;
    (el.style as any)['--delay'] = `${delay}s`;
    el.textContent = '🏔️';
    container.appendChild(el);
    elems.push(el);
  }
  const maxDur = Math.max(...elems.map(e => 
    parseFloat(((e.style as any)['--dur'] || '8s').toString()) + 
    parseFloat(((e.style as any)['--delay'] || '0s').toString())
  ));
  setTimeout(() => { 
    elems.forEach(e => { if (e.parentNode) e.parentNode.removeChild(e); }); 
  }, Math.ceil(maxDur * 1000) + 600);
}

export function pawBurst(container: HTMLElement) {
  const count = 16 + Math.floor(Math.random() * 16);
  const elems: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'paw-print';
    const left = Math.floor(Math.random() * 100);
    const size = 14 + Math.floor(Math.random() * 16);
    const dur = 5 + Math.random() * 6;
    const delay = Math.random() * 1.5;
    el.style.left = `${left}vw`;
    (el.style as any)['--size'] = `${size}px`;
    (el.style as any)['--dur'] = `${dur}s`;
    (el.style as any)['--delay'] = `${delay}s`;
    el.textContent = '🐾';
    container.appendChild(el);
    elems.push(el);
  }
  const maxDur = Math.max(...elems.map(e => 
    parseFloat(((e.style as any)['--dur'] || '8s').toString()) + 
    parseFloat(((e.style as any)['--delay'] || '0s').toString())
  ));
  setTimeout(() => { 
    elems.forEach(e => { if (e.parentNode) e.parentNode.removeChild(e); }); 
  }, Math.ceil(maxDur * 1000) + 600);
}

export function graduationBurst(container: HTMLElement) {
  const count = 10 + Math.floor(Math.random() * 10);
  const elems: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'mountain'; // reuse falling animation
    const left = Math.floor(Math.random() * 100);
    const size = 18 + Math.floor(Math.random() * 18);
    const dur = 7 + Math.random() * 6;
    const delay = Math.random() * 1.2;
    el.style.left = `${left}vw`;
    (el.style as any)['--size'] = `${size}px`;
    (el.style as any)['--dur'] = `${dur}s`;
    (el.style as any)['--delay'] = `${delay}s`;
    el.textContent = '🎓';
    container.appendChild(el);
    elems.push(el);
  }
  const maxDur = Math.max(...elems.map(e => 
    parseFloat(((e.style as any)['--dur'] || '8s').toString()) + 
    parseFloat(((e.style as any)['--delay'] || '0s').toString())
  ));
  setTimeout(() => { 
    elems.forEach(e => { if (e.parentNode) e.parentNode.removeChild(e); }); 
  }, Math.ceil(maxDur * 1000) + 600);
}

export function rocketLaunch(container: HTMLElement) {
  const el = document.createElement('div');
  el.textContent = '🚀';
  el.style.position = 'absolute';
  el.style.bottom = '-40px';
  const left = 20 + Math.random() * 60;
  el.style.left = `${left}vw`;
  el.style.fontSize = '28px';
  el.style.zIndex = '60';
  el.style.pointerEvents = 'none';
  container.appendChild(el);
  const start = performance.now();
  const dur = 3200 + Math.random() * 1000;
  let raf = 0;
  const animate = (ts: number) => {
    const t = Math.min(1, (ts - start) / dur);
    const y = t * (container.clientHeight + 80);
    el.style.transform = `translateY(${-y}px)`;
    // exhaust puff
    if (Math.random() < 0.5) {
      const puff = document.createElement('div');
      puff.textContent = '•';
      puff.style.position = 'absolute';
      puff.style.left = '0';
      puff.style.bottom = '0';
      puff.style.transform = 'translate(-6px, 10px)';
      puff.style.color = 'rgba(255,255,255,0.7)';
      puff.style.fontSize = '10px';
      el.appendChild(puff);
      setTimeout(() => { 
        if (puff.parentNode) puff.parentNode.removeChild(puff); 
      }, 600);
    }
    if (t < 1) raf = requestAnimationFrame(animate); else cleanup();
  };
  raf = requestAnimationFrame(animate);
  const cleanup = () => { 
    cancelAnimationFrame(raf); 
    if (el.parentNode) el.parentNode.removeChild(el); 
  };
}

export function ufoBeamOnMap(container: HTMLElement) {
  const wrap = document.createElement('div');
  wrap.className = 'ufo-beam-container';
  wrap.style.zIndex = '66';
  wrap.innerHTML = `
    <svg viewBox="0 0 200 100" width="140" height="70" xmlns="http://www.w3.org/2000/svg">
      <ellipse class="ufo-body" cx="100" cy="60" rx="80" ry="18" />
      <ellipse class="ufo-dome" cx="100" cy="45" rx="30" ry="18" />
      <ellipse class="ufo-light" cx="60" cy="60" rx="8" ry="5" />
      <ellipse class="ufo-light" cx="100" cy="60" rx="8" ry="5" />
      <ellipse class="ufo-light" cx="140" cy="60" rx="8" ry="5" />
    </svg>
    <div class="ufo-beam-light"></div>
  `;
  container.appendChild(wrap);
  setTimeout(() => { 
    if (wrap.parentNode) wrap.parentNode.removeChild(wrap); 
  }, 3500);
}

export const particleEffects = {
  hikingBurst,
  pawBurst,
  graduationBurst,
  rocketLaunch,
  ufoBeamOnMap
};