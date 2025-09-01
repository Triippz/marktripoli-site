import React from 'react';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
import type { ResumeDataError } from '../../types/resume';

/**
 * Top-level error boundary for the entire Mission Control application
 * Provides comprehensive error handling with context-aware recovery
 */
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Enhanced global error reporting
    const errorReport = {
      type: 'GLOBAL_APPLICATION_ERROR',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      // Application context
      appState: {
        route: window.location.pathname,
        timestamp: Date.now(),
        // Add any other relevant global state
      },
      // Performance context
      performance: {
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : undefined,
        timing: performance.timing ? {
          navigationStart: performance.timing.navigationStart,
          loadEventEnd: performance.timing.loadEventEnd,
          domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd
        } : undefined
      }
    };

    console.error('[GlobalErrorBoundary] Application-level error:', errorReport);

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to your error reporting service (Sentry, LogRocket, etc.)
      // Example: Sentry.captureException(error, { extra: errorReport });
    }
  };

  const handleGlobalRetry = () => {
    // Perform any global cleanup before retry
    console.log('[GlobalErrorBoundary] Attempting global recovery...');
    
    // Clear any problematic state from localStorage
    try {
      // Clear resume cache on global error
      localStorage.removeItem('mc-resume-cache');
      
      // Optionally clear other cached data
      // localStorage.removeItem('mission-control-store');
      
    } catch (storageError) {
      console.warn('[GlobalErrorBoundary] Failed to clear storage:', storageError);
    }
  };

  return (
    <EnhancedErrorBoundary
      context="GLOBAL_APPLICATION"
      enableTelemetry={true}
      maxRetries={2}
      retryDelay={2000}
      onError={handleGlobalError}
      onRetry={handleGlobalRetry}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}

/**
 * Data-specific error boundary for resume and site data operations
 */
export function DataErrorBoundary({ children }: { children: React.ReactNode }) {
  const handleDataError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[DataErrorBoundary] Data operation error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // Check if this is a resume data error and handle accordingly
    if (error.name === 'ResumeDataError' || error.message.includes('resume')) {
      // Specific handling for resume data errors
      console.warn('[DataErrorBoundary] Resume data error detected - clearing cache');
      try {
        localStorage.removeItem('mc-resume-cache');
      } catch (cacheError) {
        console.error('[DataErrorBoundary] Failed to clear resume cache:', cacheError);
      }
    }
  };

  const handleDataRetry = () => {
    // Data-specific recovery actions
    console.log('[DataErrorBoundary] Attempting data recovery...');
    
    // Force refresh data from the store if available
    try {
      if (typeof window !== 'undefined' && 'useMissionControlV2' in window) {
        const store = (window as any).useMissionControlV2.getState();
        if (store.refreshResumeData) {
          store.refreshResumeData().catch((refreshError: Error) => {
            console.error('[DataErrorBoundary] Data refresh failed:', refreshError);
          });
        }
      }
    } catch (refreshError) {
      console.error('[DataErrorBoundary] Failed to refresh data:', refreshError);
    }
  };

  return (
    <EnhancedErrorBoundary
      context="DATA_OPERATIONS"
      enableTelemetry={true}
      maxRetries={3}
      retryDelay={1500}
      onError={handleDataError}
      onRetry={handleDataRetry}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}

/**
 * UI-specific error boundary for non-critical interface components
 */
export function UIErrorBoundary({ 
  children, 
  fallbackMessage = "Component temporarily unavailable",
  componentName = "UI Component"
}: { 
  children: React.ReactNode;
  fallbackMessage?: string;
  componentName?: string;
}) {
  const handleUIError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.warn(`[UIErrorBoundary] ${componentName} error:`, {
      error: error.message,
      componentStack: errorInfo.componentStack
    });
  };

  // Minimal fallback for UI errors
  const uiFallback = (
    <div className="ui-error-fallback">
      <div className="ui-error-content">
        <span className="ui-error-icon">⚠</span>
        <span className="ui-error-message">{fallbackMessage}</span>
      </div>
      
      <style jsx>{`
        .ui-error-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(255, 170, 0, 0.1);
          border: 1px solid rgba(255, 170, 0, 0.3);
          border-radius: 4px;
          color: #ffaa00;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }
        
        .ui-error-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .ui-error-icon {
          font-size: 1.2rem;
        }
        
        .ui-error-message {
          font-weight: 500;
        }
      `}</style>
    </div>
  );

  return (
    <EnhancedErrorBoundary
      context={`UI_COMPONENT_${componentName.toUpperCase().replace(/\s+/g, '_')}`}
      enableTelemetry={false} // Don't spam telemetry for UI errors
      maxRetries={1}
      retryDelay={500}
      onError={handleUIError}
      fallback={uiFallback}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}

/**
 * Map-specific error boundary for Mapbox and geographical components
 */
export function MapErrorBoundary({ children }: { children: React.ReactNode }) {
  const handleMapError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[MapErrorBoundary] Map rendering error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  };

  const mapFallback = (
    <div className="map-error-fallback">
      <div className="map-error-content">
        <div className="map-error-icon">🗺️</div>
        <h3 className="map-error-title">MAP SYSTEM OFFLINE</h3>
        <p className="map-error-message">
          Tactical map display temporarily unavailable.
          Mission sites can still be accessed via manual navigation.
        </p>
        <button 
          className="map-error-button"
          onClick={() => window.location.reload()}
        >
          RESTART MAP SYSTEM
        </button>
      </div>
      
      <style jsx>{`
        .map-error-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%);
          border: 2px solid #ffaa00;
          border-radius: 8px;
          color: #ffaa00;
          font-family: 'Courier New', monospace;
        }
        
        .map-error-content {
          text-align: center;
          max-width: 400px;
          padding: 2rem;
        }
        
        .map-error-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.7;
        }
        
        .map-error-title {
          color: #ffaa00;
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0 0 1rem 0;
          letter-spacing: 2px;
        }
        
        .map-error-message {
          color: #cccccc;
          line-height: 1.5;
          margin: 0 0 2rem 0;
        }
        
        .map-error-button {
          padding: 1rem 2rem;
          border: 2px solid #ffaa00;
          background: transparent;
          color: #ffaa00;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .map-error-button:hover {
          background: #ffaa00;
          color: #000;
          box-shadow: 0 0 15px rgba(255, 170, 0, 0.5);
        }
      `}</style>
    </div>
  );

  return (
    <EnhancedErrorBoundary
      context="MAP_RENDERING"
      enableTelemetry={true}
      maxRetries={2}
      retryDelay={3000}
      onError={handleMapError}
      fallback={mapFallback}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}

export default GlobalErrorBoundary;