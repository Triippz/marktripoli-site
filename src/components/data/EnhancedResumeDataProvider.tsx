import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDataStore } from '../../store/missionControlV2';
import { useResumeErrorHandling } from '../../hooks/useErrorHandling';
import { ResumeDataErrorBoundary } from '../ErrorBoundary/ResumeDataErrorBoundary';
import { TacticalLoadingDisplay, ResumeDataLoadingDisplay, ResumeDataSkeleton, LoadingStateManager } from '../LoadingStates/EnhancedLoadingStates';
import type { ResumeDataError, ResumeProcessingStatus } from '../../types/resume';

interface EnhancedResumeDataProviderProps {
  resumeUrl: string;
  children: React.ReactNode;
  enableAutoLoad?: boolean;
  enableRetry?: boolean;
  enableFallback?: boolean;
  maxRetries?: number;
  timeout?: number;
  onLoadStart?: () => void;
  onLoadSuccess?: () => void;
  onLoadError?: (error: ResumeDataError) => void;
  onTimeout?: () => void;
  fallbackComponent?: React.ComponentType<any>;
  loadingComponent?: React.ComponentType<any>;
  errorComponent?: React.ComponentType<{ error: any; retry: () => void }>;
}

/**
 * Enhanced Resume Data Provider with comprehensive error handling,
 * loading states, retry logic, and Mission Control theming
 */
export function EnhancedResumeDataProvider({
  resumeUrl,
  children,
  enableAutoLoad = true,
  enableRetry = true,
  enableFallback = true,
  maxRetries = 3,
  timeout = 30000,
  onLoadStart,
  onLoadSuccess,
  onLoadError,
  onTimeout,
  fallbackComponent,
  loadingComponent,
  errorComponent
}: EnhancedResumeDataProviderProps) {
  const {
    resumeDataState,
    resumeDataError,
    processingStatus,
    loadResumeData,
    retryResumeLoad,
    clearResumeData,
    resumeUrl: currentUrl
  } = useDataStore();
  
  const { 
    handleResumeError, 
    retryResumeOperation,
    errors: errorHistory
  } = useResumeErrorHandling();

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Enhanced loading states
  const isLoading = useMemo(() => {
    return resumeDataState === 'loading' || processingStatus?.stage !== 'complete';
  }, [resumeDataState, processingStatus]);

  const hasError = useMemo(() => {
    return resumeDataState === 'error' || !!resumeDataError || hasTimedOut;
  }, [resumeDataState, resumeDataError, hasTimedOut]);

  const isEmpty = useMemo(() => {
    return resumeDataState === 'loaded' && !processingStatus && !resumeDataError;
  }, [resumeDataState, processingStatus, resumeDataError]);

  // Enhanced retry mechanism with exponential backoff
  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      console.warn('[EnhancedResumeDataProvider] Max retries exceeded');
      return;
    }

    try {
      setRetryCount(prev => prev + 1);
      setHasTimedOut(false);
      
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10s delay
      
      console.log(`[EnhancedResumeDataProvider] Retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      await retryResumeOperation(async () => {
        if (currentUrl) {
          await retryResumeLoad();
        } else {
          await loadResumeData(resumeUrl);
        }
      }, resumeUrl);
      
      onLoadSuccess?.();
      setRetryCount(0); // Reset on success
      
    } catch (error) {
      const enhancedError = await handleResumeError(error as Error, resumeUrl);
      onLoadError?.(enhancedError as ResumeDataError);
      
      if (retryCount >= maxRetries - 1) {
        console.error('[EnhancedResumeDataProvider] All retry attempts exhausted');
      }
    }
  }, [retryCount, maxRetries, resumeUrl, currentUrl, loadResumeData, retryResumeLoad, retryResumeOperation, handleResumeError, onLoadSuccess, onLoadError]);

  // Timeout handling
  useEffect(() => {
    if (!isLoading || hasTimedOut) return;

    const timeoutId = setTimeout(() => {
      console.warn(`[EnhancedResumeDataProvider] Operation timed out after ${timeout}ms`);
      setHasTimedOut(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [isLoading, timeout, hasTimedOut, onTimeout]);

  // Auto-load resume data
  useEffect(() => {
    if (!enableAutoLoad || !resumeUrl) return;
    
    // Only load if we haven't loaded this URL or if we're in an error state
    if (isInitialLoad || (currentUrl !== resumeUrl) || hasError) {
      const loadData = async () => {
        try {
          setIsInitialLoad(false);
          setHasTimedOut(false);
          onLoadStart?.();
          
          await retryResumeOperation(async () => {
            await loadResumeData(resumeUrl);
          }, resumeUrl);
          
          onLoadSuccess?.();
        } catch (error) {
          const enhancedError = await handleResumeError(error as Error, resumeUrl);
          onLoadError?.(enhancedError as ResumeDataError);
        }
      };
      
      loadData();
    }
  }, [enableAutoLoad, resumeUrl, currentUrl, isInitialLoad, hasError, loadResumeData, retryResumeOperation, handleResumeError, onLoadStart, onLoadSuccess, onLoadError]);

  // Custom error component
  const CustomErrorComponent = useMemo(() => {
    if (errorComponent) {
      return () => errorComponent({ error: resumeDataError || new Error('Unknown error'), retry: handleRetry });
    }
    
    return () => (
      <TacticalErrorDisplay 
        error={resumeDataError || new Error('Unknown error')}
        hasTimedOut={hasTimedOut}
        retryCount={retryCount}
        maxRetries={maxRetries}
        onRetry={enableRetry ? handleRetry : undefined}
        onClearData={() => clearResumeData()}
        errorHistory={errorHistory}
      />
    );
  }, [errorComponent, resumeDataError, hasTimedOut, retryCount, maxRetries, enableRetry, handleRetry, clearResumeData, errorHistory]);

  // Custom loading component
  const CustomLoadingComponent = useMemo(() => {
    if (loadingComponent) {
      return () => loadingComponent({ processingStatus, onCancel: enableRetry ? handleRetry : undefined });
    }
    
    return () => (
      <ResumeDataLoadingDisplay 
        processingStatus={processingStatus}
        onCancel={enableRetry ? () => clearResumeData() : undefined}
        timeout={timeout}
      />
    );
  }, [loadingComponent, processingStatus, enableRetry, handleRetry, clearResumeData, timeout]);

  // Fallback component
  const FallbackComponent = useMemo(() => {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    
    return () => (
      <ResumeDataSkeleton 
        showSites={true}
        showBriefing={true}
        showSkills={true}
      />
    );
  }, [fallbackComponent]);

  return (
    <ResumeDataErrorBoundary
      fallback={(error, retry) => (
        <CustomErrorComponent />
      )}
      onError={(error, errorInfo) => {
        handleResumeError(error, resumeUrl).then(enhancedError => {
          onLoadError?.(enhancedError as ResumeDataError);
        });
      }}
    >
      <LoadingStateManager
        isLoading={isLoading}
        hasError={hasError}
        isEmpty={isEmpty && !enableFallback}
        loadingComponent={CustomLoadingComponent}
        errorComponent={CustomErrorComponent}
        emptyComponent={FallbackComponent}
        loadingProps={{ processingStatus, timeout }}
        errorProps={{ error: resumeDataError, retry: handleRetry }}
        emptyProps={{}}
      >
        {children}
      </LoadingStateManager>
    </ResumeDataErrorBoundary>
  );
}

/**
 * Tactical-themed error display component
 */
function TacticalErrorDisplay({
  error,
  hasTimedOut,
  retryCount,
  maxRetries,
  onRetry,
  onClearData,
  errorHistory
}: {
  error: ResumeDataError | Error;
  hasTimedOut: boolean;
  retryCount: number;
  maxRetries: number;
  onRetry?: () => void;
  onClearData: () => void;
  errorHistory: any[];
}) {
  const canRetry = onRetry && retryCount < maxRetries;
  const errorType = hasTimedOut ? 'TIMEOUT' : error.name || 'SYSTEM_ERROR';
  const errorCode = 'code' in error ? error.code : 'UNKNOWN';
  
  return (
    <div className="tactical-error-display">
      <div className="error-container">
        {/* Error Header */}
        <div className="error-header">
          <div className="error-indicator">
            {hasTimedOut ? '⏱' : '⚠'}
          </div>
          <div className="error-info">
            <h3 className="error-title">
              {hasTimedOut ? 'OPERATION TIMEOUT' : 'DATA ACQUISITION FAILED'}
            </h3>
            <div className="error-meta">
              <span>TYPE: {errorType}</span>
              <span>CODE: {errorCode}</span>
              <span>ATTEMPT: {retryCount + 1}/{maxRetries}</span>
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        <div className="error-message">
          {hasTimedOut 
            ? 'Resume data acquisition exceeded maximum time limit. Network or server may be experiencing issues.'
            : error.message
          }
        </div>
        
        {/* Error History */}
        {errorHistory.length > 0 && (
          <details className="error-history">
            <summary>Recent Error History ({errorHistory.length})</summary>
            <div className="history-list">
              {errorHistory.slice(-3).map((historicalError, index) => (
                <div key={index} className="history-item">
                  <span className="history-time">
                    {new Date(historicalError.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="history-message">
                    {historicalError.category}: {historicalError.message}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
        
        {/* Actions */}
        <div className="error-actions">
          {canRetry && (
            <button onClick={onRetry} className="tactical-button primary">
              <span className="button-icon">🔄</span>
              RETRY OPERATION ({maxRetries - retryCount} left)
            </button>
          )}
          
          <button onClick={onClearData} className="tactical-button secondary">
            <span className="button-icon">🛡</span>
            PROCEED WITH STATIC DATA
          </button>
        </div>
        
        {/* Recovery Instructions */}
        <div className="recovery-instructions">
          <h4>RECOVERY PROTOCOL:</h4>
          <ul>
            {hasTimedOut ? (
              <>
                <li>Check network connectivity</li>
                <li>Verify resume URL is accessible</li>
                <li>Try again with increased timeout</li>
              </>
            ) : (
              <>
                <li>Verify resume URL format and accessibility</li>
                <li>Check for valid JSON Resume schema</li>
                <li>Review browser console for detailed errors</li>
                <li>Contact support if issues persist</li>
              </>
            )}
          </ul>
        </div>
      </div>
      
      <style jsx>{`
        .tactical-error-display {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #1a0000 0%, #330000 100%);
          border: 2px solid #ff4444;
          border-radius: 8px;
          color: #ff4444;
          font-family: 'Courier New', monospace;
        }
        
        .error-container {
          max-width: 600px;
          width: 100%;
        }
        
        .error-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .error-indicator {
          font-size: 3rem;
          animation: pulse 2s infinite;
        }
        
        .error-info {
          flex: 1;
        }
        
        .error-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0 0 0.5rem 0;
          color: #ff4444;
          letter-spacing: 1px;
        }
        
        .error-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: #ffaa00;
        }
        
        .error-message {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #ff4444;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #ffffff;
          line-height: 1.5;
        }
        
        .error-history {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #666;
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }
        
        .error-history summary {
          padding: 1rem;
          cursor: pointer;
          font-weight: bold;
          color: #ffaa00;
        }
        
        .history-list {
          padding: 0 1rem 1rem 1rem;
        }
        
        .history-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .history-time {
          color: #888;
          min-width: 80px;
        }
        
        .history-message {
          color: #ccc;
          flex: 1;
        }
        
        .error-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .tactical-button {
          padding: 1rem 1.5rem;
          border: 2px solid;
          border-radius: 4px;
          background: transparent;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .tactical-button.primary {
          color: #00ff41;
          border-color: #00ff41;
        }
        
        .tactical-button.primary:hover {
          background: #00ff41;
          color: #000;
          box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
        }
        
        .tactical-button.secondary {
          color: #ffaa00;
          border-color: #ffaa00;
        }
        
        .tactical-button.secondary:hover {
          background: #ffaa00;
          color: #000;
          box-shadow: 0 0 15px rgba(255, 170, 0, 0.5);
        }
        
        .recovery-instructions {
          border-top: 1px solid #444;
          padding-top: 1rem;
        }
        
        .recovery-instructions h4 {
          color: #ffaa00;
          margin: 0 0 1rem 0;
          font-size: 1rem;
        }
        
        .recovery-instructions ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #ccc;
        }
        
        .recovery-instructions li {
          margin: 0.5rem 0;
          line-height: 1.4;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// Export additional utility components
export { ResumeDataSkeleton, TacticalLoadingDisplay, LoadingStateManager };
export default EnhancedResumeDataProvider;