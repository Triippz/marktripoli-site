import { motion } from 'framer-motion';
import type { TelemetryEntry } from '../../types/mission';

interface LiveTelemetryProps {
  telemetryLogs: TelemetryEntry[];
}

export default function LiveTelemetry({ telemetryLogs }: LiveTelemetryProps) {
  return (
    <motion.div 
      className="floating-card p-4 overflow-hidden"
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
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
        <span className="text-green-400 font-mono text-xs uppercase">Live Telemetry</span>
      </div>
      <div className="matrix-text text-xs">
        {telemetryLogs.slice(-1)[0] ? (
          `[${new Date().toLocaleTimeString()}] ${telemetryLogs.slice(-1)[0].message}`
        ) : (
          '[STANDBY] Awaiting mission parameters...'
        )}
      </div>
    </motion.div>
  );
}