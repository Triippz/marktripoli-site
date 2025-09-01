import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResumeDataError } from '../../types/resume';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  enableTelemetry?: boolean;
  context?: string; // Additional context for error reporting
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * Enhanced Mission Control Error Boundary with advanced error handling,
 * retry mechanisms, telemetry integration, and tactical theming
 */
export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryTimer?: NodeJS.Timeout;
  private telemetryReported = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `ERR-${Date.now().toString(36).toUpperCase()}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Enhanced error logging
    console.error('[EnhancedErrorBoundary] Critical system failure:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      context: this.props.context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Report to telemetry if enabled
    if (this.props.enableTelemetry && !this.telemetryReported) {
      this.reportToTelemetry(error, errorInfo);
      this.telemetryReported = true;
    }

    // Production error reporting
    if (process.env.NODE_ENV === 'production') {
      this.reportProductionError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  private reportToTelemetry(error: Error, errorInfo: ErrorInfo) {
    try {
      // Attempt to access the global store
      if (typeof window !== 'undefined' && 'useMissionControlV2' in window) {
        const store = (window as any).useMissionControlV2.getState();
        if (store.addTelemetry) {
          store.addTelemetry({
            source: 'ERROR_BOUNDARY',
            message: `${this.props.context ? `[${this.props.context}] ` : ''}${error.message}`,
            level: 'error'
          });
        }
      }
    } catch (telemetryError) {
      console.warn('[EnhancedErrorBoundary] Failed to report to telemetry:', telemetryError);
    }
  }

  private reportProductionError(error: Error, errorInfo: ErrorInfo) {
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.props.context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      retryCount: this.state.retryCount,
      // Environment info
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      // Performance info
      memory: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : undefined
    };

    // Here you would send to your error reporting service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    console.warn('[EnhancedErrorBoundary] Production error report:', errorReport);
    
    // For demonstration, we'll use fetch to send to a hypothetical endpoint
    // Replace with your actual error reporting service
    /*
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    }).catch(reportError => {
      console.error('Failed to report error to server:', reportError);
    });
    */
  }

  private handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000, onRetry } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      this.setState({ isRetrying: true });
      
      this.retryTimer = setTimeout(() => {
        this.setState({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          retryCount: this.state.retryCount + 1,
          isRetrying: false
        });
        
        // Reset telemetry flag for new attempt
        this.telemetryReported = false;
        
        // Call custom retry handler if provided
        onRetry?.();
        
        // Report retry attempt
        if (this.props.enableTelemetry) {
          this.reportToTelemetry(
            new Error(`Retry attempt ${this.state.retryCount + 1}`),
            { componentStack: 'retry-mechanism' } as ErrorInfo
          );
        }
      }, retryDelay);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: '',
      retryCount: 0,
      isRetrying: false
    });
    this.telemetryReported = false;
  };

  render() {
    if (this.state.hasError) {
      const { maxRetries = 3 } = this.props;
      const remainingRetries = maxRetries - this.state.retryCount;
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Enhanced tactical error display
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            className="max-w-4xl w-full"
          >
            <div className="tactical-error-display">
              {/* Error Header */}
              <div className="error-header">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className="error-icon"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      ⚠
                    </motion.div>
                    <div>
                      <h1 className="error-title">
                        MISSION CRITICAL ERROR
                      </h1>
                      <p className="error-subtitle">
                        System Failure Detected - Tactical Response Required
                      </p>
                    </div>
                  </div>
                  <div className="error-id">
                    ID: {this.state.errorId}
                  </div>
                </div>
              </div>

              {/* Error Details Panel */}
              <div className="error-details-grid">
                {/* Primary Error Info */}
                <div className="error-panel primary">
                  <div className="panel-header">
                    <span className="panel-title">ERROR ANALYSIS</span>
                    <span className="panel-status error">CRITICAL</span>
                  </div>
                  <div className="panel-content">
                    <div className="error-field">
                      <span className="field-label">TYPE:</span>
                      <span className="field-value">{this.state.error?.name || 'SystemError'}</span>
                    </div>
                    <div className="error-field">
                      <span className="field-label">MESSAGE:</span>
                      <span className="field-value break-words">
                        {this.state.error?.message || 'Unknown system malfunction detected'}
                      </span>
                    </div>
                    <div className="error-field">
                      <span className="field-label">CONTEXT:</span>
                      <span className="field-value">{this.props.context || 'UNSPECIFIED'}</span>
                    </div>
                    <div className="error-field">
                      <span className="field-label">TIMESTAMP:</span>
                      <span className="field-value">{new Date().toISOString()}</span>
                    </div>
                  </div>
                </div>

                {/* Retry Status Panel */}
                <div className="error-panel secondary">
                  <div className="panel-header">
                    <span className="panel-title">RECOVERY STATUS</span>
                    <span className={`panel-status ${remainingRetries > 0 ? 'active' : 'inactive'}`}>
                      {remainingRetries > 0 ? 'AVAILABLE' : 'EXHAUSTED'}
                    </span>
                  </div>
                  <div className="panel-content">
                    <div className="error-field">
                      <span className="field-label">ATTEMPTS:</span>
                      <span className="field-value">{this.state.retryCount}/{maxRetries}</span>
                    </div>
                    <div className="error-field">
                      <span className="field-label">STATUS:</span>
                      <span className="field-value">
                        {this.state.isRetrying ? 'RETRYING...' : 'STANDBY'}
                      </span>
                    </div>
                    <div className="error-field">
                      <span className="field-label">REMAINING:</span>
                      <span className="field-value">{remainingRetries} attempts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stack Trace (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="error-panel debug mt-6"
                >
                  <details className="stack-trace-details">
                    <summary className="stack-trace-summary">
                      <span>🔍 STACK TRACE (Development Mode)</span>
                      <span className="text-amber-400">Click to expand</span>
                    </summary>
                    <pre className="stack-trace-content">
                      {this.state.error.stack}
                    </pre>
                  </details>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="error-actions">
                <AnimatePresence>
                  {remainingRetries > 0 && (
                    <motion.button
                      key="retry"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={this.handleRetry}
                      disabled={this.state.isRetrying}
                      className="tactical-button primary"
                    >
                      {this.state.isRetrying ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="inline-block mr-2"
                          >
                            ⟳
                          </motion.span>
                          RETRYING OPERATION...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🔄</span>
                          RETRY OPERATION ({remainingRetries} left)
                        </>
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
                
                <button
                  onClick={this.handleReset}
                  className="tactical-button secondary"
                >
                  <span className="mr-2">↺</span>
                  RESET COMPONENT
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="tactical-button danger"
                >
                  <span className="mr-2">⚡</span>
                  FULL SYSTEM RESTART
                </button>
              </div>

              {/* Recovery Instructions */}
              <div className="error-instructions">
                <div className="instructions-header">
                  <span className="instructions-title">RECOVERY PROTOCOL</span>
                </div>
                <div className="instructions-content">
                  <div className="instruction-category">
                    <h4>IMMEDIATE ACTIONS:</h4>
                    <ul>
                      <li>Verify network connectivity and system resources</li>
                      <li>Check browser console for additional error details</li>
                      <li>Attempt component recovery using RETRY OPERATION</li>
                      <li>Escalate to SYSTEM RESTART if retry fails</li>
                    </ul>
                  </div>
                  
                  {this.props.context === 'RESUME_DATA' && (
                    <div className="instruction-category">
                      <h4>RESUME DATA RECOVERY:</h4>
                      <ul>
                        <li>Verify external resume URL is accessible</li>
                        <li>Check for network timeouts or CORS issues</li>
                        <li>Validate JSON resume format compliance</li>
                        <li>Consider using cached data if available</li>
                      </ul>
                    </div>
                  )}
                  
                  <div className="instruction-category">
                    <h4>SUPPORT:</h4>
                    <ul>
                      <li>Report Error ID: <code className="error-id-code">{this.state.errorId}</code> to mission support</li>
                      <li>Include browser information and reproduction steps</li>
                      <li>Monitor system telemetry for related errors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <style jsx>{`
            .tactical-error-display {
              background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
              border: 2px solid #ff4444;
              border-radius: 8px;
              padding: 2rem;
              color: #00ff41;
              font-family: 'Courier New', monospace;
              box-shadow: 
                0 0 30px rgba(255, 68, 68, 0.3),
                inset 0 0 30px rgba(0, 0, 0, 0.5);
            }

            .error-header {
              border-bottom: 1px solid rgba(255, 68, 68, 0.3);
              margin-bottom: 2rem;
              padding-bottom: 1.5rem;
            }

            .error-icon {
              font-size: 3rem;
              color: #ff4444;
              text-shadow: 0 0 20px rgba(255, 68, 68, 0.7);
            }

            .error-title {
              font-size: 2rem;
              font-weight: bold;
              color: #ff4444;
              margin: 0;
              text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
              letter-spacing: 2px;
            }

            .error-subtitle {
              font-size: 1rem;
              color: #cccccc;
              margin: 0.5rem 0 0 0;
              letter-spacing: 1px;
            }

            .error-id {
              font-family: 'Courier New', monospace;
              font-size: 1rem;
              color: #ffaa00;
              background: rgba(255, 170, 0, 0.1);
              padding: 0.5rem 1rem;
              border: 1px solid rgba(255, 170, 0, 0.3);
              border-radius: 4px;
            }

            .error-details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1.5rem;
              margin-bottom: 2rem;
            }

            @media (max-width: 768px) {
              .error-details-grid {
                grid-template-columns: 1fr;
              }
            }

            .error-panel {
              background: rgba(0, 0, 0, 0.5);
              border: 1px solid;
              border-radius: 6px;
              overflow: hidden;
            }

            .error-panel.primary {
              border-color: #ff4444;
            }

            .error-panel.secondary {
              border-color: #ffaa00;
            }

            .error-panel.debug {
              border-color: #00ff41;
            }

            .panel-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1rem;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              font-weight: bold;
            }

            .panel-title {
              color: #00ff41;
              font-size: 0.9rem;
              letter-spacing: 1px;
            }

            .panel-status {
              font-size: 0.8rem;
              padding: 0.25rem 0.5rem;
              border-radius: 3px;
              font-weight: bold;
            }

            .panel-status.error {
              background: rgba(255, 68, 68, 0.2);
              color: #ff4444;
            }

            .panel-status.active {
              background: rgba(0, 255, 65, 0.2);
              color: #00ff41;
            }

            .panel-status.inactive {
              background: rgba(136, 136, 136, 0.2);
              color: #888;
            }

            .panel-content {
              padding: 1rem;
            }

            .error-field {
              display: flex;
              margin-bottom: 0.75rem;
              gap: 1rem;
            }

            .field-label {
              color: #ffaa00;
              font-weight: bold;
              min-width: 100px;
              font-size: 0.9rem;
            }

            .field-value {
              color: #ffffff;
              flex: 1;
              font-size: 0.9rem;
            }

            .stack-trace-details {
              width: 100%;
            }

            .stack-trace-summary {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1rem;
              cursor: pointer;
              user-select: none;
              font-weight: bold;
              color: #00ff41;
            }

            .stack-trace-summary:hover {
              background: rgba(0, 255, 65, 0.1);
            }

            .stack-trace-content {
              background: #0a0a0a;
              border: 1px solid #333;
              border-radius: 4px;
              padding: 1rem;
              margin: 0 1rem 1rem 1rem;
              overflow-x: auto;
              font-size: 0.8rem;
              line-height: 1.4;
              color: #ccc;
              white-space: pre-wrap;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              margin-bottom: 2rem;
              flex-wrap: wrap;
            }

            .tactical-button {
              padding: 1rem 2rem;
              border: 2px solid;
              border-radius: 6px;
              background: transparent;
              font-family: 'Courier New', monospace;
              font-weight: bold;
              font-size: 0.9rem;
              cursor: pointer;
              transition: all 0.3s ease;
              text-transform: uppercase;
              letter-spacing: 1px;
              min-width: 200px;
            }

            .tactical-button:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            .tactical-button.primary {
              color: #00ff41;
              border-color: #00ff41;
            }

            .tactical-button.primary:hover:not(:disabled) {
              background: #00ff41;
              color: #000;
              box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
            }

            .tactical-button.secondary {
              color: #ffaa00;
              border-color: #ffaa00;
            }

            .tactical-button.secondary:hover {
              background: #ffaa00;
              color: #000;
              box-shadow: 0 0 20px rgba(255, 170, 0, 0.5);
            }

            .tactical-button.danger {
              color: #ff4444;
              border-color: #ff4444;
            }

            .tactical-button.danger:hover {
              background: #ff4444;
              color: #000;
              box-shadow: 0 0 20px rgba(255, 68, 68, 0.5);
            }

            .error-instructions {
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              padding-top: 1.5rem;
            }

            .instructions-header {
              margin-bottom: 1rem;
            }

            .instructions-title {
              color: #00ff41;
              font-size: 1.1rem;
              font-weight: bold;
              letter-spacing: 1px;
            }

            .instructions-content {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 2rem;
            }

            @media (max-width: 1024px) {
              .instructions-content {
                grid-template-columns: 1fr;
                gap: 1.5rem;
              }
            }

            .instruction-category h4 {
              color: #ffaa00;
              margin: 0 0 0.5rem 0;
              font-size: 1rem;
            }

            .instruction-category ul {
              margin: 0;
              padding-left: 1.5rem;
              color: #ccc;
              font-size: 0.9rem;
              line-height: 1.5;
            }

            .instruction-category li {
              margin: 0.5rem 0;
            }

            .error-id-code {
              background: rgba(255, 170, 0, 0.2);
              color: #ffaa00;
              padding: 0.25rem 0.5rem;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 0.8rem;
              border: 1px solid rgba(255, 170, 0, 0.3);
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;