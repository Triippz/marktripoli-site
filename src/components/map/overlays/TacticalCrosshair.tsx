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
      
    </div>
  );
};

export default React.memo(TacticalCrosshair);
