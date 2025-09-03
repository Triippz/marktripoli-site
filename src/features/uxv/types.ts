export interface UXVPosition {
  lng: number;
  lat: number;
}

export type WeaponType = 'projectile' | 'laser' | 'pulse' | 'orbital';
export type PatrolMode = 'none' | 'circle' | 'figure8' | 'random' | 'zigzag';

export interface UXVProjectile {
  id: string;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  start: number;
  dur: number;
  type?: WeaponType;
}

export interface UXVLaser {
  id: string;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  start: number;
  dur: number;
  type: WeaponType;
  charging?: boolean;
  power?: number;
}

export interface UXVExplosion {
  id: string;
  lng: number;
  lat: number;
  start: number;
  type?: WeaponType;
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
  lasers: UXVLaser[];
  preview: UXVPosition | null;
  panelOpen: boolean;
  panelPos: { left: number; top: number } | null;
  contextMenu: UXVContextMenu | null;
  weaponType: WeaponType;
  patrolMode: PatrolMode;
  patrolWaypoints: UXVPosition[];
  currentWaypointIndex: number;
  altitude: number;
  charging: boolean;
  chargePower: number;
}

export interface UXVControls {
  startUXV: (position?: UXVPosition) => void;
  stopUXV: () => void;
  setTarget: (target: UXVPosition) => void;
  dropPayload: () => void;
  fireLaser: (target: UXVPosition, power?: number) => void;
  startCharging: () => void;
  stopCharging: () => void;
  returnToBase: () => void;
  setSpeed: (speed: number) => void;
  setTrailMax: (max: number) => void;
  setFollow: (follow: boolean) => void;
  setWeaponType: (weapon: WeaponType) => void;
  setPatrolMode: (mode: PatrolMode) => void;
  setAltitude: (altitude: number) => void;
  openPanel: () => void;
  closePanel: () => void;
  showContextMenu: (menu: UXVContextMenu) => void;
  hideContextMenu: () => void;
}