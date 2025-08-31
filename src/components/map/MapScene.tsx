import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMissionControl } from '../../store/missionControl';
import type { SiteData } from '../../types/mission';
import MissionPin from './MissionPin';
import sitesData from '../../data/sites.json';

// Simple tactical grid map component (placeholder for Mapbox)
function MapScene() {
  const { selectSite, selectedSite, addTelemetry } = useMissionControl();
  const [sites] = useState<SiteData[]>(sitesData as SiteData[]);
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);

  useEffect(() => {
    addTelemetry({
      source: 'MAP',
      message: `Tactical display initialized - ${sites.length} sites detected`,
      level: 'info'
    });
  }, [addTelemetry, sites.length]);

  const handleSiteClick = (site: SiteData) => {
    selectSite(site);
    addTelemetry({
      source: 'MAP',
      message: `Engaging target: ${site.codename || site.name}`,
      level: 'success'
    });
  };

  // Convert lat/lng to screen coordinates (simplified)
  const getScreenPosition = (lat: number, lng: number) => {
    // Simple mercator-like projection for demo
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: Math.min(95, Math.max(5, x)), y: Math.min(90, Math.max(10, y)) };
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Tactical grid overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,0,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,0,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Radar sweep animation */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 -mt-48 -ml-48"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear",
            repeatDelay: 2 
          }}
        >
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent transform origin-left rotate-0"></div>
          </div>
        </motion.div>
      </div>

      {/* World map silhouette (simplified) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-full h-full opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M150,200 Q300,150 450,200 T750,200 Q850,220 900,250 L900,400 Q800,380 700,390 Q500,420 300,390 Q200,380 150,360 Z' fill='%2300ff0020' stroke='%2300ff0040'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Mission Sites */}
      {sites.map((site) => {
        const position = getScreenPosition(site.hq.lat, site.hq.lng);
        return (
          <MissionPin
            key={site.id}
            site={site}
            position={position}
            isSelected={selectedSite?.id === site.id}
            isHovered={hoveredSite === site.id}
            onClick={() => handleSiteClick(site)}
            onHover={() => setHoveredSite(site.id)}
            onLeave={() => setHoveredSite(null)}
          />
        );
      })}

      {/* Map controls */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-gray-900 border border-green-500/30 rounded-lg p-3">
          <div className="text-green-500 text-xs font-mono mb-2">
            TACTICAL DISPLAY
          </div>
          <div className="text-white text-xs font-mono space-y-1">
            <div>SITES: {sites.length}</div>
            <div>STATUS: <span className="text-green-500">ACTIVE</span></div>
            {selectedSite && (
              <div>TARGET: <span className="text-green-500">{selectedSite.codename || selectedSite.name}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Coordinate display */}
      <div className="absolute top-4 right-4">
        <div className="bg-gray-900 border border-green-500/30 rounded p-2">
          <div className="text-green-500 text-xs font-mono">
            GRID: TACTICAL_OVERVIEW
          </div>
        </div>
      </div>

      {/* Scanning lines */}
      <motion.div
        className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"
        animate={{ y: [0, 800] }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 1
        }}
      />
    </div>
  );
}

export default MapScene;