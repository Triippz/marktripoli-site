import { motion } from 'framer-motion';
import MissionHUD from '../hud/MissionHUD';
import type { UserRank } from '../../types/mission';

interface HUDTopLeftStackProps {
  userRank: UserRank;
}

export default function HUDTopLeftStack({ userRank }: HUDTopLeftStackProps) {
  return (
    <div className="fixed top-4 left-4 z-50 pointer-events-auto">
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <MissionHUD userRank={userRank} />
      </motion.div>
    </div>
  );
}

