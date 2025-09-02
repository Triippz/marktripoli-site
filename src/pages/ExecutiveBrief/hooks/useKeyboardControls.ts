import { useEffect } from 'react';
import { useEasterEggs } from './useEasterEggs';

interface UseKeyboardControlsProps {
  onToggleTerminal: () => void;
  onToggleHelp: () => void;
  onGlitchTitle: () => void;
  helpOpen: boolean;
}

export function useKeyboardControls({ 
  onToggleTerminal, 
  onToggleHelp, 
  onGlitchTitle,
  helpOpen 
}: UseKeyboardControlsProps) {
  const { 
    triggerMatrix, 
    triggerUFO, 
    triggerPaws, 
    triggerNeon, 
    triggerHiking, 
    triggerScanlines, 
    triggerBeam 
  } = useEasterEggs();

  useEffect(() => {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let buffer: string[] = [];

    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      
      // UFO fleet on 'u'
      if (key.toLowerCase() === 'u') {
        triggerUFO();
      }
      // Paw prints on 'd'
      if (key.toLowerCase() === 'd') {
        triggerPaws();
      }
      // Glitch title on 'g'
      if (key.toLowerCase() === 'g') {
        onGlitchTitle();
      }
      // Neon pulse on 'p'
      if (key.toLowerCase() === 'p') {
        triggerNeon();
      }
      // Hiking mode on 'h'
      if (key.toLowerCase() === 'h') {
        triggerHiking();
      }
      // Video game scanlines on 'v'
      if (key.toLowerCase() === 'v') {
        triggerScanlines();
      }
      // UFO beam on 'b'
      if (key.toLowerCase() === 'b') {
        triggerBeam();
      }
      // Secret help overlay on '?' (or Shift+/)
      if (key === '?' || (key === '/' && e.shiftKey)) {
        onToggleHelp();
      }
      if (key === 'Escape' && helpOpen) {
        onToggleHelp();
      }
      // Secret terminal (support Ctrl+Alt+T and Cmd+Alt+T)
      if (
        key === '`' ||
        ((e.ctrlKey || e.metaKey) && e.altKey && key.toLowerCase() === 't')
      ) {
        onToggleTerminal();
      }
      // Konami buffer
      buffer.push(key);
      if (buffer.length > seq.length) buffer.shift();
      if (seq.every((k, i) => buffer[i]?.toLowerCase() === k.toLowerCase())) {
        triggerMatrix();
        buffer = [];
      }
    };

    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); };
  }, [helpOpen, triggerMatrix, triggerUFO, triggerPaws, triggerNeon, triggerHiking, triggerScanlines, triggerBeam, onToggleTerminal, onToggleHelp, onGlitchTitle]);

  // Console hint for discoverability
  useEffect(() => {
    try { 
      console.log('%c[Hint]', 'color:#45ffb0', 'Press ? on /briefing for hidden controls.'); 
    } catch {}
  }, []);
}