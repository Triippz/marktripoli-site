import React from 'react';
import { CareerMapData } from '../../../types/careerData';

interface MissionLegendProps {
  careerData: CareerMapData;
  className?: string;
}

const MissionLegend: React.FC<MissionLegendProps> = ({ careerData, className = "" }) => {
  return (
    <div className={`bg-gray-900/90 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm ${className}`}>
      <div className="text-green-500 text-xs font-mono mb-2">
        MISSION LEGEND
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
    </div>
  );
};

export default MissionLegend;