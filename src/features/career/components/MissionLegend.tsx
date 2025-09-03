import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CareerMapData } from '../../../types/careerData';
import { useResponsive } from '../../../hooks/useResponsive';

interface MissionLegendProps {
  careerData: CareerMapData;
  className?: string;
}

const MissionLegend: React.FC<MissionLegendProps> = ({ careerData, className = "" }) => {
  const { isMobile } = useResponsive();
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  return (
    <motion.div 
      className={`bg-gray-900/90 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm ${className}`}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{
        top: -200,
        left: -window.innerWidth + 100,
        right: window.innerWidth - 200,
        bottom: window.innerHeight - 200
      }}
      onDragEnd={(e, info) => {
        setDragPosition({ x: info.offset.x, y: info.offset.y });
      }}
      style={{ 
        x: dragPosition.x,
        y: dragPosition.y,
        cursor: 'move'
      }}
      whileDrag={{ scale: 1.02, opacity: 0.9 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-green-500 text-xs font-mono">
          MISSION LEGEND
        </div>
        <div className="text-green-500/50 text-xs select-none" title="Drag to move">
          ⋮⋮
        </div>
      </div>
      <div className="space-y-2">
        {Object.entries(careerData.categories).map(([type, config]) => {
          const markersOfType = careerData.markers.filter(m => m.type === type);
          if (markersOfType.length === 0) return null;
          
          return (
            <div key={type} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border"
                style={{
                  backgroundColor: config.color,
                  borderColor: config.color,
                  boxShadow: `0 0 8px ${config.color}80`
                }}
              />
              <span className="text-white text-xs font-mono">
                {config.icon} {config.label} ({markersOfType.length})
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MissionLegend;