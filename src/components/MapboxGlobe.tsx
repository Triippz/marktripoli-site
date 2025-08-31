import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapboxGlobeProps {
  className?: string;
  interactive?: boolean;
  onTransitionComplete?: () => void;
  onUserInteraction?: () => void;
}

function MapboxGlobe({ className = '', interactive = false, onTransitionComplete, onUserInteraction }: MapboxGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const animationFrameRef = useRef<number>();
  const hasUserInteractedRef = useRef(false);
  // Track transition targets and timing to validate completion
  const targetZoomRef = useRef<number | null>(null);
  const targetCenterRef = useRef<mapboxgl.LngLatLike | null>(null);
  const transitionStartRef = useRef<number | null>(null);

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
      zoom: 0.3, // Start much further out for dramatic zoom-in effect
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
      
      console.log('[MapboxGlobe] 🗺️ Map loaded successfully');
      console.log('[MapboxGlobe] Initial state - Zoom:', map.current.getZoom(), 'Center:', map.current.getCenter());

      try {
        // Try to set globe projection (may not be available in all versions)
        if (map.current.setProjection) {
          map.current.setProjection('globe');
          console.log('[MapboxGlobe] ✅ Globe projection enabled');
        } else {
          console.log('[MapboxGlobe] ⚠️ Globe projection not available');
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

        // Add strategic location markers
        map.current.addSource('strategic-sites', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  title: 'North American Command',
                  description: 'Strategic Operations Center',
                  threat: 'LOW'
                },
                geometry: {
                  type: 'Point',
                  coordinates: [-104.8197, 38.8339] // Colorado Springs (NORAD)
                }
              },
              {
                type: 'Feature',
                properties: {
                  title: 'European Command',
                  description: 'Intelligence Hub',
                  threat: 'MEDIUM'
                },
                geometry: {
                  type: 'Point',
                  coordinates: [2.3522, 48.8566] // Paris
                }
              },
              {
                type: 'Feature',
                properties: {
                  title: 'Pacific Command',
                  description: 'Naval Operations',
                  threat: 'LOW'
                },
                geometry: {
                  type: 'Point',
                  coordinates: [139.6503, 35.6762] // Tokyo
                }
              },
              {
                type: 'Feature',
                properties: {
                  title: 'Antarctic Research',
                  description: 'Scientific Monitoring',
                  threat: 'NONE'
                },
                geometry: {
                  type: 'Point',
                  coordinates: [0, -82] // Antarctica
                }
              }
            ]
          }
        });

        // Add markers layer
        map.current.addLayer({
          id: 'strategic-markers',
          type: 'circle',
          source: 'strategic-sites',
          paint: {
            'circle-radius': {
              base: 1.75,
              stops: [
                [12, 2],
                [22, 180]
              ]
            },
            'circle-color': [
              'match',
              ['get', 'threat'],
              'HIGH', '#ff0000',
              'MEDIUM', '#ffaa00',
              'LOW', '#00ff00',
              '#00ff00' // default
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add glow effect for markers
        map.current.addLayer({
          id: 'strategic-markers-glow',
          type: 'circle',
          source: 'strategic-sites',
          paint: {
            'circle-radius': {
              base: 1.75,
              stops: [
                [12, 6],
                [22, 200]
              ]
            },
            'circle-color': [
              'match',
              ['get', 'threat'],
              'HIGH', '#ff0000',
              'MEDIUM', '#ffaa00',
              'LOW', '#00ff00',
              '#00ff00' // default
            ],
            'circle-opacity': 0.2
          }
        }, 'strategic-markers');

        // Add click interaction for markers (only when interactive)
        map.current.on('click', 'strategic-markers', (e) => {
          if (!isInteractive) {
            console.log('[MapboxGlobe] Click ignored - not interactive yet');
            return;
          }
          
          console.log('[MapboxGlobe] Marker clicked:', e.features);
          const features = e.features;
          if (features && features.length > 0) {
            const feature = features[0];
            const properties = feature.properties;
            
            // Show tactical briefing popup
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div class="tactical-popup">
                  <div class="text-green-400 font-mono text-sm font-bold mb-2">${properties?.title || 'Unknown'}</div>
                  <div class="text-white font-mono text-xs mb-2">${properties?.description || 'No data'}</div>
                  <div class="flex items-center">
                    <span class="text-gray-400 font-mono text-xs mr-2">THREAT LEVEL:</span>
                    <span class="font-mono text-xs ${
                      properties?.threat === 'HIGH' ? 'text-red-400' :
                      properties?.threat === 'MEDIUM' ? 'text-yellow-400' : 
                      'text-green-400'
                    }">${properties?.threat || 'UNKNOWN'}</span>
                  </div>
                </div>
              `)
              .addTo(map.current);
          }
        });

        // Change cursor on hover
        map.current.on('mouseenter', 'strategic-markers', () => {
          if (isInteractive && map.current) {
            map.current.getCanvas().style.cursor = 'pointer';
            console.log('[MapboxGlobe] Cursor changed to pointer');
          }
        });

        map.current.on('mouseleave', 'strategic-markers', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
        });

        // Add comprehensive event debugging
        map.current.on('dragstart', () => {
          console.log('[MapboxGlobe] ✅ DRAG STARTED - User is dragging');
          if (isInteractive && !hasUserInteractedRef.current) {
            hasUserInteractedRef.current = true;
            onUserInteraction?.();
          }
        });

        map.current.on('drag', () => {
          console.log('[MapboxGlobe] ✅ DRAGGING - Map is moving');
        });

        map.current.on('dragend', () => {
          console.log('[MapboxGlobe] ✅ DRAG ENDED');
        });

        map.current.on('zoomstart', () => {
          console.log('[MapboxGlobe] ✅ ZOOM STARTED');
          if (isInteractive && !hasUserInteractedRef.current) {
            hasUserInteractedRef.current = true;
            onUserInteraction?.();
          }
        });

        map.current.on('zoom', () => {
          console.log('[MapboxGlobe] ✅ ZOOMING');
        });

        map.current.on('rotatestart', () => {
          // console.log('[MapboxGlobe] ✅ ROTATE STARTED');
          if (isInteractive && !hasUserInteractedRef.current) {
            hasUserInteractedRef.current = true;
            onUserInteraction?.();
          }
        });

        map.current.on('rotate', () => {
          // console.log('[MapboxGlobe] ✅ ROTATING');
        });

        // Add mouse event debugging on the canvas
        map.current.on('mousedown', (e) => {
          console.log('[MapboxGlobe] 🖱️ MOUSEDOWN at:', e.lngLat, 'Interactive:', isInteractive);
          if (isInteractive && !hasUserInteractedRef.current) {
            hasUserInteractedRef.current = true;
            onUserInteraction?.();
          }
        });

        map.current.on('mouseup', (e) => {
          console.log('[MapboxGlobe] 🖱️ MOUSEUP at:', e.lngLat);
        });

        map.current.on('mousemove', (e) => {
          // Only log occasionally to avoid spam
          if (Math.random() < 0.01) {
            console.log('[MapboxGlobe] 🖱️ MOUSEMOVE at:', e.lngLat);
          }
        });

        // Start rotation
        startRotation();
        setMapReady(true);
        console.log('[MapboxGlobe] 🎯 Map fully initialized and ready');
        console.log('[MapboxGlobe] State check - Interactive prop:', interactive, 'Map Ready:', true);
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

  // Effect to handle interactive mode transition
  useEffect(() => {
    console.log('[MapboxGlobe] 🎯 Interactive transition useEffect triggered:', {
      interactive,
      mapReady,
      isInteractive,
      isTransitioning
    });
    
    if (interactive && mapReady && !isInteractive && !isTransitioning) {
      console.log('[MapboxGlobe] ✅ All conditions met - calling transitionToInteractive()');
      transitionToInteractive();
    } else {
      console.log('[MapboxGlobe] ❌ Conditions not met for transition:', {
        'interactive prop': interactive,
        'map ready': mapReady,
        'not already interactive': !isInteractive,
        'not transitioning': !isTransitioning
      });
    }
  }, [interactive, mapReady, isInteractive, isTransitioning]);

  // Effect to manage rotation animation based on interactive state
  useEffect(() => {
    if (mapReady) {
      if (isInteractive || isTransitioning) {
        // Stop rotation when interactive or transitioning
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
          console.log('[MapboxGlobe] Rotation stopped via effect');
        }
      } else {
        // Start rotation only if not interactive and not transitioning
        startRotation();
      }
    }
  }, [isInteractive, isTransitioning, mapReady]);

  const transitionToInteractive = () => {
    if (!map.current || isTransitioning) return;

    console.log('[MapboxGlobe] Starting transition to interactive mode');
    setIsTransitioning(true);

    // Stop the rotation animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      console.log('[MapboxGlobe] Stopped rotation animation');
    }

    console.log('[MapboxGlobe] 🚀 STARTING DRAMATIC ZOOM TRANSITION');
    console.log('[MapboxGlobe] Current state before flyTo:', {
      zoom: map.current.getZoom(),
      center: map.current.getCenter(),
      isMoving: map.current.isMoving(),
      isZooming: map.current.isZooming()
    });
    console.log('[MapboxGlobe] Target: zoom 3.2, center [0,20]');
    
    try {
      // Dramatic smooth transition to interactive view
      const targetCenter: mapboxgl.LngLatLike = [0, 20];
      const targetZoom = 3.2;
      targetCenterRef.current = targetCenter;
      targetZoomRef.current = targetZoom;
      transitionStartRef.current = Date.now();

      // Attempt primary flight animation
      map.current.stop(); // clear any in-flight transitions
      map.current.flyTo({
        center: targetCenter, // Slight adjustment to show more interesting areas
        zoom: targetZoom, // Dramatic zoom-in
        pitch: 0,
        bearing: 0,
        duration: 4500, // 4.5 second transition
        essential: true, // Override prefers-reduced-motion
        easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
      });
      
      console.log('[MapboxGlobe] ✅ flyTo command executed successfully');
      
      // If the map did not start moving (reduced motion or internal short-circuit),
      // trigger a fallback easeTo after a short check.
      setTimeout(() => {
        try {
          if (!map.current) return;
          const moving = map.current.isMoving() || map.current.isZooming();
          if (!moving) {
            console.log('[MapboxGlobe] ⚠️ flyTo did not start moving; applying easeTo fallback');
            map.current.easeTo({
              center: targetCenter,
              zoom: targetZoom,
              pitch: 0,
              bearing: 0,
              duration: 4500,
              easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
              animate: true as any, // TS: property exists on easeTo options
              essential: true as any,
            } as any);

            // Secondary guard: if still not moving shortly after, perform manual camera animation
            setTimeout(() => {
              try {
                if (!map.current) return;
                const stillNotMoving = !(map.current.isMoving() || map.current.isZooming());
                if (stillNotMoving) {
                  console.log('[MapboxGlobe] 🚧 easeTo did not initiate; starting manual camera animation');
                  const mapRef = map.current;
                  const startZoom = mapRef.getZoom();
                  const startCenter = mapRef.getCenter();
                  const duration = 4500;
                  const startTs = performance.now();
                  const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

                  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
                  const animate = () => {
                    if (!map.current) return;
                    const now = performance.now();
                    const t = Math.min(1, (now - startTs) / duration);
                    const et = ease(t);

                    const tz = lerp(startZoom, targetZoom, et);
                    const tlng = lerp(startCenter.lng, Array.isArray(targetCenter) ? targetCenter[0] : (targetCenter as any).lng, et);
                    const tlat = lerp(startCenter.lat, Array.isArray(targetCenter) ? targetCenter[1] : (targetCenter as any).lat, et);

                    mapRef.setZoom(tz);
                    mapRef.setCenter([tlng, tlat]);

                    if (t < 1 && isTransitioning) {
                      requestAnimationFrame(animate);
                    }
                  };
                  requestAnimationFrame(animate);
                }
              } catch (e) {
                console.warn('[MapboxGlobe] Manual animation fallback failed:', e);
              }
            }, 250);
          }
        } catch (e) {
          console.warn('[MapboxGlobe] Fallback easeTo failed:', e);
        }
      }, 150);
      
    } catch (error) {
      console.error('[MapboxGlobe] ❌ flyTo command failed:', error);
    }

    // Progress logging disabled (was noisy)

    // Use robust completion detection (idle/moveend + target reached)
    const enableInteractions = () => {
      if (!map.current) return;
      
      console.log('[MapboxGlobe] Enabling interactive controls');
      
      // Enable all interaction methods
      map.current.dragPan.enable();
      map.current.dragRotate.enable();
      map.current.scrollZoom.enable();
      map.current.doubleClickZoom.enable();
      map.current.touchZoomRotate.enable();
      
      // Ensure map is fully interactive
      map.current._interactive = true;
      
      // Focus the map canvas to ensure it receives events
      const canvas = map.current.getCanvas();
      if (canvas) {
        canvas.focus();
        canvas.tabIndex = 0; // Make it focusable
        console.log('[MapboxGlobe] Map canvas focused and made focusable');
      }
      
      console.log('[MapboxGlobe] Interactive controls enabled:', {
        dragPan: map.current.dragPan.isEnabled(),
        dragRotate: map.current.dragRotate.isEnabled(),
        scrollZoom: map.current.scrollZoom.isEnabled()
      });
      
      setIsInteractive(true);
      setIsTransitioning(false);
      
      if (onTransitionComplete) {
        onTransitionComplete();
      }
      
      // Remove completion listeners if present
      if (map.current && idleHandler) {
        map.current.off('idle', idleHandler);
      }
      if (map.current && moveEndHandler) {
        map.current.off('moveend', moveEndHandler);
      }
    };

    // Listen for completion using 'idle' (fires when map stops all transitions)
    const idleHandler = (_e) => {

      // Validate we actually reached the intended camera
      try {
        if (!map.current) return;
        const currentZoom = map.current.getZoom();
        const currentCenter = map.current.getCenter();
        const targetZoom = targetZoomRef.current ?? currentZoom;
        const targetCenter = targetCenterRef.current ?? currentCenter;

        const zoomOk = Math.abs(currentZoom - targetZoom) < 0.05;
        const lngOk = Math.abs(currentCenter.lng - (Array.isArray(targetCenter) ? targetCenter[0] : (targetCenter as any).lng)) < 0.5;
        const latOk = Math.abs(currentCenter.lat - (Array.isArray(targetCenter) ? targetCenter[1] : (targetCenter as any).lat)) < 0.5;
        const timeOk = transitionStartRef.current ? Date.now() - transitionStartRef.current > 1000 : true; // ensure at least 1s for UX

        if (zoomOk && lngOk && latOk && timeOk) {
          enableInteractions();
        }
      } catch (err) {
        console.warn('[MapboxGlobe] Idle validation failed; relying on duration fallback:', err);
      }
    };

    map.current.on('idle', idleHandler);
    console.log('[MapboxGlobe] 👂 Added idle event listener');

    // Removed moveend listener to avoid noisy repeated logs and premature triggers
    
    // Primary completion by duration: enable right after planned flight duration
    const PLANNED_MS = 4500;
    setTimeout(() => {
      if (isTransitioning) {
        console.log('[MapboxGlobe] ⏲️ Duration reached; enabling interactions');
        enableInteractions();
      }
    }, PLANNED_MS + 150);

    // Fallback timeout in case neither idle nor duration path fired
    setTimeout(() => {
      if (isTransitioning) {
        console.log('[MapboxGlobe] Fallback: Enabling controls via timeout');
        enableInteractions();
      }
    }, 6000);
  };

  const startRotation = () => {
    if (!map.current || isInteractive || isTransitioning) {
      console.log('[MapboxGlobe] Rotation blocked - Interactive:', isInteractive, 'Transitioning:', isTransitioning);
      return;
    }

    console.log('[MapboxGlobe] Starting rotation animation');
    let bearing = 0;
    const rotationSpeed = 0.1; // Slow rotation

    const animate = () => {
      // Stop animation if interactive mode is enabled or transitioning
      if (!map.current || isInteractive || isTransitioning) {
        console.log('[MapboxGlobe] Stopping rotation - Interactive:', isInteractive, 'Transitioning:', isTransitioning);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
        return;
      }

      bearing += rotationSpeed;
      if (bearing >= 360) bearing = 0;

      map.current.setBearing(bearing);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  return (
    <div 
      className={`fixed inset-0 w-full h-full ${isInteractive ? 'z-20' : 'z-0'} ${className} ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`}
      style={{ 
        background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)'
      }}
    >
      {/* Map container */}
      <div 
        ref={mapContainer} 
        className={`mapbox-map w-full h-full ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`} 
      />

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

      {/* Transition to interactive mode overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center">
            <div className="floating-card-glow p-6 max-w-md">
              <div className="flex items-center justify-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping mr-3" />
                <div className="text-green-400 font-mono text-xl font-bold animate-pulse">
                  ENGAGING EARTH CONTROL
                </div>
              </div>
              <div className="text-white font-mono text-sm mb-4">
                🌍 Bringing Earth into operational range...
              </div>
              <div className="w-full bg-gray-900/50 rounded-full h-2 mb-3 border border-green-500/20">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 animate-pulse"
                  style={{
                    width: '100%',
                    animation: 'pulse 1.5s ease-in-out infinite alternate, grow 4.5s ease-out forwards'
                  }}
                />
              </div>
              <div className="text-gray-400 font-mono text-xs">
                Initializing interactive controls...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive control hints */}
      {isInteractive && (
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
          <div className="floating-card-glow p-3 animate-pulse">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              <div className="text-green-500 text-xs font-mono font-bold">
                EARTH CONTROL ACTIVE
              </div>
            </div>
            <div className="text-white text-xs font-mono space-y-1">
              <div className="flex items-center">
                <span className="w-12 text-green-400">DRAG:</span>
                <span>Rotate Earth</span>
              </div>
              <div className="flex items-center">
                <span className="w-12 text-green-400">SCROLL:</span>
                <span>Zoom In/Out</span>
              </div>
              <div className="flex items-center">
                <span className="w-12 text-green-400">CLICK:</span>
                <span>Select Sites</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MapboxGlobe;
