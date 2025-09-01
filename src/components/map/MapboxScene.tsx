import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { SiteData } from '../../types';
import sitesData from '../../data/sites.json';

// Core map components
import MapContainer from './core/MapContainer';

// Feature systems
import { UXVSystem, useUXVState } from '../../features/uxv';
import { CareerSystem } from '../../features/career';
import { TerminalSystem } from '../../features/terminal';

// Overlay components
import { 
  TacticalCrosshair, 
  MothershipOverlay, 
  TacticalIndicators,
  AlertOverlay 
} from './overlays';

// Panel components
import { CareerDataDisplay } from './panels';

// Other components
import FlightPathAnimations from './FlightPathAnimations';

// Styles
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxSceneProps {
  sites?: SiteData[];
}

function MapboxScene({ sites: propSites }: MapboxSceneProps = {}) {
  // Map state
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mothershipVisible, setMothershipVisible] = useState(false);
  
  // UI state
  const [currentCoords, setCurrentCoords] = useState({ lat: 42.3601, lng: -71.0589 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });
  const [cursorPoint, setCursorPoint] = useState<{ x: number; y: number } | null>(null);
  const [alertMode, setAlertMode] = useState(false);
  
  // Legacy sites data (keeping for backward compatibility)
  const [sites] = useState<SiteData[]>(propSites || sitesData as SiteData[]);
  
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const eggsRef = useRef<{ dispose: () => void } | null>(null);

  // UXV system integration
  const uxvState = useUXVState();

  // Track container size for flight path animations
  useEffect(() => {
    const updateDimensions = () => {
      if (mapContainer.current) {
        const rect = mapContainer.current.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Hide crosshair when cursor leaves the map container
  useEffect(() => {
    const el = mapContainer.current;
    if (!el) return;
    const handleLeave = () => setCursorPoint(null);
    el.addEventListener('mouseleave', handleLeave);
    return () => el.removeEventListener('mouseleave', handleLeave);
  }, []);

  // Map event handlers
  const handleMapLoad = useCallback((mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
    setIsMapLoaded(true);

    // Track zoom for mothership visibility
    const onMove = () => {
      const z = mapInstance.getZoom();
      setZoomLevel(z);
      setMothershipVisible(z <= 1.2);
    };
    mapInstance.on('move', onMove);
    onMove();

    // Register map easter eggs
    try {
      eggsRef.current = require('../../utils/easterEggs/mapEasterEggs').registerMapEasterEggs(
        mapInstance, 
        { container: mapContainer.current!, enableRandom: true }
      );
    } catch (eggErr) {
      console.warn('[MapboxScene] Map easter eggs registration failed:', eggErr);
    }

    // Handle HQ query param navigation
    try {
      const search = new URLSearchParams(window.location.search);
      const hq = search.get('hq');
      if (hq) {
        // This would integrate with career system to navigate to HQ
        setTimeout(() => {
          search.delete('hq');
          const newUrl = window.location.pathname + (search.toString() ? ('?'+search.toString()) : '') + window.location.hash;
          window.history.replaceState({}, '', newUrl);
        }, 600);
      }
    } catch {}
  }, []);

  const handleMapMove = useCallback((e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    setCurrentCoords({
      lat: parseFloat(e.lngLat.lat.toFixed(4)),
      lng: parseFloat(e.lngLat.lng.toFixed(4))
    });
    setCursorPoint({ x: e.point.x, y: e.point.y });
  }, []);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    // UXV system will handle its own click events
    // Other click handlers can be added here
  }, []);

  const handleMapContextMenu = useCallback((e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    // UXV system will handle its own context menu events
    // Other context menu handlers can be added here
  }, []);

  // Terminal action handler
  const handleTerminalAction = useCallback((action: any) => {
    switch (action.type) {
      case 'trigger_alert':
        setAlertMode(true);
        setTimeout(() => setAlertMode(false), action.payload || 4000);
        break;
      // Other terminal actions are handled by TerminalSystem internally
    }
  }, []);

  // Reset view function for career data display
  const resetView = useCallback(() => {
    if (!map) return;
    
    map.flyTo({
      center: [-98.5795, 39.8283], // USA center
      zoom: 4,
      pitch: 0,
      bearing: 0,
      duration: 2000
    });
  }, [map]);

  // UXV integration handlers
  const handleStartUXV = useCallback((position?: { lng: number; lat: number }) => {
    let startPos = position;
    if (!startPos && map) {
      const center = map.getCenter();
      startPos = { lng: center.lng, lat: center.lat };
    }
    if (startPos) {
      uxvState.startUXV(startPos);
    }
  }, [map, uxvState]);

  // Cleanup
  useEffect(() => {
    return () => {
      try {
        eggsRef.current?.dispose();
      } catch {}
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden" ref={mapContainer}>
      {/* Core map container */}
      <MapContainer
        onMapLoad={handleMapLoad}
        onMapMove={handleMapMove}
        onMapClick={handleMapClick}
        onMapContextMenu={handleMapContextMenu}
        className="w-full h-full cursor-none"
      />

      {/* Feature systems - only render when map is loaded */}
      {isMapLoaded && map && (
        <>
          {/* UXV System */}
          <UXVSystem
            map={map}
            isMapLoaded={isMapLoaded}
            containerDimensions={containerDimensions}
            onMapClick={handleMapClick}
            onMapContextMenu={handleMapContextMenu}
          />

          {/* Career System */}
          <CareerSystem
            map={map}
            isMapLoaded={isMapLoaded}
            isUXVActive={uxvState.active}
            onUXVTarget={uxvState.setTarget}
          />

          {/* Terminal System */}
          <TerminalSystem
            map={map}
            careerData={null} // Will be loaded by CareerSystem
            onAction={handleTerminalAction}
            onStartUXV={handleStartUXV}
          />
        </>
      )}

      {/* Mothership overlay when zoomed out */}
      {isMapLoaded && mothershipVisible && (
        <MothershipOverlay containerRef={mapContainer} />
      )}

      {/* UI Overlays */}
      {isMapLoaded && (
        <>
          {/* Tactical crosshair cursor */}
          <TacticalCrosshair
            cursorPoint={cursorPoint}
            currentCoords={currentCoords}
            containerDimensions={containerDimensions}
          />

          {/* Tactical indicators */}
          <TacticalIndicators zoomLevel={zoomLevel} />

          {/* Career data display */}
          <CareerDataDisplay
            markerCount={0} // Will be updated by career system
            selectedMarker={null} // Will be updated by career system  
            onResetView={resetView}
          />

          {/* Alert overlay */}
          <AlertOverlay isAlertMode={alertMode} />

          {/* Flight Path Animations (legacy) */}
          <FlightPathAnimations
            sites={sites}
            selectedSite={null}
            containerWidth={containerDimensions.width}
            containerHeight={containerDimensions.height}
          />
        </>
      )}

      {/* Tactical scanning overlay */}
      {isMapLoaded && (
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
    </div>
  );
}

export default MapboxScene;