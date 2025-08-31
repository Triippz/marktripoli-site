import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// Enhanced animation variants for tactical interface

export const tacticalVariants: Record<string, Variants> = {
  // Enhanced mission pin engagement sequence
  missionPinEngage: {
    idle: {
      scale: 1,
      rotate: 0,
      boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)'
    },
    targeted: {
      scale: 1.2,
      rotate: [0, 2, -2, 0],
      boxShadow: '0 0 30px rgba(0, 255, 0, 0.8)',
      transition: {
        rotate: {
          duration: 0.3,
          times: [0, 0.33, 0.66, 1]
        }
      }
    },
    engaged: {
      scale: [1.2, 1.5, 1],
      rotate: [0, 180, 360],
      boxShadow: [
        '0 0 30px rgba(0, 255, 0, 0.8)',
        '0 0 50px rgba(0, 255, 0, 1)',
        '0 0 20px rgba(0, 255, 0, 0.6)'
      ],
      transition: {
        duration: 1,
        ease: 'easeOut'
      }
    }
  },

  // Terminal boot sequence with stagger
  terminalBoot: {
    hidden: { 
      opacity: 0, 
      y: 20,
      filter: 'blur(5px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  },

  // HUD panel slide-in effects
  hudPanel: {
    hidden: {
      x: -100,
      opacity: 0,
      rotateY: -90
    },
    visible: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  },

  // Tactical data scrolling
  dataScroll: {
    enter: {
      y: '100%',
      opacity: 0
    },
    center: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    },
    exit: {
      y: '-100%',
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: 'easeIn'
      }
    }
  },

  // Enhanced button press feedback
  tacticalButton: {
    idle: {
      scale: 1,
      boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)'
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 20px rgba(0, 255, 0, 0.6)',
      transition: { duration: 0.2 }
    },
    press: {
      scale: 0.95,
      boxShadow: '0 0 5px rgba(0, 255, 0, 0.8)',
      transition: { duration: 0.1 }
    }
  }
};

// Animated tactical divider component
export function TacticalDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-px my-4 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 w-2 h-2 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
    </div>
  );
}

// Enhanced loading spinner for tactical systems
export function TacticalSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 border-2 border-green-500/30 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {/* Inner spinning element */}
      <motion.div
        className="absolute inset-1 border-t-2 border-green-500 rounded-full"
        animate={{ rotate: -360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {/* Center dot */}
      <motion.div
        className="absolute inset-1/3 bg-green-500 rounded-full"
        animate={{ 
          scale: [1, 0.8, 1],
          opacity: [1, 0.6, 1] 
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
}

// Tactical alert overlay
interface TacticalAlertProps {
  children: ReactNode;
  level: 'info' | 'warning' | 'critical';
  isVisible: boolean;
  onClose?: () => void;
}

export function TacticalAlert({ children, level, isVisible, onClose }: TacticalAlertProps) {
  const colors = {
    info: 'border-blue-500 bg-blue-500/10 text-blue-400',
    warning: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
    critical: 'border-red-500 bg-red-500/10 text-red-400'
  };

  return (
    <motion.div
      className={`
        fixed top-4 right-4 z-50 p-4 rounded border-2 font-mono
        ${colors[level]}
      `}
      initial={{ x: 400, opacity: 0 }}
      animate={isVisible ? { x: 0, opacity: 1 } : { x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="text-xs font-bold tracking-wider">
            SYSTEM ALERT - {level.toUpperCase()}
          </div>
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-white/60 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Alert indicator */}
      <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-current"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: level === 'critical' ? 0.5 : 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
}

// Radar sweep overlay component
export function RadarSweepOverlay({ 
  className = '',
  duration = 8,
  opacity = 0.3 
}: { 
  className?: string;
  duration?: number;
  opacity?: number;
}) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 -mt-48 -ml-48"
        animate={{ rotate: 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 2
        }}
        style={{ opacity }}
      >
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent transform origin-left"></div>
      </motion.div>
    </div>
  );
}

// Typewriter effect with enhanced cursor
interface TacticalTypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export function TacticalTypewriter({ 
  text, 
  speed = 50, 
  delay = 0, 
  className = '',
  onComplete 
}: TacticalTypewriterProps) {
  return (
    <motion.div
      className={`font-mono ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.span
        initial={{ width: 0 }}
        animate={{ width: 'auto' }}
        transition={{
          duration: text.length * (speed / 1000),
          ease: 'linear',
          delay
        }}
        onAnimationComplete={onComplete}
        className="inline-block overflow-hidden whitespace-nowrap"
      >
        {text}
      </motion.span>
      <motion.span
        className="inline-block w-2 h-5 bg-green-500 ml-1"
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
}