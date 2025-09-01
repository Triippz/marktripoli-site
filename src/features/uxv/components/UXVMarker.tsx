import React, { useState, useEffect } from 'react';
import { UXVPosition } from '../types';

interface UXVMarkerProps {
  map: mapboxgl.Map;
  pos: UXVPosition;
  target: UXVPosition | null;
  onClick: () => void;
}

const UXVMarker: React.FC<UXVMarkerProps> = ({ map, pos, target, onClick }) => {
  const [screenPos, setScreenPos] = useState<{ x: number; y: number } | null>(null);

  const angle = React.useMemo(() => {
    if (!target) return 0;
    const dLng = target.lng - pos.lng;
    const dLat = target.lat - pos.lat;
    return Math.atan2(dLat, dLng) * 180 / Math.PI; // degrees
  }, [pos, target]);

  useEffect(() => {
    const updatePosition = () => {
      const p = map.project(pos as any);
      setScreenPos({ x: p.x, y: p.y });
    };

    updatePosition();
    map.on('move', updatePosition);
    map.on('zoom', updatePosition);

    return () => {
      try {
        map.off('move', updatePosition);
        map.off('zoom', updatePosition);
      } catch {}
    };
  }, [map, pos]);

  if (!screenPos) return null;

  return (
    <div 
      className="absolute z-[120]" 
      style={{ 
        left: screenPos.x - 16, 
        top: screenPos.y - 16 
      }}
    >
      <button 
        title="UXV" 
        onClick={onClick} 
        style={{ transform: `rotate(${angle}deg)` }} 
        className="block"
      >
        <img 
          src="/icons/drone.svg" 
          alt="UXV" 
          width="32" 
          height="32" 
          className="drop-shadow-[0_0_8px_rgba(69,255,176,0.6)] opacity-90 hover:opacity-100" 
        />
      </button>
    </div>
  );
};

export default UXVMarker;