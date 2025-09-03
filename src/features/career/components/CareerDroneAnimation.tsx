import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CareerMarker, CareerMapData } from '../../../types/careerData';
import { missionAudio } from '../../../utils/audioSystem';

interface DronePath {
  from: CareerMarker;
  to: CareerMarker;
  duration: number;
  delay: number;
}

interface CareerDroneAnimationProps {
  map: mapboxgl.Map;
  careerData: CareerMapData;
  containerDimensions: { width: number; height: number };
}

const CareerDroneAnimation: React.FC<CareerDroneAnimationProps> = ({
  map,
  careerData,
  containerDimensions
}) => {
  const [activePaths, setActivePaths] = useState<DronePath[]>([]);
  const [showCareerTour, setShowCareerTour] = useState(false);
  const [currentDronePosition, setCurrentDronePosition] = useState<{ x: number; y: number } | null>(null);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [droneRotation, setDroneRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Convert lat/lng to screen coordinates using map projection
  const projectToScreen = useCallback((lat: number, lng: number) => {
    if (!map) return { x: 0, y: 0 };
    const projected = map.project([lng, lat]);
    return { 
      x: Math.min(containerDimensions.width - 50, Math.max(50, projected.x)), 
      y: Math.min(containerDimensions.height - 50, Math.max(50, projected.y)) 
    };
  }, [map, containerDimensions]);

  // Generate drone paths for career progression (chronological order)
  const generateCareerPaths = useCallback(() => {
    if (!careerData?.markers) return [];

    // Sort markers by start date (chronological career progression)
    const jobMarkers = careerData.markers
      .filter(marker => marker.type === 'job')
      .sort((a, b) => {
        const dateA = new Date(a.startDate || '1900-01-01').getTime();
        const dateB = new Date(b.startDate || '1900-01-01').getTime();
        return dateA - dateB;
      });

    const paths: DronePath[] = [];
    
    for (let i = 0; i < jobMarkers.length - 1; i++) {
      paths.push({
        from: jobMarkers[i],
        to: jobMarkers[i + 1],
        duration: 4000, // 4 seconds per hop
        delay: i * 4500 // Small gap between hops
      });
    }

    return paths;
  }, [careerData]);

  // Start career tour animation
  const startCareerTour = useCallback(() => {
    console.log('[CareerDrone] Starting tour, isAnimating:', isAnimating);
    if (isAnimating) return;
    
    const paths = generateCareerPaths();
    console.log('[CareerDrone] Generated paths:', paths.length, paths);
    if (paths.length === 0) return;

    // Fly to first job location when starting tour
    if (map && paths.length > 0) {
      const firstJob = paths[0].from;
      console.log('[CareerDrone] Flying to first job:', firstJob.name, firstJob.location);
      map.flyTo({
        center: [firstJob.location.lng, firstJob.location.lat],
        zoom: 6,
        duration: 2000
      });
    }

    setActivePaths(paths);
    setShowCareerTour(true);
    setCurrentPathIndex(0);
    setIsAnimating(true);

    // Play launch sound
    try {
      missionAudio.notification();
    } catch (error) {
      console.warn('[CareerDrone] Audio failed:', error);
    }

    // Clear animation after completion
    const totalDuration = paths.length * 4500 + 2000; // Extra time for final hover
    setTimeout(() => {
      setActivePaths([]);
      setShowCareerTour(false);
      setCurrentDronePosition(null);
      setCurrentPathIndex(0);
      setIsAnimating(false);
    }, totalDuration);
  }, [generateCareerPaths, isAnimating, map]);

  // Auto-trigger career tour
  useEffect(() => {
    const timer = setTimeout(() => {
      startCareerTour();
    }, 15000); // Start after 15 seconds

    const interval = setInterval(() => {
      startCareerTour();
    }, 120000); // Repeat every 2 minutes

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [startCareerTour]);

  // Calculate drone rotation based on direction
  const calculateRotation = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
    return angle + 90; // Adjust so drone faces forward
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Drone Paths */}
      <AnimatePresence>
        {activePaths.map((path, index) => {
          const from = projectToScreen(path.from.location.lat, path.from.location.lng);
          const to = projectToScreen(path.to.location.lat, path.to.location.lng);
          
          const distance = Math.sqrt(
            Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
          );
          
          const pathRotation = calculateRotation(from, to);

          return (
            <React.Fragment key={`${index}-${path.delay}`}>
              {/* Glowing trail */}
              <motion.div
                className="absolute"
                style={{
                  left: from.x,
                  top: from.y,
                  width: distance,
                  height: 3,
                  transformOrigin: '0 50%',
                  transform: `rotate(${pathRotation - 90}deg)`,
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ 
                  scaleX: 1, 
                  opacity: [0, 0.8, 0.8, 0],
                }}
                transition={{
                  delay: path.delay / 1000,
                  duration: path.duration / 1000,
                  opacity: {
                    times: [0, 0.1, 0.8, 1],
                    duration: path.duration / 1000
                  }
                }}
              >
                <div className="w-full h-full bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60 shadow-[0_0_8px_rgba(0,255,0,0.6)]" />
              </motion.div>
              
              {/* Drone */}
              <motion.div
                className="absolute w-8 h-8 flex items-center justify-center z-60"
                style={{ left: from.x - 16, top: from.y - 16 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  x: to.x - from.x,
                  y: to.y - from.y,
                  scale: [0, 1, 1, 0.8],
                  opacity: [0, 1, 1, 1],
                  rotate: pathRotation
                }}
                transition={{
                  delay: path.delay / 1000,
                  duration: path.duration / 1000,
                  ease: "easeInOut",
                  scale: { times: [0, 0.1, 0.9, 1] }
                }}
                onAnimationStart={() => {
                  if (index === currentPathIndex) {
                    setCurrentDronePosition(from);
                    setDroneRotation(pathRotation);
                  }
                }}
                onAnimationComplete={() => {
                  if (index === currentPathIndex) {
                    setCurrentDronePosition(to);
                    setCurrentPathIndex(prev => prev + 1);
                  }
                }}
              >
                {/* Drone body */}
                <div className="relative">
                  {/* Main drone icon */}
                  <div className="text-2xl drop-shadow-[0_0_8px_rgba(69,255,176,0.8)]">
                    🚁
                  </div>
                  {/* Pulsing glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-green-400/20"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              {/* Transition info popup */}
              {index < activePaths.length && (
                <motion.div
                  className="absolute bg-gray-900/95 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm pointer-events-none"
                  style={{
                    left: Math.min(to.x + 20, containerDimensions.width - 250),
                    top: Math.max(to.y - 40, 20),
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: path.delay / 1000 + 1 }}
                >
                  <div className="text-green-400 text-xs font-mono mb-1">
                    CAREER TRANSITION
                  </div>
                  <div className="text-white text-xs font-mono">
                    {path.from.name} → {path.to.name}
                  </div>
                  <div className="text-gray-400 text-[10px] font-mono">
                    {path.to.startDate ? new Date(path.to.startDate).getFullYear() : ''}
                  </div>
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
      </AnimatePresence>

      {/* Career Tour Legend */}
      {showCareerTour && (
        <motion.div
          className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900/95 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="text-center">
            <div className="text-green-400 font-mono text-sm mb-2 flex items-center justify-center gap-2">
              <span>🚁</span>
              <span>CAREER DRONE TOUR</span>
            </div>
            <div className="text-gray-400 text-xs font-mono">
              Following chronological career progression
            </div>
            <motion.div
              className="mt-2 h-1 bg-green-500/30 rounded-full overflow-hidden"
              style={{ width: '200px' }}
            >
              <motion.div
                className="h-full bg-green-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: activePaths.length * 4.5, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Manual Career Tour Trigger */}
      <motion.button
        className="absolute bottom-20 left-4 bg-gray-900/90 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm pointer-events-auto hover:border-green-400/50 transition-colors disabled:opacity-50"
        onClick={() => {
          console.log('[CareerDrone] Button clicked');
          startCareerTour();
        }}
        disabled={isAnimating}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">🚁</span>
          <div className="text-left">
            <div className="text-green-400 text-xs font-mono leading-none">DRONE</div>
            <div className="text-white text-xs font-mono leading-none">TOUR</div>
          </div>
        </div>
      </motion.button>
    </div>
  );
};

export default React.memo(CareerDroneAnimation);