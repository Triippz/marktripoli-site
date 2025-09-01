import { useState, useCallback, useEffect, useRef } from 'react';
import type { ResumeDataError } from '../types/resume';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error categories for better classification
export type ErrorCategory = 
  | 'NETWORK'
  | 'PARSING'
  | 'VALIDATION'
  | 'RENDERING'
  | 'STORAGE'
  | 'AUTHENTICATION'
  | 'PERMISSION'
  | 'UNKNOWN';

// Enhanced error interface
export interface EnhancedError {
  id: string;
  message: string;
  code?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: string;
  metadata?: Record<string, any>;
  recoverable: boolean;
  retryCount: number;
  maxRetries: number;
}

// Error handling configuration
export interface ErrorHandlingConfig {
  enableTelemetry: boolean;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableNotifications: boolean;
  logToConsole: boolean;
  reportToService: boolean;
}

// Default configuration
const DEFAULT_CONFIG: ErrorHandlingConfig = {
  enableTelemetry: true,
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  enableNotifications: true,
  logToConsole: process.env.NODE_ENV === 'development',
  reportToService: process.env.NODE_ENV === 'production'
};

/**
 * Comprehensive error handling hook for Mission Control
 */
export function useErrorHandling(config: Partial<ErrorHandlingConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [errors, setErrors] = useState<EnhancedError[]>([]);
  const [isHandlingError, setIsHandlingError] = useState(false);
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const errorCounters = useRef<Map<string, number>>(new Map());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current.clear();
    };
  }, []);

  // Enhanced error classification
  const classifyError = useCallback((error: Error | ResumeDataError): {
    category: ErrorCategory;
    severity: ErrorSeverity;
    recoverable: boolean;
  } => {
    const message = error.message.toLowerCase();
    const errorName = error.name?.toLowerCase() || '';
    
    // Network errors
    if (message.includes('fetch') || message.includes('network') || 
        message.includes('timeout') || message.includes('cors') ||
        message.includes('failed to fetch')) {
      return { 
        category: 'NETWORK', 
        severity: message.includes('timeout') ? 'high' : 'medium',
        recoverable: true 
      };
    }
    
    // Parsing errors
    if (message.includes('json') || message.includes('parse') || 
        message.includes('syntax') || errorName.includes('syntaxerror')) {
      return { 
        category: 'PARSING', 
        severity: 'high',
        recoverable: false 
      };
    }
    
    // Validation errors
    if (message.includes('valid') || message.includes('schema') || 
        message.includes('format')) {
      return { 
        category: 'VALIDATION', 
        severity: 'medium',
        recoverable: false 
      };
    }
    
    // Rendering errors
    if (message.includes('render') || message.includes('component') || 
        errorName.includes('typeerror')) {
      return { 
        category: 'RENDERING', 
        severity: 'high',
        recoverable: true 
      };
    }
    
    // Storage errors
    if (message.includes('storage') || message.includes('quota') || 
        message.includes('localstorage')) {
      return { 
        category: 'STORAGE', 
        severity: 'low',
        recoverable: true 
      };
    }
    
    // Permission errors
    if (message.includes('permission') || message.includes('unauthorized') || 
        message.includes('forbidden')) {
      return { 
        category: 'PERMISSION', 
        severity: 'critical',
        recoverable: false 
      };
    }
    
    // Default classification
    return { 
      category: 'UNKNOWN', 
      severity: 'medium',
      recoverable: true 
    };
  }, []);

  // Report error to telemetry
  const reportToTelemetry = useCallback((error: EnhancedError) => {
    if (!finalConfig.enableTelemetry) return;
    
    try {
      if (typeof window !== 'undefined' && 'useMissionControlV2' in window) {
        const store = (window as any).useMissionControlV2.getState();
        if (store.addTelemetry) {
          store.addTelemetry({
            source: 'ERROR_HANDLER',
            message: `[${error.category}] ${error.message}`,
            level: error.severity === 'critical' ? 'error' : 
                   error.severity === 'high' ? 'error' :
                   error.severity === 'medium' ? 'warning' : 'info'
          });
        }
      }
    } catch (telemetryError) {
      console.warn('[useErrorHandling] Failed to report to telemetry:', telemetryError);
    }
  }, [finalConfig.enableTelemetry]);

  // Report error to external service
  const reportToService = useCallback((error: EnhancedError) => {
    if (!finalConfig.reportToService) return;
    
    const errorReport = {
      id: error.id,
      message: error.message,
      code: error.code,
      category: error.category,
      severity: error.severity,
      timestamp: error.timestamp.toISOString(),
      context: error.context,
      metadata: error.metadata,
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: error.metadata?.stack
    };
    
    // Here you would send to your error reporting service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    if (finalConfig.logToConsole) {
      console.error('[useErrorHandling] Error report:', errorReport);
    }
    
    // Example API call (replace with your service)
    /*
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    }).catch(reportError => {
      console.error('[useErrorHandling] Failed to report error:', reportError);
    });
    */
  }, [finalConfig.reportToService, finalConfig.logToConsole]);

  // Handle error with full processing
  const handleError = useCallback(async (
    error: Error | ResumeDataError,
    context?: string,
    metadata?: Record<string, any>
  ): Promise<EnhancedError> => {
    setIsHandlingError(true);
    
    try {
      const { category, severity, recoverable } = classifyError(error);
      const errorId = `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      // Get retry count for this type of error
      const errorKey = `${category}-${error.message}`;
      const retryCount = errorCounters.current.get(errorKey) || 0;
      
      const enhancedError: EnhancedError = {
        id: errorId,
        message: error.message,
        code: 'code' in error ? (error as ResumeDataError).code : undefined,
        category,
        severity,
        timestamp: new Date(),
        context,
        metadata: {
          ...metadata,
          stack: error.stack,
          name: error.name,
          originalError: error
        },
        recoverable,
        retryCount,
        maxRetries: finalConfig.maxRetries
      };
      
      // Update errors state
      setErrors(prev => [...prev.slice(-9), enhancedError]); // Keep last 10 errors
      
      // Update retry counter
      errorCounters.current.set(errorKey, retryCount + 1);
      
      // Log to console if enabled
      if (finalConfig.logToConsole) {
        console.error(`[useErrorHandling] ${category} Error:`, {
          id: errorId,
          message: error.message,
          severity,
          context,
          metadata,
          recoverable
        });
      }
      
      // Report to telemetry
      reportToTelemetry(enhancedError);
      
      // Report to external service for high/critical errors
      if (severity === 'high' || severity === 'critical') {
        reportToService(enhancedError);
      }
      
      return enhancedError;
    } finally {
      setIsHandlingError(false);
    }
  }, [classifyError, finalConfig, reportToTelemetry, reportToService]);

  // Retry mechanism with exponential backoff
  const retryOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    errorContext?: string,
    customMaxRetries?: number
  ): Promise<T> => {
    const maxRetries = customMaxRetries || finalConfig.maxRetries;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Clear error counter on success
        if (lastError) {
          const errorKey = `retry-${lastError.message}`;
          errorCounters.current.delete(errorKey);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          // Final attempt failed - handle the error
          await handleError(lastError, errorContext, {
            retryAttempts: attempt,
            finalFailure: true
          });
          throw lastError;
        }
        
        // Calculate delay with exponential backoff
        const delay = finalConfig.retryDelay * Math.pow(2, attempt);
        
        if (finalConfig.logToConsole) {
          console.warn(`[useErrorHandling] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms:`, lastError.message);
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError; // Should never reach here
  }, [finalConfig, handleError]);

  // Clear error by ID
  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors([]);
    errorCounters.current.clear();
  }, []);

  // Get errors by category
  const getErrorsByCategory = useCallback((category: ErrorCategory) => {
    return errors.filter(error => error.category === category);
  }, [errors]);

  // Get errors by severity
  const getErrorsBySeverity = useCallback((severity: ErrorSeverity) => {
    return errors.filter(error => error.severity === severity);
  }, [errors]);

  // Check if there are critical errors
  const hasCriticalErrors = useCallback(() => {
    return errors.some(error => error.severity === 'critical');
  }, [errors]);

  // Get the most recent error
  const getLatestError = useCallback(() => {
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }, [errors]);

  // Error statistics
  const getErrorStats = useCallback(() => {
    const stats = {
      total: errors.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      byCategory: {} as Record<ErrorCategory, number>
    };
    
    errors.forEach(error => {
      stats[error.severity]++;
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
    });
    
    return stats;
  }, [errors]);

  return {
    // State
    errors,
    isHandlingError,
    
    // Core functions
    handleError,
    retryOperation,
    
    // Utility functions
    clearError,
    clearAllErrors,
    getErrorsByCategory,
    getErrorsBySeverity,
    hasCriticalErrors,
    getLatestError,
    getErrorStats,
    
    // Configuration
    config: finalConfig
  };
}

/**
 * Hook specifically for resume data error handling
 */
export function useResumeErrorHandling() {
  const errorHandling = useErrorHandling({
    enableTelemetry: true,
    maxRetries: 2,
    retryDelay: 2000
  });
  
  const handleResumeError = useCallback(async (
    error: Error | ResumeDataError,
    resumeUrl?: string
  ) => {
    return errorHandling.handleError(error, 'RESUME_DATA', {
      resumeUrl,
      timestamp: new Date().toISOString()
    });
  }, [errorHandling.handleError]);
  
  const retryResumeOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    resumeUrl?: string
  ): Promise<T> => {
    return errorHandling.retryOperation(operation, `RESUME_DATA_${resumeUrl}`, 2);
  }, [errorHandling.retryOperation]);
  
  return {
    ...errorHandling,
    handleResumeError,
    retryResumeOperation
  };
}

export default useErrorHandling;