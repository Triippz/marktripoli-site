import { motion } from 'framer-motion';
import ButtonGroup from '../hud/ButtonGroup';

interface TopRightButtonControlsProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  onContactClick: () => void;
}

export default function TopRightButtonControls({ soundEnabled, toggleSound, onContactClick }: TopRightButtonControlsProps) {
  return (
    <motion.div
      style={{
        position: 'fixed',
        top: '4rem',
        right: '1rem',
        zIndex: 50,
        pointerEvents: 'auto',
        width: 'auto',
        minWidth: 'fit-content'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <ButtonGroup 
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        onContactClick={onContactClick}
      />
    </motion.div>
  );
}

