import { motion } from 'framer-motion';
import type { UserRank } from '../../types/mission';

interface MissionHUDProps {
  userRank: UserRank;
}

export default function MissionHUD({ userRank }: MissionHUDProps) {
  return (
    <motion.div 
      className="floating-card-glow p-4 max-w-sm"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="holo-text text-sm font-mono mb-3 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
        MISSION CONTROL HUD
      </div>
      <div className="text-white text-xs font-mono space-y-2">
        <div className="flex justify-between">
          <span>RANK:</span>
          <span className="text-green-400">{userRank.badge} {userRank.title}</span>
        </div>
      </div>
    </motion.div>
  );
}