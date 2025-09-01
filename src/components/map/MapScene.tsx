import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMapStore, useTelemetryStore } from '../../store/missionControlV2';
import { useDataStore } from '../../store/missionControlV2';
import type { SiteData, EnhancedSiteData } from '../../types/mission';
import { ResumeDataLoader } from '../LoadingStates/ResumeDataLoader';
import MissionPin from './MissionPin';
import sitesData from '../../data/sites.json';

// Enhanced MapScene with resume data integration and USA flyTo
function MapScene() {
  const { selectSite, selectedSite } = useMapStore();
  const { addTelemetry } = useTelemetryStore();
  const {
    sites: dynamicSites,
    resumeDataState,
    resumeDataError,
    loadResumeData,
    resumeUrl
  } = useDataStore();
  
  // State management
  const [staticSites] = useState<SiteData[]>(sitesData as SiteData[]);
  const [allSites, setAllSites] = useState<EnhancedSiteData[]>(staticSites as EnhancedSiteData[]);
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [resumeDataUrl, setResumeDataUrl] = useState<string>('');

  // USA flyTo initialization effect
  useEffect(() => {
    if (!mapInitialized) {
      // Simulate USA flyTo initialization
      addTelemetry({
        source: 'MAP',
        message: 'Initializing tactical display - Flying to USA theater of operations',
        level: 'info'
      });
      
      // Simulate flyTo animation completion
      setTimeout(() => {
        setMapInitialized(true);
        addTelemetry({
          source: 'MAP',
          message: 'USA theater established - Tactical display operational',
          level: 'success'
        });
      }, 2000);
    }
  }, [addTelemetry, mapInitialized]);

  // Sites data integration effect
  useEffect(() => {
    let sitesToUse: EnhancedSiteData[] = staticSites as EnhancedSiteData[];

    // If we have dynamic sites from resume data, merge them
    if (dynamicSites.length > 0) {
      // Merge dynamic sites with static sites, prioritizing dynamic data
      const staticSiteIds = new Set(staticSites.map(site => site.id));
      const dynamicSitesToAdd = dynamicSites.filter(site => !staticSiteIds.has(site.id));
      sitesToUse = [...staticSites as EnhancedSiteData[], ...dynamicSitesToAdd];
      
      addTelemetry({
        source: 'DATA',
        message: `Resume data integrated - ${dynamicSitesToAdd.length} new sites from external source`,
        level: 'success'
      });
    }

    setAllSites(sitesToUse);
    
    addTelemetry({
      source: 'MAP',
      message: `Tactical display updated - ${sitesToUse.length} total sites detected`,
      level: 'info'
    });
  }, [dynamicSites, staticSites, addTelemetry]);

  // Resume data URL handling
  useEffect(() => {
    // Check if we have a resume URL from environment or config
    const envResumeUrl = process.env.VITE_RESUME_URL;
    if (envResumeUrl && resumeDataUrl !== envResumeUrl) {
      setResumeDataUrl(envResumeUrl);
      
      // Auto-load resume data if URL is available
      if (!resumeUrl && resumeDataState === 'idle') {
        addTelemetry({
          source: 'DATA',
          message: `Detected resume data source - Initiating data acquisition`,
          level: 'info'
        });
        loadResumeData(envResumeUrl).catch(error => {
          addTelemetry({
            source: 'DATA',
            message: `Resume data acquisition failed: ${error.message}`,
            level: 'error'
          });
        });
      }
    }
  }, [resumeUrl, resumeDataState, resumeDataUrl, loadResumeData, addTelemetry]);

  const handleSiteClick = (site: EnhancedSiteData) => {
    selectSite(site);
    addTelemetry({
      source: 'MAP',
      message: `Engaging target: ${site.codename || site.name}`,
      level: 'success'
    });
  };

  // Loading component for resume data
  const LoadingComponent = () => (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="loading-radar mb-4">
          <motion.div
            className="w-16 h-16 border-2 border-green-500 rounded-full relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 border-t-2 border-green-500"></div>
          </motion.div>
        </div>
        <div className="text-green-500 font-mono text-sm">
          ACQUIRING EXTERNAL INTELLIGENCE...
        </div>
        <div className="text-green-300 font-mono text-xs mt-2">
          Establishing secure data link
        </div>
      </div>
    </div>
  );

  // Error component for resume data failures
  const ErrorComponent = ({ error, retry }: { error: { message?: string }; retry: () => void }) => (
    <div className="absolute bottom-4 right-4 bg-red-900 bg-opacity-80 border border-red-500 rounded p-3 z-40">
      <div className="text-red-400 font-mono text-xs mb-2">
        DATA ACQUISITION FAILED
      </div>
      <div className="text-red-300 font-mono text-xs mb-2">
        {error.message || 'Unknown error'}
      </div>
      <button 
        onClick={retry}
        className="bg-red-700 hover:bg-red-600 text-red-100 font-mono text-xs px-2 py-1 rounded"
      >
        RETRY
      </button>
    </div>
  );

  // Convert lat/lng to screen coordinates (simplified)
  const getScreenPosition = (lat: number, lng: number) => {
    // Simple mercator-like projection for demo
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: Math.min(95, Math.max(5, x)), y: Math.min(90, Math.max(10, y)) };
  };

  const mapContent = (
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
      {allSites.map((site) => {
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
            <div>SITES: {allSites.length}</div>
            <div>STATUS: <span className="text-green-500">{mapInitialized ? 'ACTIVE' : 'INITIALIZING'}</span></div>
            {resumeDataState === 'loading' && (
              <div>DATA: <span className="text-yellow-500">ACQUIRING</span></div>
            )}
            {resumeDataState === 'loaded' && dynamicSites.length > 0 && (
              <div>INTEL: <span className="text-green-500">LINKED</span></div>
            )}
            {resumeDataState === 'error' && (
              <div>INTEL: <span className="text-red-500">ERROR</span></div>
            )}
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

      {/* Resume data loading overlay */}
      {resumeDataState === 'loading' && <LoadingComponent />}
      
      {/* Resume data error display */}
      {resumeDataState === 'error' && resumeDataError && (
        <ErrorComponent 
          error={resumeDataError} 
          retry={async () => {
            if (resumeDataUrl) {
              try {
                await loadResumeData(resumeDataUrl);
              } catch {
                // Error handling is managed by the store
              }
            }
          }} 
        />
      )}
    </div>
  );

  // Wrap with resume data loader if we have a resume URL configured
  if (resumeDataUrl && process.env.VITE_ENABLE_RESUME_LOADER !== 'false') {
    return (
      <ResumeDataLoader
        resumeUrl={resumeDataUrl}
        loadingComponent={LoadingComponent}
        fallbackComponent={ErrorComponent}
        autoLoad={true}
      >
        {mapContent}
      </ResumeDataLoader>
    );
  }

  // Return map content directly if no resume integration
  return mapContent;
}

export default MapScene;