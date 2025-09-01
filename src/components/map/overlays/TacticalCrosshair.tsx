import React from 'react';

interface TacticalCrosshairProps {
  cursorPoint: { x: number; y: number } | null;
  currentCoords: { lat: number; lng: number };
  containerDimensions: { width: number; height: number };
}

const TacticalCrosshair: React.FC<TacticalCrosshairProps> = ({
  cursorPoint,
  currentCoords,
  containerDimensions
}) => {
  if (!cursorPoint) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Vertical line */}
      <div
        className="absolute bg-green-500/30"
        style={{ 
          left: `${cursorPoint.x}px`, 
          top: 0, 
          width: '1px', 
          height: '100%' 
        }}
      />
      
      {/* Horizontal line */}
      <div
        className="absolute bg-green-500/30"
        style={{ 
          top: `${cursorPoint.y}px`, 
          left: 0, 
          height: '1px', 
          width: '100%' 
        }}
      />
      
      {/* Cursor square */}
      <div
        className="absolute border border-green-500/70 bg-green-500/5 shadow-[0_0_10px_rgba(0,255,0,0.4)]"
        style={{
          left: `${Math.max(0, Math.min(containerDimensions.width, cursorPoint.x)) - 6}px`,
          top: `${Math.max(0, Math.min(containerDimensions.height, cursorPoint.y)) - 6}px`,
          width: '12px',
          height: '12px'
        }}
      />
      
      {/* Coordinates box */}
      {(() => {
        const offset = 14;
        const boxWidth = 170;
        const boxHeight = 44;
        const left = Math.min(cursorPoint.x + offset, containerDimensions.width - boxWidth - 6);
        const top = Math.min(cursorPoint.y + offset, containerDimensions.height - boxHeight - 6);
        
        return (
          <div
            className="absolute bg-gray-900/90 border border-green-500/30 rounded p-2 backdrop-blur-sm"
            style={{ 
              left: `${Math.max(6, left)}px`, 
              top: `${Math.max(6, top)}px`, 
              width: `${boxWidth}px` 
            }}
          >
            <div className="text-green-500 text-[10px] font-mono mb-1">COORDINATES</div>
            <div className="text-white text-[10px] font-mono">LAT: {currentCoords.lat}°</div>
            <div className="text-white text-[10px] font-mono">LNG: {currentCoords.lng}°</div>
          </div>
        );
      })()}
    </div>
  );
};

export default React.memo(TacticalCrosshair);
