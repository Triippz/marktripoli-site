import { motion } from 'framer-motion';
import type { SiteData } from '../../types/mission.js';

interface MissionPinProps {
  site: SiteData;
  position: { x: number; y: number };
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function MissionPin({ 
  site, 
  position, 
  isSelected, 
  isHovered, 
  onClick, 
  onHover, 
  onLeave 
}: MissionPinProps) {
  
  // Different colors and animations based on site type
  const getTypeStyle = () => {
    switch (site.type) {
      case 'job':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-500',
          icon: '🎯'
        };
      case 'hobby':
        return {
          color: 'text-blue-400',
          bgColor: 'bg-blue-400',
          icon: site.icon || '🎮'
        };
      case 'project':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400',
          icon: '📡'
        };
      default:
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-500',
          icon: '📍'
        };
    }
  };

  const typeStyle = getTypeStyle();

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isSelected ? 1.3 : 1,
        opacity: 1 
      }}
      whileHover={{ scale: 1.1 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Pulsing outer ring */}
      <motion.div
        className={`absolute inset-0 rounded-full ${typeStyle.bgColor} opacity-30`}
        animate={isSelected || isHovered ? {
          scale: [1, 1.8, 1],
          opacity: [0.3, 0, 0.3]
        } : {
          scale: [1, 1.4, 1],
          opacity: [0.2, 0, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut"
        }}
        style={{
          width: '40px',
          height: '40px',
          marginLeft: '-20px',
          marginTop: '-20px'
        }}
      />

      {/* Main pin */}
      <div className={`
        relative w-8 h-8 rounded-full border-2 border-current ${typeStyle.color}
        flex items-center justify-center text-xs
        bg-black shadow-lg
        ${isSelected ? 'shadow-lg shadow-green-500/50' : ''}
      `}>
        <span className="text-sm">{typeStyle.icon}</span>
      </div>

      {/* Codename tooltip */}
      {isHovered && (
        <motion.div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-gray-900 border border-green-500/30 rounded px-3 py-2 text-xs whitespace-nowrap">
            <div className={`font-mono ${typeStyle.color} font-bold`}>
              {site.codename || site.name}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {site.type.toUpperCase()} • CLICK TO ENGAGE
            </div>
          </div>
        </motion.div>
      )}

      {/* Connection line to center when selected */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.3, scale: 1 }}
          className="absolute top-1/2 left-1/2"
          style={{
            width: '2px',
            height: '200px',
            background: `linear-gradient(to bottom, ${typeStyle.bgColor}, transparent)`,
            transformOrigin: 'top center',
            transform: 'translate(-50%, -50%) rotate(45deg)'
          }}
        />
      )}
    </motion.div>
  );
}

export default MissionPin;