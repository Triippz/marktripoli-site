import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResumeProcessingStatus, ResumeProcessingStage } from '../../types/resume';

// =============================================================================
// ENHANCED LOADING STATE COMPONENTS
// =============================================================================

interface BaseLoadingProps {
  message?: string;
  subMessage?: string;
  progress?: number; // 0-100
  stage?: string;
  showProgress?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'minimal' | 'detailed' | 'immersive';
  onCancel?: () => void;
  timeout?: number; // ms
  onTimeout?: () => void;
}

/**
 * Mission Control Tactical Loading Display
 * Features radar animation, progress tracking, and system status
 */
export function TacticalLoadingDisplay({ 
  message = "INITIALIZING SYSTEMS...",
  subMessage,
  progress = 0,
  stage,
  showProgress = true,
  showDetails = true,
  size = 'md',
  variant = 'detailed',
  onCancel,
  timeout,
  onTimeout
}: BaseLoadingProps) {
  const [dots, setDots] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Elapsed time tracking
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      setElapsed(elapsedSeconds);
      
      // Check for timeout
      if (timeout && elapsedSeconds >= timeout / 1000 && !hasTimedOut) {
        setHasTimedOut(true);
        onTimeout?.();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeout, onTimeout, hasTimedOut]);

  const sizeStyles = {
    sm: { container: 'min-h-32', radar: 'w-12 h-12', title: 'text-lg' },
    md: { container: 'min-h-48', radar: 'w-20 h-20', title: 'text-xl' },
    lg: { container: 'min-h-64', radar: 'w-28 h-28', title: 'text-2xl' },
    xl: { container: 'min-h-80', radar: 'w-36 h-36', title: 'text-3xl' }
  }[size];

  if (hasTimedOut) {
    return (
      <div className="tactical-loading-timeout">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="timeout-container"
        >
          <div className="timeout-header">
            <span className="timeout-icon">⏱</span>
            <h3 className="timeout-title">OPERATION TIMEOUT</h3>
          </div>
          <p className="timeout-message">
            System response time exceeded threshold ({timeout ? Math.floor(timeout / 1000) : 'unknown'}s)
          </p>
          <div className="timeout-actions">
            <button onClick={onCancel} className="tactical-button secondary">
              CANCEL OPERATION
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`tactical-loading-minimal ${sizeStyles.container}`}>
        <div className="minimal-container">
          <div className={`minimal-spinner ${sizeStyles.radar}`}>
            <motion.div
              className="spinner-ring"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className={`minimal-title ${sizeStyles.title}`}>
            {message}{dots}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`tactical-loading-display ${sizeStyles.container}`}>
      <div className="loading-container">
        {/* Header Section */}
        <div className="loading-header">
          <div className="radar-section">
            <div className={`radar-display ${sizeStyles.radar}`}>
              <motion.div
                className="radar-sweep"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="radar-pulse"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {showProgress && progress > 0 && (
                <div className="radar-progress">
                  <svg className="progress-ring" viewBox="0 0 42 42">
                    <circle
                      className="progress-ring-bg"
                      cx="21"
                      cy="21"
                      r="15.91549430918954"
                    />
                    <motion.circle
                      className="progress-ring-fill"
                      cx="21"
                      cy="21"
                      r="15.91549430918954"
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 100 - progress }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </svg>
                  <div className="progress-text">
                    {Math.round(progress)}%
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="status-section">
            <motion.h3
              className={`status-title ${sizeStyles.title}`}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {message}{dots}
            </motion.h3>
            {subMessage && (
              <p className="status-subtitle">{subMessage}</p>
            )}
            {stage && (
              <div className="stage-indicator">
                <span className="stage-label">STAGE:</span>
                <span className="stage-value">{stage.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Section */}
        {showProgress && (
          <div className="progress-section">
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            {showDetails && (
              <div className="progress-details">
                <span className="progress-percent">{Math.round(progress)}%</span>
                <span className="progress-elapsed">{elapsed}s elapsed</span>
              </div>
            )}
          </div>
        )}

        {/* Details Section */}
        {showDetails && variant === 'detailed' && (
          <div className="details-section">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">STATUS:</span>
                <span className="detail-value">ACTIVE</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">OPERATION:</span>
                <span className="detail-value">{stage || 'PROCESSING'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">PRIORITY:</span>
                <span className="detail-value">HIGH</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ELAPSED:</span>
                <span className="detail-value">{elapsed}s</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {onCancel && (
          <div className="actions-section">
            <button onClick={onCancel} className="tactical-button cancel">
              ABORT OPERATION
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .tactical-loading-display {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #00ff41;
          font-family: 'Courier New', monospace;
          border-radius: 8px;
        }

        .tactical-loading-minimal {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
        }

        .minimal-container {
          text-align: center;
        }

        .minimal-spinner {
          position: relative;
          margin: 0 auto 1rem;
          border: 2px solid rgba(0, 255, 65, 0.3);
          border-radius: 50%;
        }

        .spinner-ring {
          position: absolute;
          inset: -2px;
          border: 2px solid transparent;
          border-top-color: #00ff41;
          border-radius: 50%;
        }

        .minimal-title {
          color: #00ff41;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .loading-container {
          text-align: center;
          max-width: 500px;
          width: 100%;
        }

        .loading-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .loading-header {
            flex-direction: column;
            gap: 1rem;
          }
        }

        .radar-display {
          position: relative;
          border: 2px solid #00ff41;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 255, 65, 0.1) 0%, transparent 70%);
        }

        .radar-sweep {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 40%;
          background: linear-gradient(to top, #00ff41, transparent);
          transform-origin: bottom center;
          transform: translate(-50%, -100%);
          box-shadow: 0 0 10px #00ff41;
        }

        .radar-pulse {
          position: absolute;
          inset: 4px;
          border: 1px solid #00ff41;
          border-radius: 50%;
        }

        .radar-progress {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-ring {
          width: 100%;
          height: 100%;
        }

        .progress-ring-bg {
          fill: none;
          stroke: rgba(0, 255, 65, 0.2);
          stroke-width: 2;
          stroke-dasharray: 100;
          stroke-dashoffset: 0;
        }

        .progress-ring-fill {
          fill: none;
          stroke: #00ff41;
          stroke-width: 2;
          stroke-dasharray: 100;
          stroke-linecap: round;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }

        .progress-text {
          position: absolute;
          font-size: 0.8rem;
          font-weight: bold;
          color: #00ff41;
        }

        .status-section {
          text-align: left;
        }

        .status-title {
          color: #00ff41;
          font-weight: bold;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
          letter-spacing: 1px;
        }

        .status-subtitle {
          color: #cccccc;
          margin: 0 0 1rem 0;
          font-size: 1rem;
        }

        .stage-indicator {
          display: flex;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .stage-label {
          color: #ffaa00;
          font-weight: bold;
        }

        .stage-value {
          color: #ffffff;
        }

        .progress-section {
          margin-bottom: 2rem;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(0, 255, 65, 0.2);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ff41, #00cc33);
          border-radius: 3px;
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.6);
        }

        .progress-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .progress-percent {
          color: #00ff41;
          font-weight: bold;
        }

        .progress-elapsed {
          color: #cccccc;
        }

        .details-section {
          border-top: 1px solid rgba(0, 255, 65, 0.3);
          padding-top: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .detail-label {
          color: #ffaa00;
          font-weight: bold;
        }

        .detail-value {
          color: #cccccc;
        }

        .actions-section {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1rem;
        }

        .tactical-button {
          padding: 0.75rem 1.5rem;
          border: 2px solid;
          border-radius: 4px;
          background: transparent;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .tactical-button.cancel {
          color: #ff4444;
          border-color: #ff4444;
        }

        .tactical-button.cancel:hover {
          background: #ff4444;
          color: #000;
          box-shadow: 0 0 15px rgba(255, 68, 68, 0.5);
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

        .tactical-loading-timeout {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          padding: 2rem;
          background: linear-gradient(135deg, #2d1810 0%, #1a1a1a 100%);
          color: #ffaa00;
          font-family: 'Courier New', monospace;
          border-radius: 8px;
          border: 2px solid #ffaa00;
        }

        .timeout-container {
          text-align: center;
          max-width: 400px;
        }

        .timeout-header {
          margin-bottom: 1.5rem;
        }

        .timeout-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }

        .timeout-title {
          color: #ffaa00;
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
          letter-spacing: 2px;
        }

        .timeout-message {
          color: #cccccc;
          margin: 0 0 1.5rem 0;
          line-height: 1.5;
        }

        .timeout-actions {
          margin-top: 1rem;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

/**
 * Resume Data Loading Component with Stage-Specific Messaging
 */
export function ResumeDataLoadingDisplay({ 
  processingStatus,
  onCancel,
  timeout = 30000
}: {
  processingStatus: ResumeProcessingStatus | null;
  onCancel?: () => void;
  timeout?: number;
}) {
  const stageMessages = useMemo(() => ({
    fetching: {
      primary: "ACQUIRING MISSION DATA",
      secondary: "Establishing secure connection to data source...",
      details: "Downloading resume intelligence from external source"
    },
    parsing: {
      primary: "PARSING INTELLIGENCE",
      secondary: "Analyzing data structure and content...",
      details: "Validating JSON resume format and extracting information"
    },
    validating: {
      primary: "VALIDATING DATA INTEGRITY",
      secondary: "Running security and completeness checks...",
      details: "Ensuring data quality and security compliance"
    },
    enhancing: {
      primary: "ENHANCING INTELLIGENCE",
      secondary: "Enriching data with tactical enhancements...",
      details: "Adding location data, codenames, and mission classifications"
    },
    transforming: {
      primary: "TRANSFORMING DATA STRUCTURE",
      secondary: "Converting to Mission Control format...",
      details: "Mapping resume data to tactical site structure"
    },
    geocoding: {
      primary: "ANALYZING GEOGRAPHICAL DATA",
      secondary: "Plotting mission sites on tactical map...",
      details: "Determining coordinates and regional classifications"
    },
    generating: {
      primary: "GENERATING EXECUTIVE BRIEFING",
      secondary: "Compiling tactical summary and analysis...",
      details: "Creating comprehensive mission overview and recommendations"
    },
    complete: {
      primary: "MISSION DATA READY",
      secondary: "All systems operational, intelligence acquired",
      details: "Resume data successfully integrated into Mission Control"
    }
  }), []);

  const currentStage = processingStatus?.stage || 'fetching';
  const currentMessages = stageMessages[currentStage];
  
  return (
    <TacticalLoadingDisplay
      message={currentMessages.primary}
      subMessage={currentMessages.secondary}
      progress={processingStatus?.progress || 0}
      stage={currentStage}
      showProgress={true}
      showDetails={true}
      size="lg"
      variant="detailed"
      onCancel={onCancel}
      timeout={timeout}
      onTimeout={() => {
        console.warn('[ResumeDataLoadingDisplay] Operation timed out');
      }}
    />
  );
}

/**
 * Skeleton Loading Component for Resume Data
 */
export function ResumeDataSkeleton({ 
  showSites = true,
  showBriefing = true,
  showSkills = true 
}: {
  showSites?: boolean;
  showBriefing?: boolean;
  showSkills?: boolean;
}) {
  return (
    <div className="resume-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title" />
        <div className="skeleton-subtitle" />
      </div>
      
      {showBriefing && (
        <div className="skeleton-section">
          <div className="skeleton-section-title" />
          <div className="skeleton-lines">
            <div className="skeleton-line wide" />
            <div className="skeleton-line" />
            <div className="skeleton-line narrow" />
          </div>
        </div>
      )}
      
      {showSites && (
        <div className="skeleton-section">
          <div className="skeleton-section-title" />
          <div className="skeleton-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-card-header" />
                <div className="skeleton-card-content">
                  <div className="skeleton-line" />
                  <div className="skeleton-line narrow" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showSkills && (
        <div className="skeleton-section">
          <div className="skeleton-section-title" />
          <div className="skeleton-tags">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-tag" />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .resume-skeleton {
          padding: 2rem;
          space-y: 2rem;
        }

        .skeleton-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .skeleton-title {
          height: 2rem;
          width: 60%;
          margin: 0 auto 1rem;
          background: linear-gradient(90deg, rgba(0, 255, 65, 0.1) 0%, rgba(0, 255, 65, 0.2) 50%, rgba(0, 255, 65, 0.1) 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
          border-radius: 4px;
        }

        .skeleton-subtitle {
          height: 1rem;
          width: 40%;
          margin: 0 auto;
          background: linear-gradient(90deg, rgba(204, 204, 204, 0.1) 0%, rgba(204, 204, 204, 0.2) 50%, rgba(204, 204, 204, 0.1) 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite 0.5s;
          border-radius: 4px;
        }

        .skeleton-section {
          margin-bottom: 2.5rem;
        }

        .skeleton-section-title {
          height: 1.5rem;
          width: 200px;
          margin-bottom: 1.5rem;
          background: linear-gradient(90deg, rgba(255, 170, 0, 0.1) 0%, rgba(255, 170, 0, 0.2) 50%, rgba(255, 170, 0, 0.1) 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite 1s;
          border-radius: 4px;
        }

        .skeleton-lines {
          space-y: 1rem;
        }

        .skeleton-line {
          height: 1rem;
          background: linear-gradient(90deg, rgba(204, 204, 204, 0.1) 0%, rgba(204, 204, 204, 0.2) 50%, rgba(204, 204, 204, 0.1) 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
          border-radius: 4px;
          margin-bottom: 0.75rem;
        }

        .skeleton-line.wide {
          width: 90%;
        }

        .skeleton-line.narrow {
          width: 70%;
        }

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .skeleton-card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.3);
        }

        .skeleton-card-header {
          height: 1.25rem;
          width: 80%;
          margin-bottom: 1rem;
          background: linear-gradient(90deg, rgba(0, 255, 65, 0.1) 0%, rgba(0, 255, 65, 0.2) 50%, rgba(0, 255, 65, 0.1) 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
          border-radius: 4px;
        }

        .skeleton-card-content {
          space-y: 0.75rem;
        }

        .skeleton-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .skeleton-tag {
          height: 2rem;
          width: 80px;
          background: linear-gradient(90deg, rgba(0, 255, 65, 0.1) 0%, rgba(0, 255, 65, 0.2) 50%, rgba(0, 255, 65, 0.1) 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
          border-radius: 20px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Comprehensive Loading State Manager
 */
export function LoadingStateManager({
  isLoading,
  hasError,
  isEmpty,
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  emptyComponent: EmptyComponent,
  children,
  loadingProps,
  errorProps,
  emptyProps
}: {
  isLoading: boolean;
  hasError: boolean;
  isEmpty: boolean;
  loadingComponent?: React.ComponentType<any>;
  errorComponent?: React.ComponentType<any>;
  emptyComponent?: React.ComponentType<any>;
  children: React.ReactNode;
  loadingProps?: any;
  errorProps?: any;
  emptyProps?: any;
}) {
  if (isLoading) {
    if (LoadingComponent) {
      return <LoadingComponent {...loadingProps} />;
    }
    return <TacticalLoadingDisplay {...loadingProps} />;
  }

  if (hasError && ErrorComponent) {
    return <ErrorComponent {...errorProps} />;
  }

  if (isEmpty && EmptyComponent) {
    return <EmptyComponent {...emptyProps} />;
  }

  return <>{children}</>;
}

export default TacticalLoadingDisplay;