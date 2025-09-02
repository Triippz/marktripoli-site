import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `ERR-${Date.now().toString(36)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    console.error('[ERROR BOUNDARY] Critical system failure:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Placeholder for error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };

    // You could send this to services like Sentry, LogRocket, etc.
    console.warn('[ERROR BOUNDARY] Production error report:', errorReport);
  }

  private retry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: ''
    });
  };

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default tactical error screen
      return (
        <div className="min-h-screen bg-black flex items-start justify-center p-4 py-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full"
          >
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="flex items-center justify-between">
                  <div className="holo-text font-mono text-red-500">
                    ⚠ SYSTEM ERROR
                  </div>
                  <div className="text-red-500 font-mono text-sm">
                    {this.state.errorId}
                  </div>
                </div>
              </div>
              
              <div className="terminal-content space-y-6">
                <div className="text-center">
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 1, -1, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🚨
                  </motion.div>
                  <h1 className="text-red-500 text-2xl font-mono mb-2">
                    MISSION CRITICAL ERROR
                  </h1>
                  <p className="text-gray-400 font-mono text-sm">
                    System encountered an unexpected failure during operation
                  </p>
                </div>

                <div className="tactical-panel p-4">
                  <div className="text-green-500 text-sm font-mono mb-3 uppercase">
                    Error Details
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex">
                      <span className="text-gray-400 w-20">Type:</span>
                      <span className="text-white">{this.state.error?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-20">Message:</span>
                      <span className="text-white break-all">
                        {this.state.error?.message || 'System malfunction detected'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-20">Timestamp:</span>
                      <span className="text-white">{new Date().toISOString()}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-20">Error ID:</span>
                      <span className="text-green-500">{this.state.errorId}</span>
                    </div>
                  </div>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                  <details className="tactical-panel p-4">
                    <summary className="text-green-500 text-sm font-mono mb-3 cursor-pointer hover:text-green-400">
                      Stack Trace (Development Only)
                    </summary>
                    <pre className="text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap mt-3 bg-gray-900 p-3 rounded border border-gray-700">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={this.retry}
                    className="tactical-button flex-1 py-3"
                  >
                    <span className="mr-2">🔄</span>
                    RETRY OPERATION
                  </button>
                  <button
                    onClick={this.reload}
                    className="tactical-button flex-1 py-3 bg-red-900/30 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <span className="mr-2">⚡</span>
                    FULL SYSTEM RESTART
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-gray-500 text-xs font-mono">
                    If problem persists, contact mission support with Error ID: {this.state.errorId}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;