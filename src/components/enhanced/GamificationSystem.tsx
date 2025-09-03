import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionControl } from '../../store/missionControl';
import { feedbackSystem } from '../../utils/feedbackSystem';

// Achievement system for Mission Control
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: any) => boolean;
  reward: {
    xp: number;
    badge?: string;
    unlocks?: string[];
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

const achievements: Achievement[] = [
  {
    id: 'first_contact',
    name: 'First Contact',
    description: 'Access your first mission dossier',
    icon: '🎯',
    condition: (state) => state.visitedSites.length >= 1,
    reward: { xp: 100, badge: 'Rookie' },
    rarity: 'common'
  },
  {
    id: 'intelligence_officer',
    name: 'Intelligence Officer',
    description: 'Review deployment logs from 3 different operations',
    icon: '📊',
    condition: (state) => state.visitedSites.length >= 3,
    reward: { xp: 250, badge: 'Analyst', unlocks: ['tactical_overlay'] },
    rarity: 'uncommon'
  },
  {
    id: 'mission_commander',
    name: 'Mission Commander',
    description: 'Complete reconnaissance of all primary targets',
    icon: '⭐',
    condition: (state) => state.visitedSites.length >= 6,
    reward: { xp: 500, badge: 'Commander', unlocks: ['classified_intel'] },
    rarity: 'rare'
  },
  {
    id: 'terminal_master',
    name: 'Terminal Master',
    description: 'Execute 25 terminal commands successfully',
    icon: '💻',
    condition: (state) => state.commandHistory.length >= 25,
    reward: { xp: 300, unlocks: ['advanced_commands'] },
    rarity: 'uncommon'
  },
  {
    id: 'easter_egg_hunter',
    name: 'Easter Egg Hunter',
    description: 'Discover hidden intelligence packets',
    icon: '🥚',
    condition: (state) => state.unlockedEasterEggs.length >= 3,
    reward: { xp: 750, badge: 'Crypto-Analyst', unlocks: ['secret_dossier'] },
    rarity: 'legendary'
  },
  {
    id: 'night_ops',
    name: 'Night Operations',
    description: 'Access the system between 10 PM and 6 AM',
    icon: '🌙',
    condition: () => {
      const hour = new Date().getHours();
      return hour >= 22 || hour <= 6;
    },
    reward: { xp: 150, unlocks: ['night_vision_mode'] },
    rarity: 'uncommon'
  },
  {
    id: 'speed_demon',
    name: 'Lightning Operations',
    description: 'Access 3 dossiers within 60 seconds',
    icon: '⚡',
    condition: () => false, // Requires time tracking
    reward: { xp: 400, badge: 'Rapid Response' },
    rarity: 'rare'
  },
  {
    id: 'audio_commander',
    name: 'Audio Commander',
    description: 'Enable tactical audio for enhanced operations',
    icon: '🔊',
    condition: (state) => state.soundEnabled,
    reward: { xp: 100, unlocks: ['enhanced_audio'] },
    rarity: 'common'
  }
];

// XP and progression system
interface ProgressionState {
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  achievements: string[];
  unlockedFeatures: string[];
}

const calculateLevel = (totalXp: number): { level: number; xpToNext: number } => {
  // Level progression: 100, 250, 500, 1000, 1500, 2500, etc.
  let level = 1;
  let xpRequired = 100;
  let totalRequired = 0;
  
  while (totalXp >= totalRequired + xpRequired) {
    totalRequired += xpRequired;
    level++;
    xpRequired = Math.floor(xpRequired * 1.5);
  }
  
  return {
    level,
    xpToNext: (totalRequired + xpRequired) - totalXp
  };
};

// Achievement notification component
interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const rarityColors = {
    common: 'border-green-500 bg-green-500/20 text-green-400',
    uncommon: 'border-blue-500 bg-blue-500/20 text-blue-400',
    rare: 'border-purple-500 bg-purple-500/20 text-purple-400',
    legendary: 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
  };

  useEffect(() => {
    feedbackSystem.trigger('mission_complete');
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className={`
        fixed top-24 right-4 z-50 p-4 rounded-lg border-2 font-mono
        min-w-80 max-w-sm backdrop-blur-sm
        ${rarityColors[achievement.rarity]}
      `}
      initial={{ x: 400, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.8 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 25 
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{achievement.icon}</div>
        <div className="flex-1">
          <div className="text-sm font-bold tracking-wider mb-1">
            ACHIEVEMENT UNLOCKED
          </div>
          <div className="text-base font-bold mb-1">
            {achievement.name}
          </div>
          <div className="text-xs opacity-80 mb-2">
            {achievement.description}
          </div>
          <div className="text-xs">
            +{achievement.reward.xp} XP
            {achievement.reward.badge && ` • Badge: ${achievement.reward.badge}`}
            {achievement.reward.unlocks && ` • Unlocked: ${achievement.reward.unlocks.length} feature(s)`}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>

      {/* Rarity indicator */}
      <motion.div
        className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-current"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: achievement.rarity === 'legendary' ? 0.5 : 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
}

// Progress bar component
function ProgressBar({ current, max, className = '' }: { 
  current: number; 
  max: number; 
  className?: string;
}) {
  const percentage = Math.min((current / max) * 100, 100);
  
  return (
    <div className={`bg-gray-800 h-2 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-green-400 to-green-600"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

// Main gamification overlay component
export default function GamificationSystem() {
  const missionState = useMissionControl();
  const [progression, setProgression] = useState<ProgressionState>(() => {
    const saved = localStorage.getItem('mc-progression');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      level: 1,
      xp: 0,
      xpToNext: 100,
      totalXp: 0,
      achievements: [],
      unlockedFeatures: []
    };
  });
  
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showProgressPanel, setShowProgressPanel] = useState(false);

  // Check for new achievements
  useEffect(() => {
    achievements.forEach(achievement => {
      if (
        !progression.achievements.includes(achievement.id) &&
        achievement.condition(missionState)
      ) {
        // Award achievement
        const newProgression = {
          ...progression,
          totalXp: progression.totalXp + achievement.reward.xp,
          achievements: [...progression.achievements, achievement.id],
          unlockedFeatures: [
            ...progression.unlockedFeatures,
            ...(achievement.reward.unlocks || [])
          ]
        };

        const levelData = calculateLevel(newProgression.totalXp);
        newProgression.level = levelData.level;
        newProgression.xpToNext = levelData.xpToNext;
        newProgression.xp = newProgression.totalXp - (newProgression.totalXp - levelData.xpToNext);

        setProgression(newProgression);
        localStorage.setItem('mc-progression', JSON.stringify(newProgression));
        setNewAchievement(achievement);
      }
    });
  }, [missionState, progression]);

  return (
    <>
      {/* Progress Panel Toggle */}
      <motion.button
        className="fixed bottom-4 right-4 z-40 bg-gray-900 border border-green-500/30 rounded-lg p-2 hover:bg-gray-800 transition-colors"
        onClick={() => setShowProgressPanel(!showProgressPanel)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="text-green-500 font-mono text-xs">
          LEVEL {progression.level}
        </div>
        <div className="text-white font-mono text-xs">
          {progression.xp}/{progression.xp + progression.xpToNext} XP
        </div>
      </motion.button>

      {/* Progress Panel */}
      <AnimatePresence>
        {showProgressPanel && (
          <motion.div
            className="fixed bottom-16 right-4 z-40 bg-gray-900/95 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-80 font-mono">
              <div className="text-green-500 text-sm font-bold mb-3">
                MISSION PROGRESS
              </div>
              
              {/* Level and XP */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white">Level {progression.level}</span>
                  <span className="text-green-400">
                    {progression.xp}/{progression.xp + progression.xpToNext} XP
                  </span>
                </div>
                <ProgressBar 
                  current={progression.xp} 
                  max={progression.xp + progression.xpToNext} 
                />
              </div>

              {/* Achievements */}
              <div className="space-y-2">
                <div className="text-green-500 text-xs font-bold">
                  ACHIEVEMENTS ({progression.achievements.length}/{achievements.length})
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {achievements.map(achievement => {
                    const isUnlocked = progression.achievements.includes(achievement.id);
                    return (
                      <div
                        key={achievement.id}
                        className={`
                          text-xs p-2 rounded border
                          ${isUnlocked 
                            ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                            : 'border-gray-600 bg-gray-800/50 text-gray-500'
                          }
                        `}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span>{achievement.icon}</span>
                          <span className="font-bold truncate">
                            {achievement.name}
                          </span>
                        </div>
                        <div className="text-xs opacity-80">
                          {achievement.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unlocked Features */}
              {progression.unlockedFeatures.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-green-500 text-xs font-bold">
                    UNLOCKED FEATURES
                  </div>
                  <div className="text-xs space-y-1">
                    {progression.unlockedFeatures.map((feature, index) => (
                      <div key={index} className="text-green-400">
                        • {feature.replace(/_/g, ' ').toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {newAchievement && (
          <AchievementNotification
            achievement={newAchievement}
            onClose={() => setNewAchievement(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}