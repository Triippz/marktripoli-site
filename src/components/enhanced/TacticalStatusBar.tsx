import { motion } from 'framer-motion';
import { useMissionControl } from '../../store/missionControl';

interface TacticalStatusBarProps {
  className?: string;
}

export default function TacticalStatusBar({ className = '' }: TacticalStatusBarProps) {
  const { userRank, visitedSites, telemetryLogs, soundEnabled } = useMissionControl();

  const systemStatus = {
    uptime: '72:14:33',
    connections: 8,
    dataRate: '2.4 KB/s',
    security: 'LEVEL-5',
    lastPing: new Date().toLocaleTimeString()
  };

  const threats = [
    'NO IMMEDIATE THREATS',
    'PERIMETER SECURE',
    'ALL SYSTEMS NOMINAL'
  ];

  return (
    <motion.div 
      className={`fixed bottom-0 left-0 bg-black/90 border-t border-green-500/30 p-4 font-mono text-xs z-40 ${className}`}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* System Status */}
        <div className="space-y-2">
          <div className="text-green-500 font-bold tracking-wider">SYSTEM STATUS</div>
          <div className="space-y-1 text-white/80">
            <div>UPTIME: <span className="text-green-400">{systemStatus.uptime}</span></div>
            <div>RANK: <span className="text-green-400">{userRank.badge} {userRank.title}</span></div>
            <div>AUDIO: <span className={soundEnabled ? 'text-green-400' : 'text-red-400'}>
              {soundEnabled ? 'ENABLED' : 'DISABLED'}
            </span></div>
          </div>
        </div>

        {/* Network Status */}
        <div className="space-y-2">
          <div className="text-green-500 font-bold tracking-wider">NETWORK</div>
          <div className="space-y-1 text-white/80">
            <div>CONNECTIONS: <span className="text-green-400">{systemStatus.connections}</span></div>
            <div>DATA RATE: <span className="text-green-400">{systemStatus.dataRate}</span></div>
            <div>LAST PING: <span className="text-green-400">{systemStatus.lastPing}</span></div>
          </div>
        </div>

        {/* Mission Progress */}
        <div className="space-y-2">
          <div className="text-green-500 font-bold tracking-wider">MISSION PROGRESS</div>
          <div className="space-y-1 text-white/80">
            <div>SITES VISITED: <span className="text-green-400">{visitedSites.length}</span></div>
            <div>SECURITY: <span className="text-green-400">{systemStatus.security}</span></div>
            <div>CLEARANCE: <span className="text-green-400">AUTHORIZED</span></div>
          </div>
        </div>

        {/* Threat Assessment */}
        <div className="space-y-2">
          <div className="text-green-500 font-bold tracking-wider">THREAT LEVEL</div>
          <div className="space-y-1">
            {threats.map((threat, index) => (
              <motion.div
                key={index}
                className="text-green-400 text-xs"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: index * 0.5
                }}
              >
                • {threat}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Data Stream */}
      <div className="mt-4 border-t border-green-500/20 pt-2">
        <div className="text-green-500 text-xs mb-2">LIVE TELEMETRY</div>
        <div className="bg-black/50 rounded px-2 py-1 h-8 overflow-hidden">
          <motion.div
            className="text-green-400 text-xs whitespace-nowrap"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: 'linear' 
            }}
          >
            {telemetryLogs.slice(-3).map((log, index) => 
              `[${log.timestamp.toLocaleTimeString()}] ${log.message} • `
            ).join('')}
            SYSTEM OPERATIONAL • DATA LINK SECURE • MISSION STATUS: ACTIVE •
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}