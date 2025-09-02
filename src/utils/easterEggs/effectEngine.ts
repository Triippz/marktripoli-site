import type { Map as MapboxMap } from 'mapbox-gl';
import effectConfig from '../../data/easterEggs/effectConfig.json';
import { mapEffects } from './effects/mapEffects';
import { canvasEffects } from './effects/canvasEffects';
import { overlayEffects } from './effects/overlayEffects';
import { particleEffects } from './effects/particleEffects';

export interface EffectExecutor {
  [key: string]: (target: HTMLElement | MapboxMap, ...args: unknown[]) => void;
}

/**
 * Consolidated effect registry combining all effect types
 */
const effectRegistry: EffectExecutor = {
  // Map effects (operate on Mapbox map)
  ufoBlips: (target) => {
    if (target && 'getCenter' in target) {
      mapEffects.ufoBlips(target as MapboxMap);
    }
  },
  anomalyPing: (target, ...args) => {
    if (target && 'getCenter' in target) {
      const color = args[0] as string | undefined;
      mapEffects.anomalyPing(target as MapboxMap, color);
    }
  },
  matrixPulse: (target) => {
    if (target && 'getCenter' in target) {
      mapEffects.matrixPulse(target as MapboxMap);
    }
  },
  
  // Canvas effects (create canvas animations)
  satelliteStreak: (target) => {
    if (target && 'appendChild' in target) {
      canvasEffects.satelliteStreak(target as HTMLElement);
    }
  },
  sandDrift: (target) => {
    if (target && 'appendChild' in target) {
      canvasEffects.sandDrift(target as HTMLElement);
    }
  },
  starTwinkle: (target, ...args) => {
    if (target && 'appendChild' in target) {
      const ms = args[0] as number | undefined;
      canvasEffects.starTwinkle(target as HTMLElement, ms);
    }
  },
  particleRing: (target) => {
    if (target && 'appendChild' in target) {
      canvasEffects.particleRing(target as HTMLElement);
    }
  },
  radarSweep: (target) => {
    if (target && 'appendChild' in target) {
      canvasEffects.radarSweep(target as HTMLElement);
    }
  },
  
  // Overlay effects (create DOM overlays)
  auroraOverlay: (target) => {
    if (target && 'appendChild' in target) {
      overlayEffects.auroraOverlay(target as HTMLElement);
    }
  },
  scanlinesOverlay: (target, ...args) => {
    if (target && 'appendChild' in target) {
      const ms = args[0] as number | undefined;
      overlayEffects.scanlinesOverlay(target as HTMLElement, ms);
    }
  },
  neonSweep: (target, ...args) => {
    if (target && 'appendChild' in target) {
      const ms = args[0] as number | undefined;
      overlayEffects.neonSweep(target as HTMLElement, ms);
    }
  },
  lightningFlash: (target) => {
    if (target && 'appendChild' in target) {
      overlayEffects.lightningFlash(target as HTMLElement);
    }
  },
  
  // Particle effects (create particle animations)
  hikingBurst: (target) => {
    if (target && 'appendChild' in target) {
      particleEffects.hikingBurst(target as HTMLElement);
    }
  },
  pawBurst: (target) => {
    if (target && 'appendChild' in target) {
      particleEffects.pawBurst(target as HTMLElement);
    }
  },
  graduationBurst: (target) => {
    if (target && 'appendChild' in target) {
      particleEffects.graduationBurst(target as HTMLElement);
    }
  },
  rocketLaunch: (target) => {
    if (target && 'appendChild' in target) {
      particleEffects.rocketLaunch(target as HTMLElement);
    }
  },
  ufoBeamOnMap: (target) => {
    if (target && 'appendChild' in target) {
      particleEffects.ufoBeamOnMap(target as HTMLElement);
    }
  }
};

/**
 * Execute a named effect with optional parameters
 */
export function executeEffect(
  effectName: string, 
  target: HTMLElement | MapboxMap, 
  ...params: unknown[]
): boolean {
  const effect = effectRegistry[effectName];
  if (!effect) {
    console.warn(`[EffectEngine] Unknown effect: ${effectName}`);
    return false;
  }

  try {
    effect(target, ...params);
    return true;
  } catch (error) {
    console.error(`[EffectEngine] Error executing effect '${effectName}':`, error);
    return false;
  }
}

/**
 * Execute multiple effects in sequence or parallel
 */
export function executeEffects(
  effects: string[], 
  target: HTMLElement | MapboxMap,
  mode: 'sequence' | 'parallel' = 'parallel',
  delayMs = 0
): Promise<void> {
  if (mode === 'parallel') {
    effects.forEach(effectName => {
      executeEffect(effectName, target);
    });
    return Promise.resolve();
  }

  // Sequential execution with delays
  return effects.reduce((promise, effectName, index) => {
    return promise.then(() => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          executeEffect(effectName, target);
          resolve();
        }, index * delayMs);
      });
    });
  }, Promise.resolve());
}

/**
 * Get random effect from probability distribution
 */
export function getRandomEffect(): string | null {
  const probabilities = effectConfig.probabilities;
  const roll = Math.random();
  let cumulative = 0;

  for (const [effectName, probability] of Object.entries(probabilities)) {
    cumulative += probability;
    if (roll < cumulative) {
      return effectName;
    }
  }

  return null; // No effect triggered
}

/**
 * Get effect configuration
 */
export function getEffectConfig(): typeof effectConfig;
export function getEffectConfig(effectName: string): unknown;
export function getEffectConfig(effectName?: string) {
  if (effectName) {
    return effectConfig.effects[effectName as keyof typeof effectConfig.effects];
  }
  return effectConfig;
}

/**
 * Get effect duration
 */
export function getEffectDuration(effectName: string): number {
  return effectConfig.durations[effectName as keyof typeof effectConfig.durations] || 3000;
}

/**
 * Check if effect exists in registry
 */
export function hasEffect(effectName: string): boolean {
  return effectName in effectRegistry;
}

/**
 * Get all available effect names
 */
export function getAvailableEffects(): string[] {
  return Object.keys(effectRegistry);
}

/**
 * Execute effect with color parameter
 */
export function executeEffectWithColor(
  effectName: string,
  target: HTMLElement | MapboxMap,
  color?: string
): boolean {
  // Effects that support color parameters
  const colorEffects = ['anomalyPing'];
  
  if (colorEffects.includes(effectName) && color) {
    return executeEffect(effectName, target, color);
  }
  
  return executeEffect(effectName, target);
}