export interface UFOEntity {
  id: string;
  top: number;
  dur: number;
  width: number;
  height: number;
}

export interface PawPrint {
  id: string;
  left: number;
  size: number;
  dur: number;
  delay: number;
}

export interface Mountain {
  id: string;
  left: number;
  size: number;
  dur: number;
  delay: number;
}

export interface EasterEggState {
  showMatrix: boolean;
  ufos: UFOEntity[];
  pawPrints: PawPrint[];
  mountains: Mountain[];
  glitchTitle: boolean;
  neonPulse: boolean;
  scanlines: boolean;
  beamOn: boolean;
  helpOpen: boolean;
}

export type EasterEggType = 
  | 'matrix'
  | 'ufo' 
  | 'paws'
  | 'glitch'
  | 'neon'
  | 'scanlines'
  | 'beam'
  | 'hiking';

export interface EasterEggActions {
  triggerMatrix: () => void;
  triggerUFO: () => void;
  triggerPaws: () => void;
  triggerGlitch: () => void;
  triggerNeon: () => void;
  triggerScanlines: () => void;
  triggerBeam: () => void;
  triggerHiking: () => void;
  triggerHelp: () => void;
  triggerEgg: (type: EasterEggType) => boolean;
}