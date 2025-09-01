import { motion } from 'framer-motion';
import type { TelemetryEntry } from '../../types/mission';

interface LiveTelemetryProps {
  telemetryLogs: TelemetryEntry[];
}

export default function LiveTelemetry({ telemetryLogs }: LiveTelemetryProps) {
  const latestLog = telemetryLogs.slice(-1)[0];
  
  // Determine colors and icons based on log level
  const getLogStyle = (level?: string) => {
    switch (level) {
      case 'error':
        return {
          indicatorColor: 'bg-red-500',
          textColor: 'text-red-400',
          messageColor: 'text-red-300',
          icon: '⚠️'
        };
      case 'warning':
        return {
          indicatorColor: 'bg-yellow-500',
          textColor: 'text-yellow-400',
          messageColor: 'text-yellow-300',
          icon: '⚠️'
        };
      case 'info':
      default:
        return {
          indicatorColor: 'bg-green-500',
          textColor: 'text-green-400',
          messageColor: 'text-green-300',
          icon: '🔗'
        };
    }
  };

  const logStyle = getLogStyle(latestLog?.level);

  return (
    <motion.div 
      className="floating-card overflow-hidden"
      style={{ 
        position: 'fixed', 
        bottom: '1rem', 
        right: '1rem', 
        zIndex: 60 
      }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.9 }}
    >
      <div className="flex items-center mb-2">
        <div className={`w-2 h-2 ${logStyle.indicatorColor} rounded-full animate-pulse mr-2`} />
        <span className={`${logStyle.textColor} font-mono text-xs uppercase`}>
          Live Telemetry
        </span>
        {latestLog?.level === 'error' && (
          <span className="text-red-500 ml-1 animate-pulse">●</span>
        )}
      </div>
      <div className={`matrix-text text-xs ${logStyle.messageColor}`}>
        {latestLog ? (
          <span>
            <span className="opacity-60">[{new Date().toLocaleTimeString()}]</span>{' '}
            {logStyle.icon} {latestLog.message}
          </span>
        ) : (
          <span className="text-green-400">
            🔗 [STANDBY] Awaiting mission parameters...
          </span>
        )}
      </div>
    </motion.div>
  );
}