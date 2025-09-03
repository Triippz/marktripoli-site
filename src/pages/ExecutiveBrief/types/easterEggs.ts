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

export interface CrayonFlavor {
  color: string;
  name: string;
  description: string;
  hex: string;
}

export interface CrayonState {
  showCrayonSelector: boolean;
  selectedFlavor: CrayonFlavor | null;
  tastedFlavors: string[];
}

export interface EasterEggState extends CrayonState {
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
  | 'hiking'
  | 'crayon';

export interface EasterEggActions {
  triggerMatrix: () => void;
  triggerUFO: () => void;
  triggerPaws: () => void;
  triggerGlitch: () => void;
  triggerNeon: () => void;
  triggerScanlines: () => void;
  triggerBeam: () => void;
  triggerHiking: () => void;
  triggerCrayon: () => void;
  selectCrayonFlavor: (flavor: CrayonFlavor) => void;
  closeCrayonSelector: () => void;
  triggerHelp: () => void;
  triggerEgg: (type: EasterEggType) => boolean;
}