import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import { useMissionControl } from '../../store/missionControl';
import type { SiteData } from '../../types/mission';
import sitesData from '../../data/sites.json';
import FlightPathAnimations from './FlightPathAnimations';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token from environment variables or fallback to demo token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

function MapboxScene() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { selectSite, selectedSite, addTelemetry } = useMissionControl();
  const [sites] = useState<SiteData[]>(sitesData as SiteData[]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentCoords, setCurrentCoords] = useState({ lat: 42.3601, lng: -71.0589 }); // Boston
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });

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

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: import.meta.env.VITE_MAPBOX_STYLE || 'mapbox://styles/mapbox/satellite-v9',
      center: [-71.0589, 42.3601], // Boston
      zoom: 4,
      pitch: 45,
      bearing: 0,
      antialias: true,
      attributionControl: false
    });

    map.current.on('load', () => {
      if (!map.current) return;

      setMapLoaded(true);
      
      // Add custom dark overlay for tactical feel
      map.current.addSource('tactical-overlay', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-180, -90],
              [180, -90],
              [180, 90],
              [-180, 90],
              [-180, -90]
            ]]
          }
        }
      });

      map.current.addLayer({
        id: 'tactical-overlay',
        type: 'fill',
        source: 'tactical-overlay',
        paint: {
          'fill-color': '#000000',
          'fill-opacity': 0.7
        }
      });

      // Add tactical grid
      map.current.addSource('tactical-grid', {
        type: 'geojson',
        data: generateTacticalGrid()
      });

      map.current.addLayer({
        id: 'tactical-grid',
        type: 'line',
        source: 'tactical-grid',
        paint: {
          'line-color': '#00ff00',
          'line-width': 0.5,
          'line-opacity': 0.3
        }
      });

      // Add mission sites
      addMissionSites();

      addTelemetry({
        source: 'MAP',
        message: `Mapbox tactical display initialized - ${sites.length} sites detected`,
        level: 'success'
      });

      // Update coordinates on map move
      map.current.on('mousemove', (e) => {
        setCurrentCoords({
          lat: parseFloat(e.lngLat.lat.toFixed(4)),
          lng: parseFloat(e.lngLat.lng.toFixed(4))
        });
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [addTelemetry, sites]);

  const generateTacticalGrid = () => {
    const features = [];
    
    // Generate latitude lines
    for (let lat = -80; lat <= 80; lat += 10) {
      features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [[-180, lat], [180, lat]]
        }
      });
    }
    
    // Generate longitude lines
    for (let lng = -170; lng <= 170; lng += 20) {
      features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [[lng, -85], [lng, 85]]
        }
      });
    }

    return {
      type: 'FeatureCollection',
      features
    };
  };

  const addMissionSites = () => {
    if (!map.current) return;

    // Create custom marker elements for each site
    sites.forEach((site) => {
      const markerElement = document.createElement('div');
      markerElement.className = 'mission-marker';
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, #00ff00, #00aa00);
        border: 2px solid #00ff00;
        box-shadow: 0 0 20px #00ff0080, inset 0 0 10px #00ff0040;
        cursor: pointer;
        animation: pulse 2s infinite;
        position: relative;
      `;

      // Add pulsing animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px #00ff0080; }
          50% { transform: scale(1.2); box-shadow: 0 0 30px #00ff00ff; }
        }
      `;
      document.head.appendChild(style);

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([site.hq.lng, site.hq.lat])
        .addTo(map.current!);

      // Add click handler
      markerElement.addEventListener('click', () => {
        selectSite(site);
        addTelemetry({
          source: 'MAP',
          message: `Engaging target: ${site.codename || site.name}`,
          level: 'success'
        });

        // Fly to site
        map.current?.flyTo({
          center: [site.hq.lng, site.hq.lat],
          zoom: 8,
          pitch: 60,
          bearing: 0,
          duration: 2000
        });
      });

      // Add popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'tactical-popup'
      }).setHTML(`
        <div style="
          background: #000;
          border: 1px solid #00ff00;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          padding: 8px;
          border-radius: 4px;
        ">
          <div style="color: #fff; font-weight: bold;">${site.codename || site.name}</div>
          <div style="font-size: 10px; margin-top: 4px;">
            ${site.type.toUpperCase()} • ${site.engagementType?.toUpperCase() || 'CLASSIFIED'}
          </div>
          <div style="font-size: 10px; color: #00ff00;">
            LAT: ${site.hq.lat.toFixed(4)} LNG: ${site.hq.lng.toFixed(4)}
          </div>
        </div>
      `);

      markerElement.addEventListener('mouseenter', () => {
        marker.setPopup(popup).togglePopup();
      });

      markerElement.addEventListener('mouseleave', () => {
        popup.remove();
      });
    });
  };

  const resetView = () => {
    if (!map.current) return;
    
    map.current.flyTo({
      center: [-71.0589, 42.3601],
      zoom: 4,
      pitch: 45,
      bearing: 0,
      duration: 2000
    });

    addTelemetry({
      source: 'MAP',
      message: 'Tactical display reset to global overview',
      level: 'info'
    });
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Mapbox container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading overlay */}
      {!mapLoaded && (
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

      {/* Tactical HUD overlay */}
      {mapLoaded && (
        <>
          {/* Map controls */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-gray-900/90 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-green-500 text-xs font-mono mb-2">
                TACTICAL DISPLAY
              </div>
              <div className="text-white text-xs font-mono space-y-1">
                <div>SITES: {sites.length}</div>
                <div>STATUS: <span className="text-green-500">ACTIVE</span></div>
                <div>ENGINE: <span className="text-green-500">MAPBOX GL</span></div>
                {selectedSite && (
                  <div>TARGET: <span className="text-green-500">{selectedSite.codename || selectedSite.name}</span></div>
                )}
              </div>
              <button
                onClick={resetView}
                className="mt-2 bg-gray-800 border border-green-500/50 text-green-500 px-2 py-1 rounded text-xs font-mono hover:bg-green-500/10 transition-colors"
              >
                RESET VIEW
              </button>
            </div>
          </div>

          {/* Coordinate display */}
          <div className="absolute top-4 right-4">
            <div className="bg-gray-900/90 border border-green-500/30 rounded p-2 backdrop-blur-sm">
              <div className="text-green-500 text-xs font-mono mb-1">
                COORDINATES
              </div>
              <div className="text-white text-xs font-mono">
                LAT: {currentCoords.lat}°
              </div>
              <div className="text-white text-xs font-mono">
                LNG: {currentCoords.lng}°
              </div>
            </div>
          </div>

          {/* Tactical indicators */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="bg-gray-900/90 border border-green-500/30 rounded p-2 backdrop-blur-sm">
              <div className="text-green-500 text-xs font-mono text-center">
                SATELLITE RECONNAISSANCE
              </div>
            </div>
          </div>

          {/* Mission brief indicator */}
          <div className="absolute top-4 left-4">
            <div className="bg-gray-900/90 border border-green-500/30 rounded p-2 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="text-green-500 text-xs font-mono">
                  MISSION CONTROL
                </div>
              </div>
            </div>
          </div>
          {/* Flight Path Animations */}
          <FlightPathAnimations
            sites={sites}
            selectedSite={selectedSite}
            containerWidth={containerDimensions.width}
            containerHeight={containerDimensions.height}
          />
        </>
      )}

      {/* Tactical scanning overlay */}
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
    </div>
  );
}

export default MapboxScene;