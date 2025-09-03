import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CareerMarker } from '../../../features/career/types';
import { useResponsive } from '../../../hooks/useResponsive';

interface CareerDataDisplayProps {
  markerCount: number;
  selectedMarker: CareerMarker | null;
  onResetView: () => void;
}

const CareerDataDisplay: React.FC<CareerDataDisplayProps> = ({
  markerCount,
  selectedMarker,
  onResetView
}) => {
  const { isMobile } = useResponsive();
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  return (
    <motion.div 
      className="absolute bottom-4 left-4"
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
      <div className="bg-gray-900/90 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="text-green-500 text-xs font-mono">
            CAREER TACTICAL DISPLAY
          </div>
          <div className="text-green-500/50 text-xs select-none" title="Drag to move">
            ⋮⋮
          </div>
        </div>
        <div className="text-white text-xs font-mono space-y-1">
          <div>MARKERS: {markerCount}</div>
          <div>STATUS: <span className="text-green-500">OPERATIONAL</span></div>
          <div>SOURCE: <span className="text-green-500">RESUME.JSON</span></div>
          {selectedMarker && (
            <div>TARGET: <span className="text-green-500">{selectedMarker.codename}</span></div>
          )}
        </div>
        <button
          onClick={onResetView}
          className="mt-2 bg-gray-800 border border-green-500/50 text-green-500 px-2 py-1 rounded text-xs font-mono hover:bg-green-500/10 transition-colors"
        >
          RESET VIEW
        </button>
      </div>
    </motion.div>
  );
};

export default React.memo(CareerDataDisplay);
