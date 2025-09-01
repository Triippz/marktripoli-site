import { motion } from 'framer-motion';
import { useMissionControl } from '../../store/missionControl';
import { useDataStore } from '../../store/missionControlV2';

export default function DataSourceRetry() {
  const { addTelemetry } = useMissionControl();
  const { loadResumeData, resumeDataState, resumeDataError } = useDataStore();
  
  const handleRetry = async () => {
    addTelemetry({
      source: 'DATA_RETRY',
      message: 'Retrying resume data acquisition from local source...',
      level: 'info'
    });

    try {
      await loadResumeData('/resume.json');
      addTelemetry({
        source: 'DATA_RETRY',
        message: 'Resume data acquisition successful',
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
