import type mapboxgl from 'mapbox-gl';
import effectConfig from '../../data/easterEggs/effectConfig.json';
import { mapEffects } from './effects/mapEffects';
import { canvasEffects } from './effects/canvasEffects';
import { overlayEffects } from './effects/overlayEffects';
import { particleEffects } from './effects/particleEffects';

export interface EffectExecutor {
  [key: string]: (container: HTMLElement | mapboxgl.Map, ...args: any[]) => void;
}

/**
 * Consolidated effect registry combining all effect types
 */
const effectRegistry: EffectExecutor = {
  // Map effects (operate on Mapbox map)
  ...mapEffects,
  // Canvas effects (create canvas animations)
  ...canvasEffects,
  // Overlay effects (create DOM overlays)
  ...overlayEffects,
  // Particle effects (create particle animations)
  ...particleEffects
};

/**
 * Execute a named effect with optional parameters
 */
export function executeEffect(
  effectName: string, 
  target: HTMLElement | mapboxgl.Map, 
  ...params: any[]
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
  target: HTMLElement | mapboxgl.Map,
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
  target: HTMLElement | mapboxgl.Map,
  color?: string
): boolean {
  // Effects that support color parameters
  const colorEffects = ['anomalyPing'];
  
  if (colorEffects.includes(effectName) && color) {
    return executeEffect(effectName, target, color);
  }
  
  return executeEffect(effectName, target);
}