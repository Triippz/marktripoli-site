import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

interface MissionLegendProps {
  className?: string;
}

export default function MissionLegend({ className = '' }: MissionLegendProps) {
  const { isMobile } = useResponsive();
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  return (
    <motion.div 
      className={`bg-gray-900/90 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm ${className}`}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{
        top: isMobile ? -window.innerHeight + 200 : -window.innerHeight + 150,
        left: -window.innerWidth + 100,
        right: isMobile ? 0 : window.innerWidth - 300,
        bottom: isMobile ? 80 : 0
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
        <div className="text-green-500 text-xs font-mono">MISSION LEGEND</div>
        <div className="flex items-center gap-2">
          <div className="text-green-500/50 text-xs select-none" title="Drag to move">
            ⋮⋮
          </div>
          <button
            onClick={() => {
              setDragPosition({ x: 0, y: 0 });
            }}
            className="border border-blue-500/30 text-blue-300 hover:text-blue-200 hover:border-blue-400/50 rounded px-2 py-0.5 font-mono text-[10px] uppercase"
            title="Reset position"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="space-y-2 text-xs font-mono text-white">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(0,255,0,0.6)]" />
          <span>Job</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
          <span>Project</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
          <span>Hobby</span>
        </div>
      </div>
    </motion.div>
  );
}

