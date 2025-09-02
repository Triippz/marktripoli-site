import React, { useState, useCallback, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion } from 'framer-motion';
import type { SiteData } from '../../types';
import sitesData from '../../data/sites.json';

// Responsive hooks and store
import { useResponsive } from '../../hooks/useResponsive';
import { useResponsiveStore } from '../../store/missionControlV2';

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
  // Responsive state
  const responsive = useResponsive();
  const {
    isMobile,
    isTablet,
    isDesktop,
    capabilities,
    features,
    shouldReduceMotion,
    getAnimationSettings,
    shouldUseComponent,
    updateResponsiveState,
    updatePerformanceMetrics
  } = useResponsiveStore();
  
  // Map state
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mothershipVisible, setMothershipVisible] = useState(false);
  
  // UI state
  const [currentCoords, setCurrentCoords] = useState({ lat: 42.3601, lng: -71.0589 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [cursorPoint, setCursorPoint] = useState<{ x: number; y: number } | null>(null);
  const [alertMode, setAlertMode] = useState(false);
  
  // Legacy sites data (keeping for backward compatibility)
  const [sites] = useState<SiteData[]>(() => propSites || sitesData as SiteData[]);
  
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const eggsRef = useRef<{ dispose: () => void } | null>(null);

  // UXV system integration
  const uxvState = useUXVState();
  
  // Sync responsive state with store
  useEffect(() => {
    updateResponsiveState(
      responsive.screenSize,
      responsive.orientation,
      responsive.capabilities
    );
  }, [responsive.screenSize, responsive.orientation, responsive.capabilities, updateResponsiveState]);

  // Track container size for flight path animations (now responsive)
  useEffect(() => {
    const updateDimensions = () => {
      if (mapContainer.current) {
        const rect = mapContainer.current.getBoundingClientRect();
        setContainerDimensions(prev => {
          // Prevent unnecessary updates if dimensions haven't changed significantly
          if (Math.abs(prev.width - rect.width) < 1 && Math.abs(prev.height - rect.height) < 1) {
            return prev;
          }
          
          return { width: rect.width, height: rect.height };
        });
      }
    };

    updateDimensions();
    
    // Use ResizeObserver if available for better performance
    if (mapContainer.current && 'ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(mapContainer.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    } else {
      // Fallback to window resize listener
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [updatePerformanceMetrics]);

  // Update performance metrics when container dimensions change
  useEffect(() => {
    if (containerDimensions.width > 0 && containerDimensions.height > 0) {
      updatePerformanceMetrics({
        lastRenderTime: Date.now()
      });
    }
  }, [containerDimensions, updatePerformanceMetrics]);

  // Hide crosshair when cursor leaves the map container (desktop only)
  useEffect(() => {
    const el = mapContainer.current;
    if (!el || isMobile) return; // Skip mouse events on mobile
    
    const handleLeave = () => setCursorPoint(null);
    el.addEventListener('mouseleave', handleLeave);
    return () => el.removeEventListener('mouseleave', handleLeave);
  }, [isMobile]);

  // Map event handlers
  const handleMapLoad = useCallback((mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
    setIsMapLoaded(true);

    // Register map easter eggs (async import)
    import('../../utils/easterEggs/mapEasterEggs')
      .then(mapEasterEggs => {
        if (mapEasterEggs.registerMapEasterEggs && mapContainer.current) {
          eggsRef.current = mapEasterEggs.registerMapEasterEggs(
            mapInstance, 
            { container: mapContainer.current, enableRandom: true }
          );
        }
      })
      .catch(eggErr => {
        console.warn('[MapboxScene] Map easter eggs registration failed:', eggErr);
      });

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

  // Track zoom for mothership visibility with proper cleanup
  useEffect(() => {
    if (!map) return;
    const onMove = () => {
      const z = map.getZoom();
      setZoomLevel(prevZoom => {
        if (Math.abs(prevZoom - z) < 0.01) return prevZoom; // Prevent tiny updates
        return z;
      });
      setMothershipVisible(prev => {
        const shouldShow = z <= 1.2;
        if (prev === shouldShow) return prev; // Prevent unnecessary updates
        return shouldShow;
      });
    };
    map.on('move', onMove);
    onMove();
    return () => {
      try { map.off('move', onMove); } catch {}
    };
  }, [map]);

  const handleMapMove = useCallback((e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    const newLat = parseFloat(e.lngLat.lat.toFixed(4));
    const newLng = parseFloat(e.lngLat.lng.toFixed(4));
    
    setCurrentCoords(prev => {
      if (prev.lat === newLat && prev.lng === newLng) return prev;
      return { lat: newLat, lng: newLng };
    });
    
    // Only track cursor point on desktop devices with hover capability
    if (capabilities.hover && !isMobile) {
      setCursorPoint(prev => {
        if (prev?.x === e.point.x && prev?.y === e.point.y) return prev;
        return { x: e.point.x, y: e.point.y };
      });
    }
  }, [capabilities.hover, isMobile]);

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
        setAlertMode(prev => {
          if (prev) return prev; // Already in alert mode, don't restart
          setTimeout(() => setAlertMode(false), action.payload || 4000);
          return true;
        });
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

  // Get responsive CSS classes and animation settings
  const animationSettings = getAnimationSettings();
  const mapCursorClass = isMobile 
    ? "cursor-default touch-manipulation" 
    : capabilities.hover 
      ? "cursor-none" 
      : "cursor-default";

  return (
    <div className="relative w-full h-full bg-black overflow-hidden" ref={mapContainer}>
      {/* Core map container */}
      <MapContainer
        onMapLoad={handleMapLoad}
        onMapMove={handleMapMove}
        onMapClick={handleMapClick}
        onMapContextMenu={handleMapContextMenu}
        className={`w-full h-full ${mapCursorClass}`}
      />

      {/* Feature systems - only render when map is loaded */}
      {isMapLoaded && map && (
        <>
          {/* UXV System - render based on device capabilities */}
          {shouldUseComponent('ComplexAnimations') && (
            <UXVSystem
              map={map}
              isMapLoaded={isMapLoaded}
              containerDimensions={containerDimensions}
              onMapClick={handleMapClick}
              onMapContextMenu={handleMapContextMenu}
              uxv={uxvState}
            />
          )}

          {/* Career System - always render but may have reduced features */}
          <CareerSystem
            map={map}
            isMapLoaded={isMapLoaded}
            isUXVActive={uxvState.active}
            onUXVTarget={uxvState.setTarget}
          />

          {/* Terminal System - always render but adapts to screen size */}
          <TerminalSystem
            map={map}
            careerData={null} // Will be loaded by CareerSystem
            onAction={handleTerminalAction}
            onStartUXV={handleStartUXV}
            uxv={uxvState}
          />
        </>
      )}

      {/* Mothership overlay when zoomed out - desktop only */}
      {isMapLoaded && mothershipVisible && shouldUseComponent('ComplexAnimations') && (
        <MothershipOverlay containerRef={mapContainer} />
      )}

      {/* UI Overlays */}
      {isMapLoaded && (
        <>
          {/* Tactical crosshair cursor - desktop only */}
          {!isMobile && capabilities.hover && (
            <TacticalCrosshair
              cursorPoint={cursorPoint}
              currentCoords={currentCoords}
              containerDimensions={containerDimensions}
            />
          )}

          {/* Tactical indicators - adapt to screen size */}
          <TacticalIndicators zoomLevel={zoomLevel} />

          {/* Career data display - responsive layout */}
          <CareerDataDisplay
            markerCount={0} // Will be updated by career system
            selectedMarker={null} // Will be updated by career system  
            onResetView={resetView}
          />

          {/* Alert overlay */}
          <AlertOverlay isAlertMode={alertMode} />

          {/* Flight Path Animations (legacy) - reduce on mobile */}
          {shouldUseComponent('AnimationLibrary') && (
            <FlightPathAnimations
              sites={sites}
              selectedSite={null}
              containerWidth={containerDimensions.width}
              containerHeight={containerDimensions.height}
            />
          )}
        </>
      )}

      {/* Tactical scanning overlay - responsive animation */}
      {isMapLoaded && features.animations && !shouldReduceMotion && (
        <motion.div
          className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30 pointer-events-none"
          animate={{ y: [0, containerDimensions.height || 800] }}
          transition={{ 
            duration: animationSettings.duration / 100, // Convert to seconds, adjust for scanning speed
            repeat: Infinity,
            ease: animationSettings.easing,
            repeatDelay: isMobile ? 3 : 2 // Slower on mobile to save battery
          }}
        />
      )}
    </div>
  );
}

export default MapboxScene;
