// Enhanced Error Boundary exports
export { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
export { 
  GlobalErrorBoundary, 
  DataErrorBoundary, 
  MapErrorBoundary, 
  UIErrorBoundary 
} from './GlobalErrorBoundary';
export { 
  ResumeDataErrorBoundary, 
  useResumeDataErrorBoundary 
} from './ResumeDataErrorBoundary';

// Re-export original error boundary for compatibility
export { default as ErrorBoundary } from '../ErrorBoundary';

// Types
export type {
  ErrorSeverity,
  ErrorCategory,
  EnhancedError,
  ErrorHandlingConfig
} from '../../hooks/useErrorHandling';