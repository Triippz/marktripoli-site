import { motion } from 'framer-motion';
import type { SiteData } from '../../types/mission';

interface DeploymentLogsProps {
  site: SiteData;
}

function DeploymentLogs({ site }: DeploymentLogsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="border-b border-mc-green/30 pb-4">
        <h2 className="text-xl font-mono text-mc-green">
          DEPLOYMENT LOGS
        </h2>
        <p className="text-mc-gray text-sm font-mono mt-2">
          Operational achievements and mission objectives completed
        </p>
      </div>

      {/* Log Entries */}
      <div className="space-y-4">
        {site.deploymentLogs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-4 p-4 bg-mc-panel/30 rounded border-l-2 border-mc-green/50"
          >
            {/* Entry Number */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-mc-green/20 border border-mc-green flex items-center justify-center">
                <span className="text-mc-green font-mono text-sm">
                  {index + 1}
                </span>
              </div>
            </div>

            {/* Log Content */}
            <div className="flex-1">
              <div className="text-mc-white leading-relaxed">
                {log}
              </div>
            </div>

            {/* Status Icon */}
            <div className="flex-shrink-0">
              <div className="text-mc-green text-xl">✓</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-mc-green/30">
        <div className="text-center">
          <div className="text-2xl font-mono text-mc-green">
            {site.deploymentLogs.length}
          </div>
          <div className="text-sm font-mono text-mc-gray">
            OBJECTIVES
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-mono text-mc-green">
            100%
          </div>
          <div className="text-sm font-mono text-mc-gray">
            SUCCESS RATE
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-mono text-mc-green">
            {site.type.toUpperCase()}
          </div>
          <div className="text-sm font-mono text-mc-gray">
            MISSION TYPE
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-mono text-mc-green">
            ACTIVE
          </div>
          <div className="text-sm font-mono text-mc-gray">
            STATUS
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="pt-4">
        <h4 className="text-mc-green font-mono text-sm mb-4">
          DEPLOYMENT TIMELINE
        </h4>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-mc-green/30"></div>
          
          {/* Timeline Points */}
          {site.deploymentLogs.map((_, index) => (
            <div key={index} className="relative flex items-center mb-4">
              <div className="w-2 h-2 bg-mc-green rounded-full ring-4 ring-mc-green/20 z-10"></div>
              <div className="ml-4 text-mc-gray font-mono text-sm">
                Phase {index + 1} Complete
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default DeploymentLogs;