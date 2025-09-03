import React from 'react';

interface TacticalIndicatorsProps {
  zoomLevel?: number;
}

const TacticalIndicators: React.FC<TacticalIndicatorsProps> = ({ zoomLevel = 4 }) => {
  return (
    <>
      {/* Tactical status header */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2">
        <div className="bg-gray-900/90 border border-green-500/30 rounded p-2 backdrop-blur-sm">
          <div className="text-green-500 text-xs font-mono text-center">
            SATELLITE RECONNAISSANCE
          </div>
        </div>
      </div>


      {/* Zoom level indicator */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-gray-900/90 border border-green-500/30 rounded p-2 backdrop-blur-sm">
          <div className="text-green-500 text-xs font-mono">
            ZOOM: {zoomLevel.toFixed(1)}x
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(TacticalIndicators);
