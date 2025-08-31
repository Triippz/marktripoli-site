import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapboxGlobeProps {
  className?: string;
}

function MapboxGlobe({ className = '' }: MapboxGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Get API key like orion-better pattern
    const apiKey = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!apiKey) {
      console.error('Mapbox API key not configured. Please set VITE_MAPBOX_ACCESS_TOKEN in .env file');
      return;
    }

    // Set access token BEFORE creating map (critical pattern from orion-better)
    mapboxgl.accessToken = apiKey;

    // Create map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [0, 0], // Center on equator
      zoom: 1, // Show full earth
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      interactive: false, // Disable all user interactions for background use
      dragPan: false,
      dragRotate: false,
      scrollZoom: false,
      doubleClickZoom: false,
      touchZoomRotate: false
    });

    map.current.on('load', () => {
      if (!map.current) return;

      try {
        // Try to set globe projection (may not be available in all versions)
        if (map.current.setProjection) {
          map.current.setProjection('globe');
        }
        
        // Add dark overlay for greyish-black hue
        map.current.addSource('dark-overlay', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-180, -85],
                [180, -85],
                [180, 85],
                [-180, 85],
                [-180, -85]
              ]]
            }
          }
        });

        map.current.addLayer({
          id: 'dark-overlay',
          type: 'fill',
          source: 'dark-overlay',
          paint: {
            'fill-color': '#000000',
            'fill-opacity': 0.6
          }
        });

        // Start rotation
        startRotation();
        setMapReady(true);
      } catch (error) {
        console.error('Failed to configure map:', error);
        setMapReady(true); // Still show map even if some features fail
      }
    });

    map.current.on('error', (e) => {
      console.error('Mapbox error:', e.error);
    });

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const startRotation = () => {
    if (!map.current) return;

    let bearing = 0;
    const rotationSpeed = 0.1; // Slow rotation

    const animate = () => {
      if (!map.current) return;

      bearing += rotationSpeed;
      if (bearing >= 360) bearing = 0;

      map.current.setBearing(bearing);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  return (
    <div 
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ 
        background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)'
      }}
    >
      {/* Map container */}
      <div ref={mapContainer} className="mapbox-map w-full h-full" />

      {/* Loading state */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="text-green-500 font-mono text-sm animate-pulse mb-4">
              INITIALIZING EARTH SURVEILLANCE...
            </div>
            
            {/* Enhanced starfield background while loading */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white rounded-full animate-pulse"
                  style={{
                    width: Math.random() > 0.8 ? '2px' : '1px',
                    height: Math.random() > 0.8 ? '2px' : '1px',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.2,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${Math.random() * 2 + 1}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapboxGlobe;