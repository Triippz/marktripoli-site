import { useState, useEffect, useCallback } from 'react';
import { useMissionControl } from '../../../store/missionControl';
import type { EasterEggState, EasterEggActions, EasterEggType, UFOEntity, PawPrint, Mountain } from '../types/easterEggs';

export function useEasterEggs(): EasterEggState & EasterEggActions {
  const { } = useMissionControl() as any;
  
  const [showMatrix, setShowMatrix] = useState(false);
  const [ufos, setUfos] = useState<UFOEntity[]>([]);
  const [pawPrints, setPawPrints] = useState<PawPrint[]>([]);
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [glitchTitle, setGlitchTitle] = useState(false);
  const [neonPulse, setNeonPulse] = useState(false);
  const [scanlines, setScanlines] = useState(false);
  const [beamOn, setBeamOn] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const triggerMatrix = useCallback(() => {
    setShowMatrix(v => !v);
  }, []);

  const triggerUFO = useCallback(() => {
    const count = 3 + Math.floor(Math.random() * 3); // 3-5
    const newOnes = Array.from({ length: count }).map(() => {
      const top = 40 + Math.floor(Math.random() * 220);
      const dur = 6 + Math.random() * 5;
      const width = 80 + Math.floor(Math.random() * 80);
      const height = Math.round(width * 0.5);
      return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, top, dur, width, height };
    });
    
    newOnes.forEach(({ id, dur }) => 
      setTimeout(() => setUfos(prev => prev.filter(u => u.id !== id)), Math.ceil(dur * 1000) + 300)
    );
    setUfos(prev => [...prev, ...newOnes]);
  }, []);

  const triggerPaws = useCallback(() => {
    const count = 16 + Math.floor(Math.random() * 16);
    const newPaws = Array.from({ length: count }).map(() => {
      const left = Math.floor(Math.random() * 100);
      const size = 14 + Math.floor(Math.random() * 14);
      const dur = 5 + Math.random() * 6;
      const delay = Math.random() * 1.5;
      return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, left, size, dur, delay };
    });
    
    const maxDur = Math.max(...newPaws.map(p => p.dur + p.delay));
    setTimeout(() => 
      setPawPrints(prev => prev.filter(p => !newPaws.find(n => n.id === p.id))), 
      Math.ceil(maxDur * 1000) + 300
    );
    setPawPrints(prev => [...prev, ...newPaws]);
  }, []);

  const triggerGlitch = useCallback(() => {
    setGlitchTitle(true);
    setTimeout(() => setGlitchTitle(false), 3000);
  }, []);

  const triggerNeon = useCallback(() => {
    setNeonPulse(true);
    setTimeout(() => setNeonPulse(false), 2200);
  }, []);

  const triggerScanlines = useCallback(() => {
    setScanlines(v => !v);
  }, []);

  const triggerBeam = useCallback(() => {
    setBeamOn(true);
    setTimeout(() => setBeamOn(false), 3500);
  }, []);

  const triggerHiking = useCallback(() => {
    const count = 12 + Math.floor(Math.random() * 12);
    const newMountains = Array.from({ length: count }).map(() => {
      const left = Math.floor(Math.random() * 100);
      const size = 18 + Math.floor(Math.random() * 20);
      const dur = 7 + Math.random() * 6;
      const delay = Math.random() * 1.5;
      return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, left, size, dur, delay };
    });
    
    const maxDur = Math.max(...newMountains.map(m => m.dur + m.delay));
    setTimeout(() => 
      setMountains(prev => prev.filter(m => !newMountains.find(n => n.id === m.id))), 
      Math.ceil(maxDur * 1000) + 300
    );
    setMountains(prev => [...prev, ...newMountains]);
  }, []);

  const triggerHelp = useCallback(() => {
    setHelpOpen(v => !v);
  }, []);

  const triggerEgg = useCallback((type: EasterEggType): boolean => {
    switch (type) {
      case 'matrix': triggerMatrix(); return true;
      case 'ufo': triggerUFO(); return true;
      case 'paws': triggerPaws(); return true;
      case 'glitch': triggerGlitch(); return true;
      case 'neon': triggerNeon(); return true;
      case 'scanlines': triggerScanlines(); return true;
      case 'beam': triggerBeam(); return true;
      case 'hiking': triggerHiking(); return true;
      default: return false;
    }
  }, [triggerMatrix, triggerUFO, triggerPaws, triggerGlitch, triggerNeon, triggerScanlines, triggerBeam, triggerHiking]);

  // Keyboard listeners
  useEffect(() => {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let buffer: string[] = [];
    
    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      
      // Individual key triggers
      switch (key.toLowerCase()) {
        case 'u': triggerUFO(); break;
        case 'd': triggerPaws(); break;
        case 'g': triggerGlitch(); break;
        case 'p': triggerNeon(); break;
        case 'h': triggerHiking(); break;
        case 'v': triggerScanlines(); break;
        case 'b': triggerBeam(); break;
      }
      
      // Help overlay
      if (key === '?' || (key === '/' && e.shiftKey)) {
        triggerHelp();
      }
      
      if (key === 'Escape' && helpOpen) {
        setHelpOpen(false);
      }
      
      // Konami code
      buffer.push(key);
      if (buffer.length > seq.length) buffer.shift();
      if (seq.every((k, i) => buffer[i]?.toLowerCase() === k.toLowerCase())) {
        triggerMatrix();
        buffer = [];
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [helpOpen, triggerUFO, triggerPaws, triggerGlitch, triggerNeon, triggerHiking, triggerScanlines, triggerBeam, triggerHelp, triggerMatrix]);

  return {
    // State
    showMatrix,
    ufos,
    pawPrints,
    mountains,
    glitchTitle,
    neonPulse,
    scanlines,
    beamOn,
    helpOpen,
    // Actions
    triggerMatrix,
    triggerUFO,
    triggerPaws,
    triggerGlitch,
    triggerNeon,
    triggerScanlines,
    triggerBeam,
    triggerHiking,
    triggerHelp,
    triggerEgg,
  };
}