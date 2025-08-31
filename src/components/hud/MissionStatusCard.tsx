import { motion } from 'framer-motion';

interface MissionStatusCardProps {
  showStatusPanel: boolean;
}

export default function MissionStatusCard({ showStatusPanel }: MissionStatusCardProps) {
  return (
    <motion.div
      className="mission-panel p-8 max-w-2xl"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: showStatusPanel ? 1 : 0, 
        scale: showStatusPanel ? 1 : 0.9, 
        y: showStatusPanel ? 0 : -20 
      }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3" />
          <h1 className="holo-text font-mono text-2xl">MISSION CONTROL ACTIVE</h1>
        </div>
        
        <div className="text-green-400 font-mono mb-8">
          Global Surveillance Network Online
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="tactical-glass p-4">
            <div className="text-xs font-mono text-gray-400 mb-1">SATELLITES</div>
            <div className="text-green-400 font-mono text-xl">247</div>
            <div className="text-xs font-mono text-green-600">OPERATIONAL</div>
          </div>
          
          <div className="tactical-glass p-4">
            <div className="text-xs font-mono text-gray-400 mb-1">COVERAGE</div>
            <div className="text-green-400 font-mono text-xl">99.8%</div>
            <div className="text-xs font-mono text-green-600">GLOBAL</div>
          </div>
          
          <div className="tactical-glass p-4">
            <div className="text-xs font-mono text-gray-400 mb-1">DATA LINKS</div>
            <div className="text-green-400 font-mono text-xl">1,247</div>
            <div className="text-xs font-mono text-green-600">ACTIVE</div>
          </div>
          
          <div className="tactical-glass p-4">
            <div className="text-xs font-mono text-gray-400 mb-1">THREATS</div>
            <div className="text-green-400 font-mono text-xl">0</div>
            <div className="text-xs font-mono text-green-600">DETECTED</div>
          </div>
        </div>
        
        <div className="text-gray-400 font-mono text-sm">
          Click areas on Earth to access site intelligence
        </div>
      </div>
    </motion.div>
  );
}