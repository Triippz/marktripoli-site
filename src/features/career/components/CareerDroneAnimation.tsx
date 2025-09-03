import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CareerMarker, CareerMapData } from '../../../types/careerData';
import { missionAudio } from '../../../utils/audioSystem';
import DroneIcon from '../../../components/DroneIcon';

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
  const [allPaths, setAllPaths] = useState<DronePath[]>([]);
  const [currentPath, setCurrentPath] = useState<DronePath | null>(null);
  const [showCareerTour, setShowCareerTour] = useState(false);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedPaths, setCompletedPaths] = useState<DronePath[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<CareerMarker[]>([]);
  const [mapVersion, setMapVersion] = useState(0);
  const [isAnimatingDrone, setIsAnimatingDrone] = useState(false);
  const [lockedFromPosition, setLockedFromPosition] = useState<{ x: number; y: number } | null>(null);
  const [lockedToPosition, setLockedToPosition] = useState<{ x: number; y: number } | null>(null);

  // Convert lat/lng to screen coordinates using map projection
  const projectToScreen = useCallback((lat: number, lng: number) => {
    if (!map) return { x: 0, y: 0 };
    const projected = map.project([lng, lat]);
    return { 
      x: projected.x, 
      y: projected.y 
    };
  }, [map, mapVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate drone paths for career progression (chronological order)
  const generateCareerPaths = useCallback(() => {
    if (!careerData?.markers) return [];

    // Sort ALL career markers by start date (chronological career progression)
    // Include military, education, work, and projects for complete timeline
    const allCareerMarkers = careerData.markers
      .filter(marker => ['work', 'military', 'education', 'project'].includes(marker.type))
      .sort((a, b) => {
        const dateA = new Date(a.startDate || '1900-01-01').getTime();
        const dateB = new Date(b.startDate || '1900-01-01').getTime();
        return dateA - dateB;
      });

    const paths: DronePath[] = [];
    
    for (let i = 0; i < allCareerMarkers.length - 1; i++) {
      paths.push({
        from: allCareerMarkers[i],
        to: allCareerMarkers[i + 1],
        duration: 4000, // 4 seconds travel time
        delay: i * 6500 // Travel (4s) + Pause (2s) + Gap (0.5s) = 6.5s per segment
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

    setAllPaths(paths);
    setCurrentPath(paths[0] || null);
    setShowCareerTour(true);
    setCurrentPathIndex(0);
    setIsAnimating(true);
    setCompletedPaths([]); // Reset trail
    setVisitedLocations([]); // Reset markers
    setIsAnimatingDrone(false); // Reset animation lock
    setLockedFromPosition(null);
    setLockedToPosition(null);

    // Play launch sound
    try {
      missionAudio.notification();
    } catch (error) {
      console.warn('[CareerDrone] Audio failed:', error);
    }

    // Clear animation after completion
    const totalDuration = paths.length * 6500 + 3000; // Updated for new timing with pauses
    setTimeout(() => {
      setAllPaths([]);
      setCurrentPath(null);
      setShowCareerTour(false);
      setCurrentPathIndex(0);
      setIsAnimating(false);
      setCompletedPaths([]);
      setVisitedLocations([]);
      setIsAnimatingDrone(false);
      setLockedFromPosition(null);
      setLockedToPosition(null);
    }, totalDuration);
  }, [generateCareerPaths, isAnimating, map]);

  // Update positions when map moves or zooms
  useEffect(() => {
    if (!map) return;
    
    const updatePositions = () => {
      setMapVersion(v => v + 1); // Force re-render of all position calculations
    };
    
    map.on('move', updatePositions);
    map.on('zoom', updatePositions);
    map.on('moveend', updatePositions);
    map.on('zoomend', updatePositions);
    
    return () => {
      map.off('move', updatePositions);
      map.off('zoom', updatePositions);
      map.off('moveend', updatePositions);
      map.off('zoomend', updatePositions);
    };
  }, [map]);

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
      {/* Animated Dotted Trail - behind the drone */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 45 }}>
        {/* Completed trails - static dotted lines */}
        {completedPaths.map((completedPath, trailIndex) => {
          const from = projectToScreen(completedPath.from.location.lat, completedPath.from.location.lng);
          const to = projectToScreen(completedPath.to.location.lat, completedPath.to.location.lng);
          
          return (
            <motion.line
              key={`trail-${trailIndex}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#45ffb0"
              strokeWidth="2"
              strokeDasharray="6,4"
              strokeOpacity="0.7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            />
          );
        })}
        
        {/* Currently animating trail - grows behind drone */}
        {currentPath && (() => {
          const from = projectToScreen(currentPath.from.location.lat, currentPath.from.location.lng);
          const to = projectToScreen(currentPath.to.location.lat, currentPath.to.location.lng);
          const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
          const dashLength = distance + 13; // Length for dash pattern
          
          return (
            <motion.line
              key={`current-trail-${currentPathIndex}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#45ffb0"
              strokeWidth="3"
              strokeDasharray="8,5"
              strokeOpacity="0.9"
              initial={{ strokeDashoffset: dashLength }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ 
                duration: currentPath.duration / 1000,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          );
        })()}

        {/* Location markers - circles at each visited career stop */}
        {visitedLocations.map((location, markerIndex) => {
          const position = projectToScreen(location.location.lat, location.location.lng);
          
          return (
            <g key={`marker-${location.id}`}>
              {/* Outer pulsing circle */}
              <motion.circle
                cx={position.x}
                cy={position.y}
                r="8"
                fill="none"
                stroke="#45ffb0"
                strokeWidth="2"
                strokeOpacity="0.6"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 1.2, 1], 
                  opacity: [0, 0.6, 0.4, 0.6] 
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: markerIndex * 0.2
                }}
              />
              
              {/* Inner solid circle */}
              <motion.circle
                cx={position.x}
                cy={position.y}
                r="4"
                fill="#45ffb0"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.3 
                }}
              />
              
              {/* Location label */}
              <motion.text
                x={position.x}
                y={position.y - 15}
                fill="#45ffb0"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
                initial={{ opacity: 0, y: position.y - 10 }}
                animate={{ opacity: 0.8, y: position.y - 15 }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.5 
                }}
              >
                {location.name.length > 20 ? 
                  location.name.substring(0, 17) + '...' : 
                  location.name
                }
              </motion.text>
            </g>
          );
        })}
      </svg>

      {/* Single Drone */}
      <AnimatePresence>
        {currentPath && (() => {
          // Use locked positions during animation, otherwise use current positions
          const currentFrom = projectToScreen(currentPath.from.location.lat, currentPath.from.location.lng);
          const currentTo = projectToScreen(currentPath.to.location.lat, currentPath.to.location.lng);
          
          const from = isAnimatingDrone && lockedFromPosition ? lockedFromPosition : currentFrom;
          const to = isAnimatingDrone && lockedToPosition ? lockedToPosition : currentTo;
          const pathRotation = calculateRotation(from, to);

          return (
            <React.Fragment key={`drone-${currentPathIndex}`}>
              {/* Single Drone */}
              <motion.div
                className="absolute w-8 h-8 flex items-center justify-center z-60"
                initial={{ 
                  left: from.x - 16, 
                  top: from.y - 16,
                  scale: 0, 
                  opacity: 0,
                  rotate: 0
                }}
                animate={{ 
                  left: [from.x - 16, to.x - 16, to.x - 16],
                  top: [from.y - 16, to.y - 16, to.y - 16],
                  scale: [0, 1, 1.2, 1],
                  opacity: [0, 1, 1, 1],
                  rotate: [0, pathRotation, pathRotation, pathRotation]
                }}
                transition={{
                  duration: (currentPath.duration + 2000) / 1000, // 4s travel + 2s pause
                  ease: "easeInOut",
                  times: [0, 0.62, 0.75, 1], // 0-62% travel, 62-75% hover/pulse, 75-100% settle
                  left: { times: [0, 0.62, 0.75, 1] },
                  top: { times: [0, 0.62, 0.75, 1] },
                  scale: { times: [0, 0.62, 0.75, 1] },
                  opacity: { times: [0, 0.05, 0.75, 1] },
                  rotate: { times: [0, 0.62, 0.75, 1] }
                }}
                onAnimationStart={() => {
                  // Lock positions to prevent jitter during animation
                  setIsAnimatingDrone(true);
                  setLockedFromPosition(currentFrom);
                  setLockedToPosition(currentTo);
                  
                  // Add starting location to visited if it's the first path
                  if (currentPathIndex === 0) {
                    setVisitedLocations(prev => [...prev, currentPath.from]);
                  }
                  
                  // Follow the drone with the camera
                  if (map) {
                    map.flyTo({
                      center: [currentPath.from.location.lng, currentPath.from.location.lat],
                      zoom: 7,
                      duration: 1500,
                      essential: true
                    });
                  }
                }}
                onAnimationComplete={() => {
                  // Unlock positions after animation completes
                  setIsAnimatingDrone(false);
                  setLockedFromPosition(null);
                  setLockedToPosition(null);
                  
                  // Add completed path to trail and destination to visited locations
                  setCompletedPaths(prev => [...prev, currentPath]);
                  setVisitedLocations(prev => [...prev, currentPath.to]);
                  
                  // Move to next path or end tour
                  if (currentPathIndex < allPaths.length - 1) {
                    setCurrentPathIndex(prev => prev + 1);
                    setCurrentPath(allPaths[currentPathIndex + 1]);
                  } else {
                    // Tour complete
                    setCurrentPath(null);
                  }
                  
                  // Follow to the destination
                  if (map) {
                    map.flyTo({
                      center: [currentPath.to.location.lng, currentPath.to.location.lat],
                      zoom: 7,
                      duration: 1500,
                      essential: true
                    });
                  }
                }}
              >
                <DroneIcon 
                  size={32} 
                  className="drop-shadow-[0_0_8px_rgba(69,255,176,0.8)]"
                />
              </motion.div>

              {/* Transition info popup */}
              <motion.div
                className="absolute bg-gray-900/95 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm pointer-events-none"
                style={{
                  left: Math.min(to.x + 20, containerDimensions.width - 250),
                  top: Math.max(to.y - 40, 20),
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 1 }}
              >
                <div className="text-green-400 text-xs font-mono mb-1">
                  CAREER TRANSITION
                </div>
                <div className="text-white text-xs font-mono">
                  {currentPath.from.name} → {currentPath.to.name}
                </div>
                <div className="text-gray-400 text-[10px] font-mono">
                  {currentPath.to.startDate ? new Date(currentPath.to.startDate).getFullYear() : ''}
                </div>
              </motion.div>
            </React.Fragment>
          );
        })()}
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
              <DroneIcon size={24} />
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
                transition={{ duration: allPaths.length * 6.5, ease: 'linear' }}
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
          <DroneIcon size={20} />
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