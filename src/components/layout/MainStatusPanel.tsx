import { motion } from 'framer-motion';
import { SkipTarget } from '../SkipNavigation';
import MissionStatusCard from '../hud/MissionStatusCard';

interface MainStatusPanelProps {
  showStatusPanel: boolean;
}

export default function MainStatusPanel({ showStatusPanel }: MainStatusPanelProps) {
  return (
    <SkipTarget id="main-content" className={`pt-32 h-full w-full relative z-10 ${!showStatusPanel ? 'pointer-events-none' : ''}`}>
      <main role="main" aria-label="Mission Control tactical interface" className={!showStatusPanel ? 'pointer-events-none' : ''}>
        {showStatusPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ delay: 1, duration: 1 }}
            className="h-full flex items-center justify-center"
          >
            <MissionStatusCard showStatusPanel={showStatusPanel} />
          </motion.div>
        )}
      </main>
    </SkipTarget>
  );
}

