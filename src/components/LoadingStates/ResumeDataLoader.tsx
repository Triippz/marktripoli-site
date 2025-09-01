import React, { useEffect, useState } from 'react';
import { useDataStore } from '../../store/missionControlV2';
import type { ResumeDataState } from '../../types/resume';

interface ResumeDataLoaderProps {
  resumeUrl: string;
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{ error: any; retry: () => void }>;
  loadingComponent?: React.ComponentType;
  autoLoad?: boolean;
}

/**
 * Component that handles resume data loading with Mission Control theming
 * Provides loading states, error handling, and automatic retry logic
 */
export function ResumeDataLoader({ 
  resumeUrl, 
  children, 
  fallbackComponent: FallbackComponent,
  loadingComponent: LoadingComponent,
  autoLoad = true 
}: ResumeDataLoaderProps) {
  const {
    resumeDataState,
    resumeDataError,
    loadResumeData,
    retryResumeLoad,
    resumeUrl: currentUrl
  } = useDataStore();

  const [hasInitializedLoad, setHasInitializedLoad] = useState(false);

  // Auto-load resume data on mount or URL change
  useEffect(() => {
    if (autoLoad && resumeUrl && (!hasInitializedLoad || currentUrl !== resumeUrl)) {
      loadResumeData(resumeUrl).catch(error => {
        console.error('[ResumeDataLoader] Failed to load resume data:', error);
      });
      setHasInitializedLoad(true);
    }
  }, [resumeUrl, autoLoad, hasInitializedLoad, currentUrl, loadResumeData]);

  const handleRetry = () => {
    if (resumeUrl) {
      loadResumeData(resumeUrl).catch(error => {
        console.error('[ResumeDataLoader] Retry failed:', error);
      });
    } else {
      retryResumeLoad().catch(error => {
        console.error('[ResumeDataLoader] Retry failed:', error);
      });
    }
  };

  // Show loading state
  if (resumeDataState === 'loading') {
    if (LoadingComponent) {
      return <LoadingComponent />;
    }
    
    return <MissionControlLoadingDisplay />;
  }

  // Show error state
  if (resumeDataState === 'error' && resumeDataError) {
    if (FallbackComponent) {
      return <FallbackComponent error={resumeDataError} retry={handleRetry} />;
    }
    
    return (
      <MissionControlErrorDisplay 
        error={resumeDataError} 
        onRetry={handleRetry} 
      />
    );
  }

  // Show children when loaded or idle
  return <>{children}</>;
}

/**
 * Default Mission Control themed loading display
 */
function MissionControlLoadingDisplay() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mission-loading-display">
      <div className="loading-container">
        <div className="loading-header">
          <div className="loading-indicator">
            <div className="radar-sweep"></div>
          </div>
          <h3 className="loading-title">ACQUIRING MISSION DATA</h3>
        </div>
        
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <div className="loading-text">
            Downloading resume data{dots}
          </div>
        </div>

        <div className="loading-details">
          <div className="detail-line">
            <span className="detail-label">STATUS:</span>
            <span className="detail-value">CONNECTING TO DATA SOURCE</span>
          </div>
          <div className="detail-line">
            <span className="detail-label">OPERATION:</span>
            <span className="detail-value">RESUME INTELLIGENCE GATHERING</span>
          </div>
          <div className="detail-line">
            <span className="detail-label">CLASSIFICATION:</span>
            <span className="detail-value">UNCLASSIFIED</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mission-loading-display {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          padding: 2rem;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #00ff41;
          font-family: 'Courier New', monospace;
        }

        .loading-container {
          text-align: center;
          max-width: 400px;
        }

        .loading-header {
          margin-bottom: 2rem;
        }

        .loading-indicator {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 1rem;
          border: 2px solid #00ff41;
          border-radius: 50%;
        }

        .radar-sweep {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 30px;
          background: #00ff41;
          transform-origin: bottom center;
          transform: translate(-50%, -100%) rotate(0deg);
          animation: radarSweep 2s linear infinite;
          box-shadow: 0 0 10px #00ff41;
        }

        .loading-title {
          color: #00ff41;
          font-size: 1.2rem;
          font-weight: bold;
          margin: 0;
          text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
          letter-spacing: 2px;
        }

        .loading-progress {
          margin-bottom: 2rem;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(0, 255, 65, 0.2);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: #00ff41;
          border-radius: 2px;
          animation: progressPulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.6);
        }

        .loading-text {
          font-size: 1rem;
          color: #cccccc;
          min-height: 1.2em;
        }

        .loading-details {
          border-top: 1px solid rgba(0, 255, 65, 0.3);
          padding-top: 1rem;
          text-align: left;
        }

        .detail-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.8rem;
        }

        .detail-label {
          color: #ffaa00;
          font-weight: bold;
        }

        .detail-value {
          color: #cccccc;
        }

        @keyframes radarSweep {
          0% { transform: translate(-50%, -100%) rotate(0deg); }
          100% { transform: translate(-50%, -100%) rotate(360deg); }
        }

        @keyframes progressPulse {
          0%, 100% { width: 20%; transform: translateX(0); }
          50% { width: 80%; transform: translateX(25px); }
        }
      `}</style>
    </div>
  );
}

/**
 * Default Mission Control themed error display
 */
function MissionControlErrorDisplay({ error, onRetry }: { error: any; onRetry: () => void }) {
  return (
    <div className="mission-error-display">
      <div className="error-container">
        <div className="error-header">
          <span className="error-indicator">⚠</span>
          <h3 className="error-title">DATA ACQUISITION FAILED</h3>
        </div>
        
        <div className="error-message">
          <strong>ERROR CODE:</strong> {error.code}<br />
          <strong>MESSAGE:</strong> {error.message}
        </div>

        <button className="retry-button" onClick={onRetry}>
          RETRY MISSION
        </button>
      </div>

      <style jsx>{`
        .mission-error-display {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          padding: 2rem;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #ff4444;
          font-family: 'Courier New', monospace;
        }

        .error-container {
          text-align: center;
          max-width: 400px;
          border: 2px solid #ff4444;
          border-radius: 8px;
          padding: 2rem;
          background: rgba(255, 68, 68, 0.1);
        }

        .error-header {
          margin-bottom: 1.5rem;
        }

        .error-indicator {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }

        .error-title {
          color: #ff4444;
          font-size: 1.2rem;
          font-weight: bold;
          margin: 0;
          text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
          letter-spacing: 2px;
        }

        .error-message {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #666;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #cccccc;
        }

        .retry-button {
          padding: 0.75rem 2rem;
          border: 2px solid #00ff41;
          border-radius: 4px;
          background: transparent;
          color: #00ff41;
          font-family: inherit;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .retry-button:hover {
          background: #00ff41;
          color: #000;
          box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}