import { useEffect, useRef, useCallback } from 'react';
import type * as MapboxGL from 'mapbox-gl';
import { useMissionControl } from '../../store/missionControl';

// Lazy-loaded runtime instance to reduce initial bundle cost
let mapboxRuntime: any = null;

// Early cache of env token so dynamic import can retrieve it later reliably
try {
  const initialEnvToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
  if (initialEnvToken && initialEnvToken.trim()) {
    localStorage.setItem('mc-mapbox-token', initialEnvToken.trim());
  }
} catch {}

function resolveMapboxToken(): string | null {
  try {
    const envToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
    if (envToken && envToken.trim()) return envToken.trim();

    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem('mc-mapbox-token');
      if (cached && cached.trim()) return cached.trim();
    }

    if (typeof document !== 'undefined') {
      const meta = document.querySelector('meta[name="mapbox-token"]') as HTMLMetaElement | null;
      if (meta?.content && meta.content.trim()) return meta.content.trim();
    }

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyWin = window as any;
      const winToken = anyWin.MAPBOX_TOKEN || anyWin.__MC_MAPBOX_TOKEN;
      if (winToken && typeof winToken === 'string' && winToken.trim()) return winToken.trim();
    }
  } catch {}
  return null;
}

interface MapboxOptions {
  center?: [number, number];
  zoom?: number;
  style?: string;
  pitch?: number;
  bearing?: number;
}

interface UseMapboxReturn {
  map: MapboxGL.Map | null;
  mapContainer: React.RefObject<HTMLDivElement>;
  isLoaded: boolean;
  error: Error | null;
  flyTo: (options: { center: [number, number]; zoom?: number; pitch?: number; bearing?: number; duration?: number }) => void;
  fitBounds: (bounds: MapboxGL.LngLatBounds, options?: MapboxGL.FitBoundsOptions) => void;
  resetView: () => void;
}

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

export function useMapbox(options: MapboxOptions = {}): UseMapboxReturn {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxGL.Map | null>(null);
  const isLoadedRef = useRef(false);
  const errorRef = useRef<Error | null>(null);
  const { addTelemetry } = useMissionControl() as any;

  const addMapTelemetry = useCallback((log: any) => {
    addTelemetry(log);
  }, [addTelemetry]);

  // Map initialization
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    let mapInstance: MapboxGL.Map | null = null;

    const initializeMap = async () => {
      try {
        console.log('[useMapbox] Initializing map with API key:', import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.substring(0, 20) + '...');

        if (!mapboxRuntime) {
          const mod = await import('mapbox-gl');
          const gl: any = (mod as any)?.default ?? mod;
          mapboxRuntime = gl;
          const token = resolveMapboxToken();
          if (!token) {
            const err = new Error('Mapbox access token missing. Set VITE_MAPBOX_ACCESS_TOKEN or provide a <meta name="mapbox-token" content="...">');
            console.error('[useMapbox] ❌', err.message);
            errorRef.current = err;
            addMapTelemetry({
              source: 'MAP',
              message: err.message,
              level: 'error'
            });
            throw err;
          }
          mapboxRuntime.accessToken = token;
          try { localStorage.setItem('mc-mapbox-token', token); } catch {}
        }

        // Initialize map with global view for smooth transition from boot
        mapInstance = new mapboxRuntime.Map({
          container: mapContainer.current!,
          style: options.style || import.meta.env.VITE_MAPBOX_STYLE || 'mapbox://styles/mapbox/dark-v11',
          center: options.center || [0, 20],
          zoom: options.zoom || 1,
          pitch: options.pitch || 0,
          bearing: options.bearing || 0,
          antialias: true,
          attributionControl: false
        });
        
        map.current = mapInstance;
        console.log('[useMapbox] Map instance created successfully');

        addMapTelemetry({
          source: 'MAP',
          message: 'Tactical display initialized - Global view',
          level: 'info'
        });

        mapInstance.once('load', () => {
          if (!map.current) return;

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
            if (map.current.setProjection) {
              map.current.setProjection('globe');
              console.log('[useMapbox] ✅ Globe projection enabled');
            } else {
              console.log('[useMapbox] ⚠️ Globe projection not available');
            }
            
            isLoadedRef.current = true;
            
            // Add tactical overlay (idempotent)
            const overlayData = {
              type: 'Feature' as const,
              properties: {},
              geometry: {
                type: 'Polygon' as const,
                coordinates: [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]]
              }
            };

            const existingOverlaySource = map.current.getSource('tactical-overlay') as MapboxGL.GeoJSONSource | undefined;
            if (existingOverlaySource && (existingOverlaySource as any).setData) {
              (existingOverlaySource as any).setData(overlayData as any);
            } else {
              map.current.addSource('tactical-overlay', {
                type: 'geojson',
                data: overlayData as any
              });
            }

            // Insert tactical overlay below symbol layers
            const style = map.current.getStyle();
            const firstSymbolLayer = style?.layers?.find(l => l.type === 'symbol');
            const beforeId = firstSymbolLayer?.id;

            if (!map.current.getLayer('tactical-overlay')) {
              map.current.addLayer({
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
            const existingGridSource = map.current.getSource('tactical-grid') as MapboxGL.GeoJSONSource | undefined;
            if (existingGridSource && (existingGridSource as any).setData) {
              (existingGridSource as any).setData(gridData as any);
            } else {
              map.current.addSource('tactical-grid', {
                type: 'geojson',
                data: gridData as any
              });
            }

            if (!map.current.getLayer('tactical-grid')) {
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
            }

            // Start dramatic flyTo USA animation after delay
            setTimeout(() => {
              if (!map.current) return;
              
              console.log('[useMapbox] 🚀 Starting flyTo USA transition');
              addMapTelemetry({
                source: 'MAP',
                message: 'Engaging USA theater of operations...',
                level: 'info'
              });
              
              map.current.flyTo({
                center: [-98.5795, 39.8283], // USA center
                zoom: 4,
                pitch: 0,
                bearing: 0,
                duration: 4500,
                essential: true,
                easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
              });
              
              setTimeout(() => {
                addMapTelemetry({
                  source: 'MAP',
                  message: 'USA tactical display operational',
                  level: 'success'
                });
              }, 4800);
            }, 500);
            
            addMapTelemetry({
              source: 'MAP',
              message: `Globe tactical display initialized`,
              level: 'success'
            });

          } catch (loadError) {
            console.error('[useMapbox] Map load configuration failed:', loadError);
            errorRef.current = loadError instanceof Error ? loadError : new Error('Map load failed');
            addMapTelemetry({
              source: 'MAP',
              message: `Map load failed: ${loadError instanceof Error ? loadError.message : 'Unknown error'}`,
              level: 'error'
            });
            throw loadError;
          }
        });

        mapInstance.on('error', (e) => {
          console.error('[useMapbox] Map error event:', e.error);
          errorRef.current = e.error;
          addMapTelemetry({
            source: 'MAP',
            message: `Map error: ${e.error.message}`,
            level: 'error'
          });
        });

      } catch (error) {
        console.error('[useMapbox] Failed to create map instance:', error);
        errorRef.current = error instanceof Error ? error : new Error('Map initialization failed');
        addMapTelemetry({
          source: 'MAP',
          message: `Map initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          level: 'error'
        });
        throw error;
      }
    };

    initializeMap().catch(error => {
      console.error('[useMapbox] Map initialization promise failed:', error);
    });

    return () => {
      try {
        console.log('[useMapbox] Starting map cleanup...');
        
        const mapToCleanup = mapInstance || map.current;
        if (mapToCleanup && !mapToCleanup._removed) {
          console.log('[useMapbox] Removing map instance...');
          mapToCleanup.remove();
        }
        
        map.current = null;
        isLoadedRef.current = false;
        errorRef.current = null;
        console.log('[useMapbox] Map cleanup completed successfully');
        
      } catch (cleanupError) {
        console.warn('[useMapbox] Map cleanup error:', cleanupError);
        map.current = null;
        isLoadedRef.current = false;
        errorRef.current = null;
      }
    };
  }, [addMapTelemetry, options.style, options.center, options.zoom, options.pitch, options.bearing]);

  // Map control functions
  const flyTo = useCallback((flyOptions: { center: [number, number]; zoom?: number; pitch?: number; bearing?: number; duration?: number }) => {
    if (!map.current) return;
    
    map.current.flyTo({
      center: flyOptions.center,
      zoom: flyOptions.zoom || map.current.getZoom(),
      pitch: flyOptions.pitch || map.current.getPitch(),
      bearing: flyOptions.bearing || map.current.getBearing(),
      duration: flyOptions.duration || 2000,
      essential: true
    });
  }, []);

  const fitBounds = useCallback((bounds: MapboxGL.LngLatBounds, fitOptions?: MapboxGL.FitBoundsOptions) => {
    if (!map.current) return;
    
    map.current.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: 10,
      ...fitOptions
    });
  }, []);

  const resetView = useCallback(() => {
    if (!map.current) return;
    
    map.current.flyTo({
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
    map: map.current,
    mapContainer,
    isLoaded: isLoadedRef.current,
    error: errorRef.current,
    flyTo,
    fitBounds,
    resetView
  };
}
