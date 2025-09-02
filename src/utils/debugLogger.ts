/**
 * Debug logging utility for Mission Control
 * Provides conditional logging based on environment variables
 */

// Enable debug logs in development when explicitly requested
const DEBUG_ENABLED = import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true';

// Enable performance logs separately
const PERF_ENABLED = import.meta.env.DEV && import.meta.env.VITE_DEBUG_PERF === 'true';

/**
 * Debug logger - only logs when debug mode is enabled
 */
export const debugLog = {
  log: DEBUG_ENABLED ? console.log : () => {},
  warn: DEBUG_ENABLED ? console.warn : () => {},
  info: DEBUG_ENABLED ? console.info : () => {},
  group: DEBUG_ENABLED ? console.group : () => {},
  groupEnd: DEBUG_ENABLED ? console.groupEnd : () => {},
  time: DEBUG_ENABLED ? console.time : () => {},
  timeEnd: DEBUG_ENABLED ? console.timeEnd : () => {},
};

/**
 * Performance logger - only logs when performance debugging is enabled
 */
export const perfLog = {
  log: PERF_ENABLED ? console.log : () => {},
  warn: PERF_ENABLED ? console.warn : () => {},
  time: PERF_ENABLED ? console.time : () => {},
  timeEnd: PERF_ENABLED ? console.timeEnd : () => {},
};

/**
 * Always log these (errors, critical warnings)
 * These should be visible even in production builds
 */
export const criticalLog = {
  error: console.error,
  warn: console.warn,
};

/**
 * Conditional logger factory
 * Creates a logger that only logs when the condition is true
 */
export const createConditionalLogger = (condition: boolean) => ({
  log: condition ? console.log : () => {},
  warn: condition ? console.warn : () => {},
  info: condition ? console.info : () => {},
  error: console.error, // Always log errors
});

/**
 * Feature-specific loggers
 */
export const featureLoggers = {
  map: createConditionalLogger(DEBUG_ENABLED),
  career: createConditionalLogger(DEBUG_ENABLED),
  terminal: createConditionalLogger(DEBUG_ENABLED),
  audio: createConditionalLogger(DEBUG_ENABLED),
  perf: createConditionalLogger(PERF_ENABLED),
};