import React from 'react';
import { CareerMarker } from '../../../features/career/types';

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
  return (
    <div className="absolute bottom-4 left-4">
      <div className="bg-gray-900/90 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm">
        <div className="text-green-500 text-xs font-mono mb-2">
          CAREER TACTICAL DISPLAY
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
    </div>
  );
};

export default React.memo(CareerDataDisplay);
