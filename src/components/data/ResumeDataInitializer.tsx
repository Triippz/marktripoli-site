import { useEffect, useState } from 'react';
import { useDataStore, useTelemetryStore } from '../../store/missionControlV2';

interface ResumeDataInitializerProps {
  resumeUrl?: string;
  autoLoad?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

const DEFAULT_RESUME_URL = '/resume.json';

export default function ResumeDataInitializer({
  resumeUrl = DEFAULT_RESUME_URL,
  autoLoad = true,
  retryAttempts = 3,
  retryDelay = 2000
}: ResumeDataInitializerProps) {
  const { 
    resumeDataState, 
    resumeDataError, 
    loadResumeData, 
    retryResumeLoad 
  } = useDataStore();
  const { addTelemetry } = useTelemetryStore();
  const [attemptCount, setAttemptCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeResumeData = async () => {
      if (!autoLoad || isInitialized || resumeDataState === 'loading' || resumeDataState === 'loaded') {
        return;
      }

      setIsInitialized(true);
      addTelemetry({
        source: 'DATA',
        message: `Initializing resume data from ${resumeUrl}`,
        level: 'info'
      });

      try {
        await loadResumeData(resumeUrl);
        setAttemptCount(0);
        addTelemetry({
          source: 'DATA',
          message: 'Resume data initialized successfully',
          level: 'success'
        });
      } catch (error) {
        console.warn('[ResumeDataInitializer] Failed to load resume data:', error);
        
        addTelemetry({
          source: 'DATA',
          message: `Resume data initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          level: 'warning'
        });

        // Implement retry logic
        if (attemptCount < retryAttempts) {
          const newAttemptCount = attemptCount + 1;
          setAttemptCount(newAttemptCount);
          
          addTelemetry({
            source: 'DATA',
            message: `Retrying resume data load (attempt ${newAttemptCount}/${retryAttempts})`,
            level: 'info'
          });

          setTimeout(() => {
            setIsInitialized(false); // Reset to trigger another attempt
          }, retryDelay);
        } else {
          addTelemetry({
            source: 'DATA',
            message: `Resume data initialization failed after ${retryAttempts} attempts - using fallback data`,
            level: 'error'
          });
        }
      }
    };

    initializeResumeData();
  }, [
    resumeUrl, 
    autoLoad, 
    resumeDataState, 
    loadResumeData, 
    addTelemetry, 
    attemptCount, 
    retryAttempts, 
    retryDelay,
    isInitialized
  ]);

  // Handle retry logic when resumeDataError changes
  useEffect(() => {
    const handleRetry = async () => {
      if (resumeDataError && attemptCount > 0 && attemptCount < retryAttempts) {
        addTelemetry({
          source: 'DATA',
          message: `Attempting resume data retry (${attemptCount}/${retryAttempts})`,
          level: 'info'
        });

        try {
          await retryResumeLoad();
          setAttemptCount(0);
          addTelemetry({
            source: 'DATA',
            message: 'Resume data retry successful',
            level: 'success'
          });
        } catch (error) {
          if (attemptCount >= retryAttempts) {
            addTelemetry({
              source: 'DATA',
              message: `Resume data retry failed - max attempts reached`,
              level: 'error'
            });
          }
        }
      }
    };

    if (resumeDataError && attemptCount > 0) {
      const timer = setTimeout(handleRetry, retryDelay);
      return () => clearTimeout(timer);
    }
  }, [resumeDataError, attemptCount, retryAttempts, retryDelay, retryResumeLoad, addTelemetry]);

  // This component doesn't render anything - it's purely for data initialization
  return null;
}

// Export a hook for components that need to trigger resume data loading manually
export function useResumeDataLoader() {
  const { loadResumeData, resumeDataState, resumeDataError } = useDataStore();
  const { addTelemetry } = useTelemetryStore();

  const loadWithTelemetry = async (url: string) => {
    addTelemetry({
      source: 'USER',
      message: `Manual resume data load requested: ${url}`,
      level: 'info'
    });

    try {
      await loadResumeData(url);
      addTelemetry({
        source: 'USER',
        message: 'Manual resume data load successful',
        level: 'success'
      });
    } catch (error) {
      addTelemetry({
        source: 'USER',
        message: `Manual resume data load failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        level: 'error'
      });
      throw error;
    }
  };

  return {
    loadResumeData: loadWithTelemetry,
    isLoading: resumeDataState === 'loading',
    isLoaded: resumeDataState === 'loaded',
    hasError: resumeDataState === 'error',
    error: resumeDataError
  };
}
