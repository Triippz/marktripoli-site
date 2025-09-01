import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SiteData } from '../../types/mission';

interface FlightPath {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  duration: number;
  delay: number;
}

interface FlightPathAnimationsProps {
  sites: SiteData[];
  selectedSite: SiteData | null;
  containerWidth: number;
  containerHeight: number;
}

function FlightPathAnimations({ sites, selectedSite, containerWidth, containerHeight }: FlightPathAnimationsProps) {
  const [activePaths, setActivePaths] = useState<FlightPath[]>([]);
  const [showCareerProgression, setShowCareerProgression] = useState(false);

  // Convert lat/lng to screen coordinates
  const projectToScreen = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * containerWidth;
    const y = ((90 - lat) / 180) * containerHeight;
    return { 
      x: Math.min(containerWidth - 50, Math.max(50, x)), 
      y: Math.min(containerHeight - 50, Math.max(50, y)) 
    };
  };

  // Career progression order (chronological)
  const careerOrder = ['marines', 'comcast', 'amtrak', 'picogrid', 'hubspot'];

  // Generate flight paths for career progression
  useEffect(() => {
    if (!showCareerProgression) return;

    const paths: FlightPath[] = [];
    const careerSites = sites.filter(site => careerOrder.includes(site.id));
    
    // Sort by career order
    careerSites.sort((a, b) => careerOrder.indexOf(a.id) - careerOrder.indexOf(b.id));

    for (let i = 0; i < careerSites.length - 1; i++) {
      paths.push({
        from: careerSites[i].hq,
        to: careerSites[i + 1].hq,
        duration: 3000,
        delay: i * 1000
      });
    }

    setActivePaths(paths);

    // Clear paths after animation
    setTimeout(() => {
      setActivePaths([]);
      setShowCareerProgression(false);
    }, paths.length * 1000 + 5000);
  }, [showCareerProgression, sites]);

  // Auto-trigger career progression animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCareerProgression(true);
    }, 10000); // Start after 10 seconds

    const interval = setInterval(() => {
      setShowCareerProgression(true);
    }, 60000); // Repeat every minute

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Career Progression Paths */}
      <AnimatePresence>
        {activePaths.map((path, index) => {
          const from = projectToScreen(path.from.lat, path.from.lng);
          const to = projectToScreen(path.to.lat, path.to.lng);
          
          const distance = Math.sqrt(
            Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
          );
          
          const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

          return (
            <motion.div
              key={`${index}-${path.delay}`}
              className="absolute"
              style={{
                left: from.x,
                top: from.y,
                width: distance,
                height: 2,
                transformOrigin: '0 50%',
                transform: `rotate(${angle}deg)`,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ 
                scaleX: 1, 
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                delay: path.delay / 1000,
                duration: path.duration / 1000,
                opacity: {
                  times: [0, 0.1, 0.9, 1],
                  duration: path.duration / 1000
                }
              }}
            >
              {/* Flight Path Line */}
              <div className="w-full h-full bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60" />
              
              {/* Moving Aircraft Icon */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 text-green-500 text-xs"
                initial={{ x: 0 }}
                animate={{ x: distance - 20 }}
                transition={{
                  delay: path.delay / 1000,
                  duration: path.duration / 1000,
                  ease: "easeInOut"
                }}
              >
                ✈️
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Selected Site Connections */}
      {selectedSite && (
        <AnimatePresence>
          {sites
            .filter(site => site.id !== selectedSite.id && site.type === 'job')
            .map((site, index) => {
              const from = projectToScreen(selectedSite.hq.lat, selectedSite.hq.lng);
              const to = projectToScreen(site.hq.lat, site.hq.lng);
              
              const distance = Math.sqrt(
                Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
              );
              
              const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

              return (
                <motion.div
                  key={site.id}
                  className="absolute"
                  style={{
                    left: from.x,
                    top: from.y,
                    width: distance,
                    height: 1,
                    transformOrigin: '0 50%',
                    transform: `rotate(${angle}deg)`,
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 0.3 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  transition={{ 
                    delay: index * 0.2,
                    duration: 1,
                    ease: "easeOut"
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-green-500/50 via-green-500/20 to-transparent" />
                  
                  {/* Connection pulse */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"
                    animate={{
                      x: [0, distance],
                      opacity: [1, 1, 0]
                    }}
                    transition={{
                      delay: index * 0.2 + 0.5,
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  />
                </motion.div>
              );
            })}
        </AnimatePresence>
      )}

      {/* Flight Path Legend */}
      {showCareerProgression && (
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 tactical-panel p-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="text-center">
            <div className="holo-text font-mono text-sm mb-1">
              CAREER PROGRESSION FLIGHT PATH
            </div>
            <div className="text-gray-400 text-xs font-mono">
              Showing chronological career journey
            </div>
          </div>
        </motion.div>
      )}

      {/* Manual Career Path Trigger */}
      <motion.button
        className="absolute bottom-20 right-4 tactical-button p-2 pointer-events-auto"
        onClick={() => setShowCareerProgression(true)}
        disabled={showCareerProgression}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-1">
          <span>✈️</span>
          <span className="text-xs">FLIGHT PATH</span>
        </div>
      </motion.button>
    </div>
  );
}

export default React.memo(FlightPathAnimations);
