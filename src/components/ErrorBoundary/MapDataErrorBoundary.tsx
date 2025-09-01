import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class MapDataErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MapDataErrorBoundary] Map data error caught:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to telemetry if available
    try {
      const event = new CustomEvent('mission-control-telemetry', {
        detail: {
          source: 'MAP_DATA',
          message: `Map data error: ${error.message}`,
          level: 'error',
          timestamp: new Date()
        }
      });
      window.dispatchEvent(event);
    } catch (telemetryError) {
      console.warn('[MapDataErrorBoundary] Failed to log to telemetry:', telemetryError);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="map-data-error-fallback">
          <motion.div 
            className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 m-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse" />
              <h3 className="text-red-400 font-mono text-sm font-bold">
                MAP DATA ERROR
              </h3>
            </div>
            <p className="text-red-300 font-mono text-xs mb-3">
              Map data processing error detected. Falling back to basic map view.
            </p>
            <div className="text-red-400 font-mono text-xs mb-3">
              Error: {this.state.error?.message}
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="bg-red-700 hover:bg-red-600 text-red-100 font-mono text-xs px-3 py-1 rounded transition-colors"
            >
              RETRY MAP DATA
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapDataErrorBoundary;