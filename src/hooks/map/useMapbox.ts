import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMissionControl } from '../../store/missionControl';
import { featureLoggers, criticalLog } from '../../utils/debugLogger';

// Set Mapbox access token from environment variables (primary, explicit path)
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

interface MapboxOptions {
  center?: [number, number];
  zoom?: number;
  style?: string;
  pitch?: number;
  bearing?: number;
}

interface UseMapboxReturn {
  map: mapboxgl.Map | null;
  mapContainer: React.RefObject<HTMLDivElement | null>;
  isLoaded: boolean;
  error: Error | null;
  flyTo: (options: { center: [number, number]; zoom?: number; pitch?: number; bearing?: number; duration?: number }) => void;
  fitBounds: (bounds: mapboxgl.LngLatBounds, options?: any) => void;
  resetView: () => void;
}

const generateTacticalGrid = (): GeoJSON.FeatureCollection<GeoJSON.LineString> => {
  const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  
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

export function useMapbox(options: MapboxOptions = {}): UseMapboxReturn {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const errorRef = useRef<Error | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { addTelemetry } = useMissionControl() as any;

  const addMapTelemetry = useCallback((log: any) => {
    addTelemetry(log);
  }, [addTelemetry]);

  // Map initialization
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    let mapInstance: mapboxgl.Map | null = null;

    const initializeMap = async () => {
      try {
        featureLoggers.map.log('[useMapbox] Initializing map with API key:', import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.substring(0, 20) + '...');

        // Initialize map with global view for smooth transition from boot
        mapInstance = new mapboxgl.Map({
          container: mapContainer.current!,
          style: options.style || import.meta.env.VITE_MAPBOX_STYLE || 'mapbox://styles/mapbox/dark-v11',
          center: options.center || [0, 20],
          zoom: options.zoom || 1,
          pitch: options.pitch || 0,
          bearing: options.bearing || 0,
          antialias: true,
          attributionControl: false
        });
        
        mapRef.current = mapInstance;
        setMap(mapInstance);
        featureLoggers.map.log('[useMapbox] Map instance created successfully');

        addMapTelemetry({
          source: 'MAP',
          message: 'Tactical display initialized - Global view',
          level: 'info'
        });

        mapInstance.once('load', () => {
          if (!mapRef.current) return;

          try {
            // Hide native cursor inside map to rely on custom crosshair (insert once)
            const styleId = 'mc-hide-native-cursor';
            if (!document.getElementById(styleId)) {
              const cursorStyle = document.createElement('style');
              cursorStyle.id = styleId;
              cursorStyle.textContent = `
                .mapboxgl-map, .mapboxgl-canvas, .mapboxgl-canvas-container { cursor: none !important; }
              `;
              document.head.appendChild(cursorStyle);
            }

            // Enable globe projection for cinematic effect
            if (mapRef.current.setProjection) {
              mapRef.current.setProjection('globe');
              featureLoggers.map.log('[useMapbox] ✅ Globe projection enabled');
            } else {
              featureLoggers.map.warn('[useMapbox] ⚠️ Globe projection not available');
            }
            
            setIsLoaded(true);
            
            // Add tactical overlay (idempotent)
            const overlayData: GeoJSON.Feature<GeoJSON.Polygon> = {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]]
              }
            };

            const existingOverlaySource = mapRef.current.getSource('tactical-overlay') as mapboxgl.GeoJSONSource | undefined;
            if (existingOverlaySource?.setData) {
              existingOverlaySource.setData(overlayData);
            } else {
              mapRef.current.addSource('tactical-overlay', {
                type: 'geojson',
                data: overlayData
              });
            }

            // Insert tactical overlay below symbol layers
            const style = mapRef.current.getStyle();
            const firstSymbolLayer = style?.layers?.find(l => l.type === 'symbol');
            const beforeId = firstSymbolLayer?.id;

            if (!mapRef.current.getLayer('tactical-overlay')) {
              mapRef.current.addLayer({
                id: 'tactical-overlay',
                type: 'fill',
                source: 'tactical-overlay',
                paint: {
                  'fill-color': '#000000',
                  'fill-opacity': 0.3
                }
              }, beforeId);
            }

            // Add tactical grid
            const gridData = generateTacticalGrid();
            const existingGridSource = mapRef.current.getSource('tactical-grid') as mapboxgl.GeoJSONSource | undefined;
            if (existingGridSource?.setData) {
              existingGridSource.setData(gridData);
            } else {
              mapRef.current.addSource('tactical-grid', {
                type: 'geojson',
                data: gridData
              });
            }

            if (!mapRef.current.getLayer('tactical-grid')) {
              mapRef.current.addLayer({
                id: 'tactical-grid',
                type: 'line',
                source: 'tactical-grid',
                paint: {
                  'line-color': '#00ff00',
                  'line-width': 0.5,
                  'line-opacity': 0.3
                }
              });
            }

            // Start dramatic flyTo USA animation after delay
            setTimeout(() => {
              if (!mapRef.current) return;
              
              featureLoggers.map.log('[useMapbox] 🚀 Starting flyTo USA transition');
              addMapTelemetry({
                source: 'MAP',
                message: 'Engaging USA theater of operations...',
                level: 'info'
              });
              
              try { mapRef.current.stop(); } catch {}
              mapRef.current.flyTo({
                center: [-98.5795, 39.8283], // USA center
                zoom: 4,
                pitch: 0,
                bearing: 0,
                duration: 4000,
                essential: true,
                easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
              });
              
              setTimeout(() => {
                addMapTelemetry({
                  source: 'MAP',
                  message: 'USA tactical display operational',
                  level: 'success'
                });
              }, 4200);
            }, 500);
            
            addMapTelemetry({
              source: 'MAP',
              message: `Globe tactical display initialized`,
              level: 'success'
            });

          } catch (loadError) {
            criticalLog.error('[useMapbox] Map load configuration failed:', loadError);
            const error = loadError instanceof Error ? loadError : new Error('Map load failed');
            errorRef.current = error;
            setError(error);
            addMapTelemetry({
              source: 'MAP',
              message: `Map load failed: ${error.message}`,
              level: 'error'
            });
            throw loadError;
          }
        });

        mapInstance.on('error', (e) => {
          criticalLog.error('[useMapbox] Map error event:', e.error);
          errorRef.current = e.error;
          setError(e.error);
          addMapTelemetry({
            source: 'MAP',
            message: `Map error: ${e.error.message}`,
            level: 'error'
          });
        });

      } catch (error) {
        criticalLog.error('[useMapbox] Failed to create map instance:', error);
        const errorObj = error instanceof Error ? error : new Error('Map initialization failed');
        errorRef.current = errorObj;
        setError(errorObj);
        addMapTelemetry({
          source: 'MAP',
          message: `Map initialization failed: ${errorObj.message}`,
          level: 'error'
        });
        throw error;
      }
    };

    initializeMap().catch(error => {
      criticalLog.error('[useMapbox] Map initialization promise failed:', error);
    });

    return () => {
      try {
        featureLoggers.map.log('[useMapbox] Starting map cleanup...');
        
        const mapToCleanup = mapInstance || mapRef.current;
        if (mapToCleanup && !mapToCleanup._removed) {
          featureLoggers.map.log('[useMapbox] Removing map instance...');
          mapToCleanup.remove();
        }
        
        mapRef.current = null;
        setMap(null);
        setIsLoaded(false);
        setError(null);
        featureLoggers.map.log('[useMapbox] Map cleanup completed successfully');
        
      } catch (cleanupError) {
        criticalLog.warn('[useMapbox] Map cleanup error:', cleanupError);
        mapRef.current = null;
        setMap(null);
        setIsLoaded(false);
        setError(null);
      }
    };
  }, [addMapTelemetry, options.style, options.center, options.zoom, options.pitch, options.bearing]);

  // Map control functions
  const flyTo = useCallback((flyOptions: { center: [number, number]; zoom?: number; pitch?: number; bearing?: number; duration?: number }) => {
    if (!mapRef.current) return;
    
    mapRef.current.flyTo({
      center: flyOptions.center,
      zoom: flyOptions.zoom || mapRef.current.getZoom(),
      pitch: flyOptions.pitch || mapRef.current.getPitch(),
      bearing: flyOptions.bearing || mapRef.current.getBearing(),
      duration: flyOptions.duration || 2000,
      essential: true
    });
  }, []);

  const fitBounds = useCallback((bounds: mapboxgl.LngLatBounds, fitOptions?: any) => {
    if (!mapRef.current) return;
    
    mapRef.current.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: 10,
      ...fitOptions
    });
  }, []);

  const resetView = useCallback(() => {
    if (!mapRef.current) return;
    
    mapRef.current.flyTo({
      center: [-98.5795, 39.8283],
      zoom: 4,
      pitch: 0,
      bearing: 0,
      duration: 2000
    });

    addMapTelemetry({
      source: 'MAP',
      message: 'Tactical display reset to USA overview',
      level: 'info'
    });
  }, [addMapTelemetry]);

  return {
    map,
    mapContainer,
    isLoaded,
    error,
    flyTo,
    fitBounds,
    resetView
  };
}
