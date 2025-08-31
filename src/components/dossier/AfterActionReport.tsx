import { motion } from 'framer-motion';
import type { SiteData } from '../../types/mission';

interface AfterActionReportProps {
  site: SiteData;
}

function AfterActionReport({ site }: AfterActionReportProps) {
  if (!site.afterAction || site.afterAction.length === 0) {
    return (
      <div className="text-center text-mc-gray font-mono">
        No after-action report available.
      </div>
    );
  }

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
          AFTER-ACTION REPORT
        </h2>
        <p className="text-mc-gray text-sm font-mono mt-2">
          Lessons learned and strategic insights from deployment
        </p>
      </div>

      {/* Key Insights */}
      <div className="space-y-4">
        {site.afterAction.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-mc-panel/20 rounded border-l-4 border-yellow-500/50"
          >
            <div className="flex items-start space-x-3">
              {/* Insight Icon */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center mt-0.5">
                <span className="text-yellow-500 text-xs">💡</span>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="text-mc-white leading-relaxed">
                  {insight}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Classification Footer */}
      <div className="pt-6 border-t border-mc-green/30">
        <div className="flex justify-between items-center text-sm font-mono">
          <div className="text-mc-gray">
            CLASSIFICATION: LESSONS LEARNED
          </div>
          <div className="text-yellow-500">
            FOR STRATEGIC PLANNING USE ONLY
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AfterActionReport;