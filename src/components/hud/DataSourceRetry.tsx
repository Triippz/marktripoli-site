import { motion } from 'framer-motion';
import { useMissionControlV2 } from '../../store/missionControlV2';

export default function DataSourceRetry() {
  // Use focused selector to prevent unnecessary re-renders
  const { resumeDataState, resumeDataError, loadResumeData, addTelemetry } = useMissionControlV2(
    (state) => ({
      resumeDataState: state.resumeDataState,
      resumeDataError: state.resumeDataError,
      loadResumeData: state.loadResumeData,
      addTelemetry: state.addTelemetry,
    })
  );
  
  const handleRetry = async () => {
    const resumeUrl = import.meta.env.VITE_RESUME_URL;
    const resumeLoaderEnabled = import.meta.env.VITE_ENABLE_RESUME_LOADER === 'true';
    
    if (!resumeUrl || !resumeLoaderEnabled) {
      addTelemetry({
        source: 'DATA_RETRY',
        message: 'External intelligence URL not configured - cannot retry',
        level: 'warning'
      });
      return;
    }

    addTelemetry({
      source: 'DATA_RETRY',
      message: 'Retrying external intelligence acquisition...',
      level: 'info'
    });

    try {
      await loadResumeData(resumeUrl);
      addTelemetry({
        source: 'DATA_RETRY',
        message: 'External intelligence acquisition successful',
        level: 'info'
      });
    } catch (error) {
      addTelemetry({
        source: 'DATA_RETRY',
        message: `Retry failed: ${(error as Error)?.message || 'Unknown error'}`,
        level: 'error'
      });
    }
  };

  // Only show retry button if there's an error and we're not currently loading
  if (resumeDataState !== 'error' || resumeDataState === 'loading') {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-16 left-4 z-50"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
            <span className="text-red-400 font-mono text-xs font-bold">
              EXTERNAL DATA OFFLINE
            </span>
          </div>
        </div>
        <p className="text-red-300 font-mono text-xs mb-3">
          Enhanced intelligence unavailable. Operating with static data only.
        </p>
        {resumeDataError && (
          <p className="text-red-400 font-mono text-xs mb-3 opacity-75">
            {resumeDataError.message}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleRetry}
            className="bg-red-700 hover:bg-red-600 text-red-100 font-mono text-xs px-3 py-1 rounded transition-colors"
          >
            RETRY ACQUISITION
          </button>
          <button
            onClick={() => {
              // Hide this component by clearing the error state
              addTelemetry({
                source: 'DATA_RETRY',
                message: 'External intelligence retry dismissed - continuing with static data',
                level: 'info'
              });
            }}
            className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-mono text-xs px-3 py-1 rounded transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </motion.div>
  );
}