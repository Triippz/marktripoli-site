import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showFallback?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  lastErrorTime: number;
  circuitBreakerOpen: boolean;
}

export class ResumeDataErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorCount: 0,
    lastErrorTime: 0,
    circuitBreakerOpen: false
  };

  private static readonly MAX_ERRORS = 3;
  private static readonly TIME_WINDOW = 10000; // 10 seconds
  private static readonly CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds

  // Static animation objects to prevent render loop
  private static readonly SPINNER_ANIMATION = { rotate: 360 };
  private static readonly SPINNER_TRANSITION = { duration: 2, repeat: Infinity, ease: "linear" };
  private static readonly FADE_IN_INITIAL = { opacity: 0, scale: 0.8 };
  private static readonly FADE_IN_ANIMATE = { opacity: 1, scale: 1 };
  private static readonly FADE_IN_TRANSITION = { duration: 0.3 };

  // Bound class method to prevent function recreation
  private handleForceRestart = (): void => {
    window.location.reload();
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const now = Date.now();
    return {
      hasError: true,
      error,
      errorInfo: null,
      lastErrorTime: now
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[ResumeDataErrorBoundary] Resume data error caught:', error, errorInfo);
    
    const now = Date.now();
    const timeSinceLastError = now - this.state.lastErrorTime;
    
    // Reset error count if enough time has passed
    let newErrorCount = this.state.errorCount;
    if (timeSinceLastError > ResumeDataErrorBoundary.TIME_WINDOW) {
      newErrorCount = 1;
    } else {
      newErrorCount = this.state.errorCount + 1;
    }
    
    // Open circuit breaker if too many errors in time window
    const shouldOpenCircuitBreaker = newErrorCount >= ResumeDataErrorBoundary.MAX_ERRORS;
    
    if (shouldOpenCircuitBreaker) {
      console.error('[ResumeDataErrorBoundary] Circuit breaker opened - too many errors:', newErrorCount);
      // Auto-close circuit breaker after timeout
      setTimeout(() => {
        this.setState(prevState => ({
          ...prevState,
          circuitBreakerOpen: false,
          errorCount: 0
        }));
        console.log('[ResumeDataErrorBoundary] Circuit breaker auto-closed');
      }, ResumeDataErrorBoundary.CIRCUIT_BREAKER_TIMEOUT);
    }
    
    this.setState({
      error,
      errorInfo,
      errorCount: newErrorCount,
      lastErrorTime: now,
      circuitBreakerOpen: shouldOpenCircuitBreaker
    });

    // Call parent error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log specific resume data error to telemetry
    try {
      const event = new CustomEvent('mission-control-telemetry', {
        detail: {
          source: 'RESUME_DATA',
          message: `External intelligence error: ${error.message}`,
          level: 'error',
          timestamp: new Date()
        }
      });
      window.dispatchEvent(event);
    } catch (telemetryError) {
      console.warn('[ResumeDataErrorBoundary] Failed to log to telemetry:', telemetryError);
    }

    // Clear resume cache if error is related to cached data
    if (error.message.includes('resume') || error.message.includes('JSON')) {
      try {
        localStorage.removeItem('mc-resume-cache');
        console.log('[ResumeDataErrorBoundary] Cleared resume cache due to error');
      } catch (storageError) {
        console.warn('[ResumeDataErrorBoundary] Failed to clear cache:', storageError);
      }
    }
  }

  public render() {
    // If circuit breaker is open, render static fallback to prevent render loops
    if (this.state.circuitBreakerOpen) {
      return (
        <div className="w-full h-full bg-black flex items-center justify-center relative">
          {/* Static fallback content */}
          <div className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={ResumeDataErrorBoundary.SPINNER_ANIMATION}
              transition={ResumeDataErrorBoundary.SPINNER_TRANSITION}
            />
            <h2 className="text-red-500 font-mono text-lg font-bold mb-2">
              SYSTEM PROTECTION ACTIVE
            </h2>
            <p className="text-red-300 font-mono text-sm mb-4 max-w-md">
              Multiple component failures detected. System has entered safe mode to prevent infinite error loops.
            </p>
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 max-w-md">
              <div className="flex items-center justify-center mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                <span className="text-red-400 font-mono text-xs font-bold">
                  CIRCUIT BREAKER ACTIVE
                </span>
              </div>
              <p className="text-red-300 font-mono text-xs text-center">
                Error count: {this.state.errorCount}
              </p>
              <p className="text-red-300 font-mono text-xs text-center mt-1">
                Auto-recovery in 30 seconds...
              </p>
            </div>
          </div>

          {/* Circuit breaker warning overlay */}
          <motion.div 
            className="circuit-breaker-warning fixed top-4 right-4 z-50"
            initial={ResumeDataErrorBoundary.FADE_IN_INITIAL}
            animate={ResumeDataErrorBoundary.FADE_IN_ANIMATE}
            transition={ResumeDataErrorBoundary.FADE_IN_TRANSITION}
          >
            <div className="bg-red-900/90 border border-red-500/50 rounded-lg p-3 max-w-sm backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                <h4 className="text-red-400 font-mono text-xs font-bold">
                  CRITICAL SYSTEM PROTECTION
                </h4>
              </div>
              <p className="text-red-300 font-mono text-xs mb-2">
                Component failures: {this.state.errorCount}
              </p>
              <p className="text-red-300 font-mono text-xs">
                Render loop prevention active.
              </p>
              <button
                onClick={this.handleForceRestart}
                className="mt-2 bg-red-700 hover:bg-red-600 text-red-100 font-mono text-xs px-2 py-1 rounded transition-colors w-full"
              >
                FORCE RESTART
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    if (this.state.hasError && this.props.showFallback !== false) {
      const isHighErrorCount = this.state.errorCount >= 2;
      
      return (
        <motion.div 
          className="resume-data-error-fallback fixed bottom-20 right-4 z-50"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`border rounded-lg p-3 max-w-sm ${
            isHighErrorCount 
              ? 'bg-red-900/20 border-red-500/50' 
              : 'bg-yellow-900/20 border-yellow-500/50'
          }`}>
            <div className="flex items-center mb-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isHighErrorCount ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <h4 className={`font-mono text-xs font-bold ${
                isHighErrorCount ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {isHighErrorCount ? 'CRITICAL ERROR' : 'EXTERNAL DATA ERROR'}
              </h4>
            </div>
            <p className={`font-mono text-xs mb-2 ${
              isHighErrorCount ? 'text-red-300' : 'text-yellow-300'
            }`}>
              {isHighErrorCount 
                ? `Multiple errors detected (${this.state.errorCount}). Operating in safe mode.`
                : 'Resume data unavailable. Operating with static mission sites only.'
              }
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  this.setState({ 
                    hasError: false, 
                    error: null, 
                    errorInfo: null,
                    errorCount: Math.max(0, this.state.errorCount - 1) // Reduce error count on manual retry
                  });
                  if (!isHighErrorCount) {
                    window.location.reload(); // Only reload if not high error count
                  }
                }}
                className={`font-mono text-xs px-2 py-1 rounded transition-colors ${
                  isHighErrorCount
                    ? 'bg-red-700 hover:bg-red-600 text-red-100'
                    : 'bg-yellow-700 hover:bg-yellow-600 text-yellow-100'
                }`}
                disabled={isHighErrorCount}
              >
                {isHighErrorCount ? 'DISABLED' : 'RETRY'}
              </button>
              <button
                onClick={() => this.setState({ 
                  hasError: false, 
                  error: null, 
                  errorInfo: null,
                  errorCount: Math.max(0, this.state.errorCount - 1)
                })}
                className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-mono text-xs px-2 py-1 rounded transition-colors"
              >
                DISMISS
              </button>
            </div>
            {isHighErrorCount && (
              <p className="text-red-300 font-mono text-xs mt-2">
                Error count: {this.state.errorCount}/{ResumeDataErrorBoundary.MAX_ERRORS}
              </p>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ResumeDataErrorBoundary;