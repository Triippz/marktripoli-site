import React from 'react';
import { motion } from 'framer-motion';
import { useMapbox } from '../../../hooks/map/useMapbox';

interface MapContainerProps {
  onMapLoad?: (map: mapboxgl.Map) => void;
  onMapMove?: (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => void;
  onMapClick?: (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => void;
  onMapContextMenu?: (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => void;
  style?: string;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  className?: string;
}

const MapContainer: React.FC<MapContainerProps> = ({
  onMapLoad,
  onMapMove,
  onMapClick,
  onMapContextMenu,
  style,
  center,
  zoom,
  pitch,
  bearing,
  className = "w-full h-full cursor-none"
}) => {
  const { map, mapContainer, isLoaded, error } = useMapbox({
    style,
    center,
    zoom,
    pitch,
    bearing
  });

  // Set up event listeners when map is loaded
  React.useEffect(() => {
    if (!map || !isLoaded) return;

    // Notify parent that map is ready
    if (onMapLoad) {
      onMapLoad(map);
    }

    // Set up event handlers
    if (onMapMove) {
      map.on('mousemove', onMapMove);
    }

    if (onMapClick) {
      map.on('click', onMapClick);
    }

    if (onMapContextMenu) {
      map.on('contextmenu', onMapContextMenu);
    }

    return () => {
      try {
        if (onMapMove) map.off('mousemove', onMapMove);
        if (onMapClick) map.off('click', onMapClick);
        if (onMapContextMenu) map.off('contextmenu', onMapContextMenu);
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [map, isLoaded, onMapLoad, onMapMove, onMapClick, onMapContextMenu]);

  return (
    <>
      {/* Mapbox container */}
      <div ref={mapContainer} className={className} />

      {/* Loading overlay */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-green-500 font-mono text-sm">INITIALIZING TACTICAL DISPLAY...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 font-mono text-sm mb-2">MAP INITIALIZATION FAILED</div>
            <div className="text-red-400 font-mono text-xs">{error.message}</div>
          </div>
        </div>
      )}

      {/* Tactical scanning overlay */}
      {isLoaded && (
        <motion.div
          className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30 pointer-events-none"
          animate={{ y: [0, 800] }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 2
          }}
        />
      )}
    </>
  );
};

export default React.memo(MapContainer);
