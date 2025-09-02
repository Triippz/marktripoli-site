export interface UXVPosition {
  lng: number;
  lat: number;
}

export interface UXVProjectile {
  id: string;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  start: number;
  dur: number;
}

export interface UXVExplosion {
  id: string;
  lng: number;
  lat: number;
  start: number;
}

export interface UXVContextMenu {
  open: boolean;
  x: number;
  y: number;
  lng: number;
  lat: number;
}

export interface UXVState {
  active: boolean;
  pos: UXVPosition | null;
  target: UXVPosition | null;
  base: UXVPosition | null;
  trail: UXVPosition[];
  trailMax: number;
  speed: number;
  follow: boolean;
  explosions: UXVExplosion[];
  projectiles: UXVProjectile[];
  preview: UXVPosition | null;
  panelOpen: boolean;
  panelPos: { left: number; top: number } | null;
  contextMenu: UXVContextMenu | null;
}

export interface UXVControls {
  startUXV: (position?: UXVPosition) => void;
  stopUXV: () => void;
  setTarget: (target: UXVPosition) => void;
  dropPayload: () => void;
  returnToBase: () => void;
  setSpeed: (speed: number) => void;
  setTrailMax: (max: number) => void;
  setFollow: (follow: boolean) => void;
  openPanel: () => void;
  closePanel: () => void;
  showContextMenu: (menu: UXVContextMenu) => void;
  hideContextMenu: () => void;
}