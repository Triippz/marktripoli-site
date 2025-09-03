import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionControl } from '../../store/missionControl';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  xp: number;
  condition: (state: any) => boolean;
  hidden?: boolean;
  unlocked?: boolean;
}

const achievements: Achievement[] = [
  {
    id: 'first_contact',
    title: 'First Contact',
    description: 'Engage your first mission target',
    icon: '🎯',
    rarity: 'common',
    xp: 100,
    condition: (state) => state.visitedSites.length >= 1
  },
  {
    id: 'intelligence_analyst',
    title: 'Intelligence Analyst',
    description: 'Access 3 different mission dossiers',
    icon: '🕵️',
    rarity: 'common',
    xp: 200,
    condition: (state) => state.visitedSites.length >= 3
  },
  {
    id: 'operations_specialist',
    title: 'Operations Specialist',
    description: 'Complete reconnaissance of 5 targets',
    icon: '⚙️',
    rarity: 'uncommon',
    xp: 400,
    condition: (state) => state.visitedSites.length >= 5
  },
  {
    id: 'terminal_expert',
    title: 'Terminal Expert',
    description: 'Execute 20 terminal commands',
    icon: '💻',
    rarity: 'uncommon',
    xp: 300,
    condition: (state) => state.commandHistory.length >= 20
  },
  {
    id: 'briefing_accessed',
    title: 'Executive Access',
    description: 'Access the classified executive briefing',
    icon: '📋',
    rarity: 'rare',
    xp: 500,
    condition: (state) => state.unlockedEasterEggs.includes('executive_briefing')
  },
  {
    id: 'sound_engineer',
    title: 'Sound Engineer',
    description: 'Activate tactical audio systems',
    icon: '🔊',
    rarity: 'common',
    xp: 150,
    condition: (state) => state.soundEnabled
  },
  {
    id: 'cartographer',
    title: 'Tactical Cartographer',
    description: 'Explore all map regions and career sites',
    icon: '🗺️',
    rarity: 'rare',
    xp: 750,
    condition: (state) => state.visitedSites.length >= 8
  },
  {
    id: 'code_breaker',
    title: 'Code Breaker',
    description: 'Discover hidden terminal commands',
    icon: '🔓',
    rarity: 'legendary',
    xp: 1000,
    condition: (state) => state.unlockedEasterEggs.includes('hidden_commands'),
    hidden: true
  },
  {
    id: 'mission_commander',
    title: 'Mission Commander',
    description: 'Achieve maximum operational rank',
    icon: '⭐',
    rarity: 'legendary',
    xp: 1500,
    condition: (state) => state.userRank.level >= 3
  },
  {
    id: 'easter_hunter',
    title: 'Easter Egg Hunter',
    description: 'Uncover multiple hidden features',
    icon: '🥚',
    rarity: 'rare',
    xp: 600,
    condition: (state) => state.unlockedEasterEggs.length >= 3
  }
];

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-500';
      case 'uncommon': return 'text-green-400 border-green-500';
      case 'rare': return 'text-blue-400 border-blue-500';
      case 'legendary': return 'text-yellow-400 border-yellow-500';
    }
  };

  const getRarityGlow = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-500/50';
      case 'uncommon': return 'shadow-green-500/50';
      case 'rare': return 'shadow-blue-500/50';
      case 'legendary': return 'shadow-yellow-500/50';
    }
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 300, opacity: 0, scale: 0.8 }}
      className={`fixed top-20 right-4 z-50 tactical-panel p-4 min-w-80 ${getRarityColor(achievement.rarity)} shadow-2xl ${getRarityGlow(achievement.rarity)}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="holo-text text-sm font-mono">
          ACHIEVEMENT UNLOCKED
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Achievement Details */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="text-3xl">{achievement.icon}</div>
        <div>
          <h3 className="text-white font-bold text-sm">{achievement.title}</h3>
          <p className="text-gray-300 text-xs">{achievement.description}</p>
        </div>
      </div>

      {/* XP Award */}
      <div className="flex justify-between items-center">
        <div className={`text-xs font-mono uppercase ${getRarityColor(achievement.rarity).split(' ')[0]}`}>
          {achievement.rarity}
        </div>
        <div className="text-green-500 font-mono text-sm">
          +{achievement.xp} XP
        </div>
      </div>

      {/* Rarity indicator */}
      <div className="mt-2 h-1 bg-gray-800 rounded overflow-hidden">
        <motion.div 
          className={`h-full ${getRarityColor(achievement.rarity).split(' ')[0].replace('text-', 'bg-')}`}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
}

interface ProgressBarProps {
  current: number;
  max: number;
  label: string;
  color?: string;
}

function ProgressBar({ current, max, label, color = 'green' }: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-white text-xs font-mono">{label}</span>
        <span className="text-gray-400 text-xs font-mono">{current}/{max}</span>
      </div>
      <div className="tactical-progress">
        <motion.div 
          className="tactical-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  );
}

function AchievementSystem() {
  const missionState = useMissionControl();
  const [notifications, setNotifications] = useState<Achievement[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [userStats, setUserStats] = useState({
    totalXP: 0,
    unlockedAchievements: new Set<string>()
  });

  // Check for newly unlocked achievements
  useEffect(() => {
    const newlyUnlocked: Achievement[] = [];
    
    achievements.forEach(achievement => {
      const isUnlocked = achievement.condition(missionState);
      const wasUnlocked = userStats.unlockedAchievements.has(achievement.id);
      
      if (isUnlocked && !wasUnlocked) {
        newlyUnlocked.push(achievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      // Update user stats
      const newUnlocked = new Set(userStats.unlockedAchievements);
      let newXP = userStats.totalXP;
      
      newlyUnlocked.forEach(achievement => {
        newUnlocked.add(achievement.id);
        newXP += achievement.xp;
      });

      setUserStats({
        totalXP: newXP,
        unlockedAchievements: newUnlocked
      });

      // Show notifications
      setNotifications(prev => [...prev, ...newlyUnlocked]);

      // Store in localStorage
      localStorage.setItem('mc-achievements', JSON.stringify(Array.from(newUnlocked)));
      localStorage.setItem('mc-xp', newXP.toString());
    }
  }, [missionState, userStats]);

  // Load achievements from localStorage on mount
  useEffect(() => {
    const savedAchievements = JSON.parse(localStorage.getItem('mc-achievements') || '[]');
    const savedXP = parseInt(localStorage.getItem('mc-xp') || '0');
    
    setUserStats({
      totalXP: savedXP,
      unlockedAchievements: new Set(savedAchievements)
    });
  }, []);

  const removeNotification = (achievementId: string) => {
    setNotifications(prev => prev.filter(a => a.id !== achievementId));
  };

  const unlockedCount = userStats.unlockedAchievements.size;
  const totalCount = achievements.filter(a => !a.hidden).length;
  const nextLevel = Math.floor(userStats.totalXP / 1000) + 1;
  const currentLevelXP = userStats.totalXP % 1000;

  return (
    <>
      {/* Achievement Notifications */}
      <AnimatePresence>
        {notifications.map((achievement, index) => (
          <AchievementNotification
            key={`${achievement.id}-${index}`}
            achievement={achievement}
            onClose={() => removeNotification(achievement.id)}
          />
        ))}
      </AnimatePresence>

      {/* Achievement Panel Toggle */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-4 right-4 tactical-button p-3 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <span>🏆</span>
          <span className="text-xs">
            {unlockedCount}/{totalCount}
          </span>
        </div>
      </motion.button>

      {/* Achievement Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-4 bottom-20 z-50 w-80 max-h-96 overflow-y-auto"
          >
            <div className="tactical-panel p-4">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="holo-text text-lg font-mono">
                  MISSION PROGRESS
                </div>
                <button 
                  onClick={() => setShowPanel(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              {/* User Stats */}
              <div className="mb-4 p-3 bg-gray-900/50 rounded border border-green-500/30">
                <div className="text-center mb-2">
                  <div className="text-2xl text-green-500 font-mono">{userStats.totalXP}</div>
                  <div className="text-xs text-gray-400">TOTAL EXPERIENCE</div>
                </div>
                <ProgressBar
                  current={currentLevelXP}
                  max={1000}
                  label={`LEVEL ${nextLevel - 1} PROGRESS`}
                />
              </div>

              {/* Achievement Progress */}
              <ProgressBar
                current={unlockedCount}
                max={totalCount}
                label="ACHIEVEMENTS"
              />

              {/* Achievement List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {achievements
                  .filter(a => !a.hidden || userStats.unlockedAchievements.has(a.id))
                  .map(achievement => {
                    const isUnlocked = userStats.unlockedAchievements.has(achievement.id);
                    const rarityColor = achievement.rarity === 'common' ? 'text-gray-400' :
                                     achievement.rarity === 'uncommon' ? 'text-green-400' :
                                     achievement.rarity === 'rare' ? 'text-blue-400' : 'text-yellow-400';
                    
                    return (
                      <div 
                        key={achievement.id}
                        className={`p-2 rounded border ${isUnlocked 
                          ? 'border-green-500/30 bg-green-500/10' 
                          : 'border-gray-700 bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={isUnlocked ? 'text-2xl' : 'text-xl opacity-50'}>
                            {achievement.icon}
                          </span>
                          <div className="flex-1">
                            <div className={`text-sm font-mono ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                              {achievement.title}
                            </div>
                            <div className={`text-xs ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                              {achievement.description}
                            </div>
                          </div>
                          <div className={`text-xs font-mono ${rarityColor}`}>
                            +{achievement.xp}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AchievementSystem;