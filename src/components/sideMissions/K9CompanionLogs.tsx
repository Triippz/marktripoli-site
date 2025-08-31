import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface K9Activity {
  id: string;
  timestamp: string;
  activity: string;
  location: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  priority: 'high' | 'medium' | 'low';
  details?: string;
}

const k9Activities: K9Activity[] = [
  {
    id: 'morning_patrol',
    timestamp: '2024-08-31T06:30:00Z',
    activity: 'Perimeter Security Check',
    location: 'Backyard Quadrant Alpha',
    status: 'completed',
    priority: 'high',
    details: 'All squirrel activity monitored. No breaches detected.'
  },
  {
    id: 'ball_retrieval',
    timestamp: '2024-08-31T08:15:00Z',
    activity: 'Ball Retrieval Operations',
    location: 'Living Room Delta',
    status: 'completed',
    priority: 'medium',
    details: 'Mission success rate: 99.8% (1 ball temporarily lost under couch)'
  },
  {
    id: 'food_security',
    timestamp: '2024-08-31T12:00:00Z',
    activity: 'Food Bowl Reconnaissance',
    location: 'Kitchen Station Bravo',
    status: 'in_progress',
    priority: 'high',
    details: 'Ongoing surveillance of kibble supply levels. Requesting resupply.'
  },
  {
    id: 'nap_deployment',
    timestamp: '2024-08-31T14:30:00Z',
    activity: 'Strategic Rest Operation',
    location: 'Couch Position Charlie',
    status: 'scheduled',
    priority: 'low',
    details: 'Preparing for afternoon deployment to sunny spot near window.'
  },
  {
    id: 'mailman_alert',
    timestamp: '2024-08-31T15:45:00Z',
    activity: 'Perimeter Threat Assessment',
    location: 'Front Door Checkpoint',
    status: 'scheduled',
    priority: 'high',
    details: 'Daily mailman reconnaissance mission. High alert status maintained.'
  }
];

function K9CompanionLogs() {
  const [selectedActivity, setSelectedActivity] = useState<K9Activity | null>(null);
  const [liveUpdate, setLiveUpdate] = useState('');

  useEffect(() => {
    // Simulate live updates
    const updates = [
      'K9 asset reports all clear on western perimeter...',
      'Tail status: MAXIMUM WAG DETECTED',
      'Belly rub request submitted to command...',
      'Squirrel movement detected at 15:32:05 - investigating...',
      'Treat acquisition mission planned for 16:00 hours...',
      'Afternoon patrol complete - returning to base...'
    ];

    let updateIndex = 0;
    const interval = setInterval(() => {
      setLiveUpdate(updates[updateIndex]);
      updateIndex = (updateIndex + 1) % updates.length;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: K9Activity['status']) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in_progress': return 'text-yellow-500';
      case 'scheduled': return 'text-blue-500';
    }
  };

  const getPriorityIcon = (priority: K9Activity['priority']) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="border-b border-green-500/30 pb-4">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">🐕</span>
          <h2 className="text-xl font-mono text-green-500">
            K9 COMPANION LOGS
          </h2>
        </div>
        <p className="text-gray-400 text-sm font-mono">
          Real-time operational status and mission reports from companion asset
        </p>
      </div>

      {/* Live Update Ticker */}
      <div className="tactical-panel p-3">
        <div className="flex items-center space-x-2">
          <div className="status-dot active"></div>
          <div className="matrix-text text-xs flex-1">
            [LIVE] {liveUpdate}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="space-y-3">
        {k9Activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="tactical-panel p-4 cursor-pointer hover:bg-green-500/5"
            onClick={() => setSelectedActivity(activity)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span>{getPriorityIcon(activity.priority)}</span>
                <div>
                  <div className="text-white font-mono text-sm">{activity.activity}</div>
                  <div className="text-gray-400 text-xs font-mono">{activity.location}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-xs font-mono uppercase ${getStatusColor(activity.status)}`}>
                  {activity.status.replace('_', ' ')}
                </div>
                <div className="text-gray-500 text-xs font-mono">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* K9 Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-green-500/30">
        <div className="text-center">
          <div className="text-2xl font-mono text-green-500">99.8%</div>
          <div className="text-xs font-mono text-gray-400">FETCH SUCCESS</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-mono text-green-500">247</div>
          <div className="text-xs font-mono text-gray-400">SQUIRRELS DETECTED</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-mono text-green-500">∞</div>
          <div className="text-xs font-mono text-gray-400">LOYALTY LEVEL</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-mono text-green-500">14/10</div>
          <div className="text-xs font-mono text-gray-400">GOOD BOY RATING</div>
        </div>
      </div>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              className="terminal-window max-w-lg w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="terminal-header">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span>{getPriorityIcon(selectedActivity.priority)}</span>
                    <div className="holo-text font-mono">K9 MISSION DETAILS</div>
                  </div>
                  <button 
                    onClick={() => setSelectedActivity(null)}
                    className="text-green-500 hover:text-red-400 font-mono text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="terminal-content space-y-4">
                <div>
                  <h3 className="text-green-500 font-mono text-lg mb-2">
                    {selectedActivity.activity}
                  </h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">LOCATION:</span>
                      <span className="text-white">{selectedActivity.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">TIMESTAMP:</span>
                      <span className="text-white">
                        {new Date(selectedActivity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">STATUS:</span>
                      <span className={getStatusColor(selectedActivity.status)}>
                        {selectedActivity.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">PRIORITY:</span>
                      <span className="text-white">{selectedActivity.priority.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                
                {selectedActivity.details && (
                  <div className="hud-panel p-3">
                    <div className="text-green-500 text-xs font-mono mb-2">MISSION NOTES</div>
                    <p className="text-gray-300 text-sm">{selectedActivity.details}</p>
                  </div>
                )}
                
                <div className="tactical-button w-full text-center py-2 cursor-pointer">
                  ACKNOWLEDGE MISSION REPORT
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default K9CompanionLogs;