import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import { useMissionControl } from '../../store/missionControl';
import type { SiteData } from '../../types';
import type { CareerMarker, CareerMapData } from '../../types/careerData';
import { resumeDataService } from '../../services/resumeDataService';
import sitesData from '../../data/sites.json';
import FlightPathAnimations from './FlightPathAnimations';
import 'mapbox-gl/dist/mapbox-gl.css';
import { registerMapEasterEggs, getGeofences, goToGeofence } from '../../utils/easterEggs/mapEasterEggs';
import { createDefaultFS, resolvePath as fsResolve, isDir as fsIsDir, listDir as fsList, readFile as fsRead } from '../../utils/fauxFS';

// Set Mapbox access token from environment variables or fallback to demo token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapboxSceneProps {
  sites?: SiteData[];
}

function MapboxScene({ sites: propSites }: MapboxSceneProps = {}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const stylesRef = useRef<HTMLStyleElement[]>([]);
  const eggsRef = useRef<{ dispose: () => void } | null>(null);
  const { selectSite, selectedSite, addTelemetry, unlockEasterEgg, triggerAlert } = useMissionControl() as any;
  
  // Legacy sites data (keeping for backward compatibility)
  const [sites, setSites] = useState<SiteData[]>(propSites || sitesData as SiteData[]);
  
  // New career data from resume
  const [careerData, setCareerData] = useState<CareerMapData | null>(null);
  const [selectedCareerMarker, setSelectedCareerMarker] = useState<CareerMarker | null>(null);
  
  const [initialized, setInitialized] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentCoords, setCurrentCoords] = useState({ lat: 42.3601, lng: -71.0589 }); // Boston
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });
  const [cursorPoint, setCursorPoint] = useState<{ x: number; y: number } | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);
  const [secretLines, setSecretLines] = useState<string[]>(["MAP-TERM v0.1 — type 'help'", ""]);
  const [secretInput, setSecretInput] = useState('');
  const [awaitPass, setAwaitPass] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [wrongPass, setWrongPass] = useState(0);
  const [alertMode, setAlertMode] = useState(false);
  const [puzzleStage, setPuzzleStage] = useState(0);
  const fsRoot = useState(createDefaultFS())[0];
  const [cwd, setCwd] = useState<string>('/');

  // Memoize telemetry function to prevent infinite loops
  const addMapTelemetry = useCallback((log: any) => {
    addTelemetry(log);
  }, [addTelemetry]);

  // Initialize component with career data from resume
  useEffect(() => {
    if (!initialized) {
      const initializeCareerData = async () => {
        try {
          console.log('[MapboxScene] Loading career mission data from resume.json');
          
          // Load career data from resume
          const careerMapData = await resumeDataService.getCareerMapData();
          setCareerData(careerMapData);
          
          // Keep legacy sites for hobbies/projects (can be filtered later)
          setSites(sitesData as SiteData[]);
          
          setInitialized(true);
          
          addMapTelemetry({
            source: 'MAP',
            message: `Career mission data loaded - ${careerMapData.markers.length} career locations operational`,
            level: 'info'
          });
        } catch (initError) {
          console.error('[MapboxScene] Critical career data initialization error:', initError);
          addMapTelemetry({
            source: 'MAP',
            message: `Career data initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`,
            level: 'error'
          });
          // Still mark as initialized to prevent retry loops
          setInitialized(true);
          throw initError; // Let error boundary handle it
        }
      };

      initializeCareerData();
    }
  }, [initialized, addMapTelemetry]);



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

  // Secret terminal hotkeys (map context)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`' || (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't')) {
        e.preventDefault(); setSecretOpen(v => !v);
      }
      if (e.key === 'Escape' && secretOpen) setSecretOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [secretOpen]);

  const promptUser = () => (admin ? 'root@map' : 'guest@map') + ':' + cwd + '$';
  const addLine = (s: string = '') => setSecretLines(prev => [...prev, s]);
  const saveAch = (k: string) => {
    try { const key = 'mcAchievements'; const curr = JSON.parse(localStorage.getItem(key) || '{}'); curr[k] = { unlockedAt: Date.now() }; localStorage.setItem(key, JSON.stringify(curr)); } catch {}
  };
  const listRegions = () => getGeofences().map(g => g.key).join(', ');
  const listCompanies = () => (careerData?.markers || [])
    .map(m => m.name)
    .filter((v, i, a) => !!v && a.indexOf(v) === i)
    .join(', ');
  const goToHQ = (name: string) => {
    if (!map.current) return false;
    const target = (careerData?.markers || []).find(m => (m.name || '').toLowerCase().includes(name.toLowerCase()))
    if (!target) return false;
    const d = 0.3;
    const bounds: [[number, number],[number, number]] = [[target.location.lng - d, target.location.lat - d],[target.location.lng + d, target.location.lat + d]];
    try {
      (map.current as any).fitBounds(bounds as any, { padding: { top: 50, bottom: 50, left: 50, right: 50 }, maxZoom: 10, duration: 1200, essential: true });
    } catch {
      map.current.flyTo({ center: [target.location.lng, target.location.lat], zoom: 10, duration: 1200, essential: true });
    }
    return true;
  };
  const runCmd = (raw: string) => {
    const input = raw.trim();
    if (puzzleStage === 1) { if (input.toLowerCase().includes('watch') && input.toLowerCase().includes('skies')) { addLine('Probe complete. Anomalies acknowledged.'); setPuzzleStage(0); try { unlockEasterEgg('hidden_commands'); } catch {} } else { addLine('Hint: a classic UFO trope.'); } return; }
    if (awaitPass) {
      if (input.toLowerCase() === 'legion') { addLine('ACCESS GRANTED.'); setAdmin(true); setAwaitPass(false); setWrongPass(0); saveAch('map_admin'); try { unlockEasterEgg('hidden_commands'); } catch {} }
      else { addLine('ACCESS DENIED.'); const n = wrongPass + 1; setWrongPass(n); setAwaitPass(false); if (n >= 3) { setAlertMode(true); try { triggerAlert(6000); } catch {}; setTimeout(() => setAlertMode(false), 4000); setWrongPass(0); } }
      return;
    }
    if (!input) { addLine(); return; }
    const [cmd, ...args] = input.split(/\s+/);
    switch (cmd.toLowerCase()) {
      case 'help':
        addLine('Commands: help, clear, login, regions, companies, goto <key>, goto hq <company>, hq <company>, zoom <n>, center <lng> <lat>, scan, close');
        addLine('Linux-ish: pwd, ls, whoami, uname -a, date, echo <txt>, cat <file>, man <cmd>, sudo su');
        break;
      case 'clear':
      case 'cls':
        setSecretLines(["MAP-TERM v0.1 — type 'help'", ""]);
        break;
      case 'close': setSecretOpen(false); break;
      case 'login': setAwaitPass(true); addLine('Password:'); break;
      case 'regions': addLine(listRegions()); break;
      case 'companies': addLine(listCompanies() || '(none)'); break;
      case 'probe': addLine('PROBE: Complete the phrase to calibrate sensors. "_____ the _____"'); setPuzzleStage(1); break;
      case 'goto': {
        if (!args[0]) { addLine('Usage: goto <region-key> | goto hq <company>'); break; }
        if (args[0].toLowerCase() === 'hq') {
          const q = args.slice(1).join(' ');
          if (!q) { addLine('Usage: goto hq <company>'); break; }
          const ok = goToHQ(q);
          addLine(ok ? `Navigating to ${q} HQ…` : `Unknown company: ${q}`);
          if (ok) { saveAch(`visit_hq_${q.toLowerCase()}`); setSecretOpen(false); }
        } else {
          const key = (args[0] || '').toLowerCase();
          const ok = !!(map.current && goToGeofence(map.current, key, 10));
          addLine(ok ? `Navigating to ${key}…` : `Unknown region: ${key}`);
          if (ok) { saveAch(`visit_${key}`); try { unlockEasterEgg('cartographer_hint'); } catch {}; setSecretOpen(false); }
        }
        break; }
      case 'hq': {
        const q = args.join(' ');
        if (!q) { addLine('Usage: hq <company>'); break; }
        const ok = goToHQ(q);
        addLine(ok ? `Navigating to ${q} HQ…` : `Unknown company: ${q}`);
        if (ok) { saveAch(`visit_hq_${q.toLowerCase()}`); setSecretOpen(false); }
        break; }
      case 'zoom': {
        const n = parseFloat(args[0]); if (!map.current || isNaN(n)) { addLine('Usage: zoom <number>'); break; }
        map.current.zoomTo(n, { duration: 500 }); addLine(`Zoom ${n}`); break; }
      case 'center': {
        const lng = parseFloat(args[0]); const lat = parseFloat(args[1]); if (!map.current || isNaN(lng) || isNaN(lat)) { addLine('Usage: center <lng> <lat>'); break; }
        map.current.flyTo({ center: [lng, lat], essential: true, duration: 800 }); addLine(`Center ${lng}, ${lat}`); break; }
      case 'scan': {
        // Perform a quick satellite streak and ping
        try { addMapTelemetry({ source: 'MAP-TERM', message: 'Scan initiated', level: 'info' }); } catch {}
        // Random move and back
        if (map.current) { const c = map.current.getCenter(); map.current.easeTo({ bearing: map.current.getBearing() + 20, duration: 600 }); setTimeout(() => map.current?.easeTo({ center: c, duration: 600 }), 700); }
        addLine('Scanning…'); saveAch('map_scan'); try { unlockEasterEgg('map_scan'); } catch {}
        break; }
      default:
        if (cmd === 'pwd') { addLine(cwd); break; }
        if (cmd === 'cd') { const target = (args[0] || '/'); const next = fsResolve(cwd, target); if (fsIsDir(fsRoot, next)) setCwd(next); else addLine(`cd: no such file or directory: ${target}`); break; }
        if (cmd === 'ls') { const target = fsResolve(cwd, args[0] || '.'); const list = fsList(fsRoot, target); if (list) addLine(list.join('  ')); else addLine(`ls: cannot access '${args[0] || '.'}': Not a directory`); break; }
        if (cmd === 'whoami') { addLine(admin ? 'root' : 'guest'); break; }
        if (cmd === 'uname') { addLine(args[0] === '-a' ? 'Linux mc 6.2.0-mc #1 SMP x86_64 GNU/Linux' : 'Linux'); break; }
        if (cmd === 'date') { addLine(new Date().toString()); break; }
        if (cmd === 'echo') { addLine(args.join(' ')); break; }
        if (cmd === 'cat') {
          const fileArg = args[0]; if (!fileArg) { addLine('cat: missing file operand'); break; }
          let path = fsResolve(cwd, fileArg);
          if (!fsRead(fsRoot, path) && !fileArg.includes('/')) path = fsResolve('/docs', fileArg);
          if (path.endsWith('/secrets') && !admin) { addLine('cat: secrets: Permission denied'); break; }
          // Specials
          if (path.endsWith('/docs/regions.txt')) { addLine(getGeofences().map(g => g.key).join('\n')); break; }
          if (path.endsWith('/docs/companies.txt')) { addLine(listCompanies() || '(none)'); break; }
          const content = fsRead(fsRoot, path);
          addLine(content != null ? content : `cat: ${fileArg}: No such file`);
          break;
        }
        if (cmd === 'man') { addLine('No manual entry. This is not a real shell.'); break; }
        if (cmd === 'sudo') { if ((args[0] || '').toLowerCase() === 'su') { setAlertMode(true); try { triggerAlert(6000); } catch {}; setTimeout(() => setAlertMode(false), 4000); addLine('sudo: Authentication failure'); } else { addLine('sudo: permission denied'); } break; }
        addLine(`Unknown: ${cmd}`);
    }
  };

  // Initialize map once with comprehensive error handling
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    let mapInstance: mapboxgl.Map | null = null;

    const initializeMap = async () => {
      try {
        console.log('[MapboxScene] Initializing map with API key:', import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.substring(0, 20) + '...');

        // Initialize map with global view for smooth transition from boot
        mapInstance = new mapboxgl.Map({
          container: mapContainer.current!,
          // Use dark style for higher contrast (labels included)
          style: import.meta.env.VITE_MAPBOX_STYLE || 'mapbox://styles/mapbox/dark-v11',
          center: [0, 20], // Start with global view like boot sequence
          zoom: 1, // Start zoomed out for dramatic flyTo effect
          pitch: 0,
          bearing: 0,
          antialias: true,
          attributionControl: false
        });
        
        map.current = mapInstance;
        console.log('[MapboxScene] Map instance created successfully');

        addMapTelemetry({
          source: 'MAP',
          message: 'Tactical display initialized - USA theater of operations',
          level: 'info'
        });

        mapInstance.on('load', () => {
          if (!map.current) return;

          try {
            // Hide native cursor inside map to rely on custom crosshair
            const cursorStyle = document.createElement('style');
            cursorStyle.textContent = `
              .mapboxgl-map, .mapboxgl-canvas, .mapboxgl-canvas-container { cursor: none !important; }
            `;
            document.head.appendChild(cursorStyle);
            stylesRef.current.push(cursorStyle);

            // Enable globe projection for cinematic effect
            if (map.current.setProjection) {
              map.current.setProjection('globe');
              console.log('[MapboxScene] ✅ Globe projection enabled');
            } else {
              console.log('[MapboxScene] ⚠️ Globe projection not available in this Mapbox version');
            }
            
            setMapLoaded(true);
            // Register map easter eggs (random idle triggers)
            try {
              eggsRef.current = registerMapEasterEggs(map.current, { container: mapContainer.current!, enableRandom: true });
            } catch (eggErr) {
              console.warn('[MapboxScene] Map easter eggs registration failed:', eggErr);
            }

            // Handle HQ query param navigation
            try {
              const search = new URLSearchParams(window.location.search);
              const hq = search.get('hq');
              if (hq) {
                // Wait a tick for careerData to load if needed
                setTimeout(() => {
                  const ok = goToHQ(hq);
                  if (ok) {
                    search.delete('hq');
                    const newUrl = window.location.pathname + (search.toString() ? ('?'+search.toString()) : '') + window.location.hash;
                    window.history.replaceState({}, '', newUrl);
                  }
                }, 600);
              }
            } catch {}
            
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

            // Insert tactical overlay below label (symbol) layers so city names stay visible
            const style = map.current.getStyle();
            const firstSymbolLayer = style?.layers?.find(l => l.type === 'symbol');
            const beforeId = firstSymbolLayer?.id;

            map.current.addLayer({
              id: 'tactical-overlay',
              type: 'fill',
              source: 'tactical-overlay',
              paint: {
                'fill-color': '#000000',
                'fill-opacity': 0.3
              }
            }, beforeId);

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

            // Start dramatic flyTo USA animation after a brief delay
            setTimeout(() => {
              if (!map.current) return;
              
              console.log('[MapboxScene] 🚀 Starting flyTo USA transition');
              addMapTelemetry({
                source: 'MAP',
                message: 'Engaging USA theater of operations...',
                level: 'info'
              });
              
              map.current.flyTo({
                center: [-98.5795, 39.8283], // USA center
                zoom: 4,
                pitch: 0, // Overhead view
                bearing: 0,
                duration: 4500, // Match boot sequence timing
                essential: true,
                easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t) // Smooth easing
              });
              
              // Update telemetry when transition completes
              setTimeout(() => {
                addMapTelemetry({
                  source: 'MAP',
                  message: 'USA tactical display operational',
                  level: 'success'
                });
              }, 4800);
            }, 500); // Small delay for smooth boot transition
            
            addMapTelemetry({
              source: 'MAP',
              message: `Globe tactical display initialized`,
              level: 'success'
            });

            // Update coordinates and screen point on map move
            map.current.on('mousemove', (e) => {
              setCurrentCoords({
                lat: parseFloat(e.lngLat.lat.toFixed(4)),
                lng: parseFloat(e.lngLat.lng.toFixed(4))
              });
              // e.point is relative to map container
              setCursorPoint({ x: e.point.x, y: e.point.y });
            });
          } catch (loadError) {
            console.error('[MapboxScene] Map load configuration failed:', loadError);
            addMapTelemetry({
              source: 'MAP',
              message: `Map load failed: ${loadError instanceof Error ? loadError.message : 'Unknown error'}`,
              level: 'error'
            });
            throw loadError;
          }
        });

        mapInstance.on('error', (e) => {
          console.error('[MapboxScene] Map error event:', e.error);
          addMapTelemetry({
            source: 'MAP',
            message: `Map error: ${e.error.message}`,
            level: 'error'
          });
        });

      } catch (error) {
        console.error('[MapboxScene] Failed to create map instance:', error);
        addMapTelemetry({
          source: 'MAP',
          message: `Map initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          level: 'error'
        });
        throw error; // Let error boundary handle it
      }
    };

    // Initialize map with error handling
    initializeMap().catch(error => {
      console.error('[MapboxScene] Map initialization promise failed:', error);
      // Error boundary will catch the throw from initializeMap
    });

    return () => {
      try {
        console.log('[MapboxScene] Starting map cleanup...');
        try { eggsRef.current?.dispose(); } catch {}
        
        // Clean up markers first
        markersRef.current.forEach(marker => {
          try {
            marker.remove();
          } catch (error) {
            console.warn('[MapboxScene] Error removing marker during cleanup:', error);
          }
        });
        markersRef.current = [];
        
        // Clean up dynamically added styles
        stylesRef.current.forEach(style => {
          try {
            if (style.parentNode) {
              style.parentNode.removeChild(style);
            }
          } catch (error) {
            console.warn('[MapboxScene] Error removing style during cleanup:', error);
          }
        });
        stylesRef.current = [];
        
        // Clean up the map instance (only call remove() once)
        const mapToCleanup = mapInstance || map.current;
        if (mapToCleanup && !mapToCleanup._removed) {
          console.log('[MapboxScene] Removing map instance...');
          mapToCleanup.remove();
        }
        
        // Clear the reference
        map.current = null;
        console.log('[MapboxScene] Map cleanup completed successfully');
        
      } catch (cleanupError) {
        console.warn('[MapboxScene] Map cleanup error:', cleanupError);
        // Still clear the reference even if cleanup failed
        map.current = null;
      }
    };
  }, [addMapTelemetry]);

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

  // Create enhanced career markers with logos and category styling
  const createCareerMarkerElement = useCallback((marker: CareerMarker): HTMLElement => {
    const markerElement = document.createElement('div');
    markerElement.className = 'career-marker';
    
    const categoryStyle = resumeDataService.getCategoryStyle(marker.type);
    
    // Simplified marker (no animation) to avoid transform side-effects
    markerElement.innerHTML = `
      <div class="marker-container">
        ${marker.logo ? 
          `<div class="marker-logo">
             <img src="${marker.logo}" alt="${marker.name}" />
           </div>` : 
          `<div class="marker-fallback"></div>`
        }
      </div>
    `;
    
    markerElement.style.cssText = `
      width: 32px;
      height: 32px;
      cursor: none;
    `;

    // Add category-specific styling
    const style = document.createElement('style');
    style.textContent = `
      .career-marker .marker-container {
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
      }
      
      .career-marker .marker-logo {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid ${categoryStyle.color};
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        position: relative;
      }
      
      .career-marker .marker-logo img {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        object-fit: contain;
      }
      
      .career-marker .marker-fallback {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: ${categoryStyle.color};
        border: 2px solid ${categoryStyle.color};
        box-shadow: 0 0 8px ${categoryStyle.glowColor};
      }
    `;
    document.head.appendChild(style);
    stylesRef.current.push(style);

    return markerElement;
  }, []);

  const addCareerMarkers = useCallback(() => {
    if (!map.current || !careerData) return;

    // Clear existing markers first
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (error) {
        console.warn('[MapboxScene] Error removing marker:', error);
      }
    });
    markersRef.current = [];

    // Create career markers
    careerData.markers.forEach((careerMarker) => {
      const markerElement = createCareerMarkerElement(careerMarker);
      
      const coordinates: [number, number] = [careerMarker.location.lng, careerMarker.location.lat];
      console.log(`[MapboxScene] 📍 Adding ${careerMarker.type} marker:`, {
        company: careerMarker.name,
        position: careerMarker.position,
        coordinates: coordinates,
        location: `${careerMarker.location.city}, ${careerMarker.location.region}`,
        codename: careerMarker.codename
      });
      
      // Create mapbox marker with center anchor to prevent position drift
      const mapboxMarker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center' // Critical: centers marker on exact coordinates
      })
        .setLngLat(coordinates)
        .addTo(map.current!);
      
      // Store marker reference for cleanup
      markersRef.current.push(mapboxMarker);

      // Add click handler
      markerElement.addEventListener('click', () => {
        setSelectedCareerMarker(careerMarker);
        addMapTelemetry({
          source: 'MAP',
          message: `Engaging career target: ${careerMarker.codename}`,
          level: 'success'
        });

        // Fly to career location
        map.current?.flyTo({
          center: [careerMarker.location.lng, careerMarker.location.lat],
          zoom: 8,
          pitch: 10, // More overhead when engaging
          bearing: 0,
          duration: 2000
        });
      });

      // Enhanced popup with career information
      const popup = new mapboxgl.Popup({
        offset: 35,
        closeButton: false,
        className: 'tactical-popup career-popup'
      }).setHTML(`
        <div class="career-popup-content">
          <div class="popup-header">
            <div class="company-name">${careerMarker.name}</div>
            <div class="mission-codename">${careerMarker.codename}</div>
          </div>
          <div class="popup-body">
            <div class="position">${careerMarker.position}</div>
            <div class="date-range">${resumeDataService.getDateRange(careerMarker)}</div>
            <div class="location">${careerMarker.location.city}, ${careerMarker.location.region}</div>
            <div class="coordinates">${resumeDataService.getTacticalCoords(careerMarker)}</div>
          </div>
          <div class="popup-footer">
            <div class="category">${careerMarker.category}</div>
            ${careerMarker.isCurrent ? '<div class="status-current">ACTIVE</div>' : ''}
          </div>
        </div>
      `);

      // Add styled popup CSS
      const popupStyle = document.createElement('style');
      popupStyle.textContent = `
        .career-popup-content {
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid ${resumeDataService.getCategoryStyle(careerMarker.type).color};
          color: #ffffff;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          padding: 12px;
          border-radius: 6px;
          min-width: 200px;
        }
        
        .popup-header .company-name {
          color: #ffffff;
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 2px;
        }
        
        .popup-header .mission-codename {
          color: ${resumeDataService.getCategoryStyle(careerMarker.type).color};
          font-size: 10px;
          margin-bottom: 8px;
        }
        
        .popup-body .position {
          color: #cccccc;
          margin-bottom: 4px;
        }
        
        .popup-body .date-range {
          color: ${resumeDataService.getCategoryStyle(careerMarker.type).color};
          font-size: 10px;
          margin-bottom: 2px;
        }
        
        .popup-body .location,
        .popup-body .coordinates {
          color: #888888;
          font-size: 9px;
        }
        
        .popup-footer {
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .popup-footer .category {
          color: ${resumeDataService.getCategoryStyle(careerMarker.type).color};
          font-size: 9px;
          text-transform: uppercase;
        }
        
        .popup-footer .status-current {
          background: #00ff00;
          color: #000000;
          padding: 1px 4px;
          border-radius: 2px;
          font-size: 8px;
          font-weight: bold;
        }
      `;
      document.head.appendChild(popupStyle);
      stylesRef.current.push(popupStyle);

      markerElement.addEventListener('mouseenter', () => {
        mapboxMarker.setPopup(popup).togglePopup();
      });

      markerElement.addEventListener('mouseleave', () => {
        popup.remove();
      });
    });

    // Fit map to show all career markers after a brief delay
    setTimeout(() => {
      if (map.current && careerData.markers.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        
        careerData.markers.forEach(marker => {
          bounds.extend([marker.location.lng, marker.location.lat]);
        });
        
        console.log('[MapboxScene] 🗺️ Fitting map bounds to show all career markers:', {
          bounds: bounds,
          markerCount: careerData.markers.length,
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 6
        });
        
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 6 // Don't zoom in too much
        });
      }
    }, 1000); // Small delay to let markers render
  }, [careerData, createCareerMarkerElement, addMapTelemetry]);

  // Update markers when career data loads
  useEffect(() => {
    if (mapLoaded && careerData) {
      addCareerMarkers();
    }
  }, [mapLoaded, careerData, addCareerMarkers]);

  const resetView = () => {
    if (!map.current) return;
    
    map.current.flyTo({
      center: [-71.0589, 42.3601],
      zoom: 4,
      pitch: 0, // Overhead on reset
      bearing: 0,
      duration: 2000
    });

    addMapTelemetry({
      source: 'MAP',
      message: 'Tactical display reset to global overview',
      level: 'info'
    });
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Mapbox container */}
      <div ref={mapContainer} className="w-full h-full cursor-none" />

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
          {/* Secret Map Terminal */}
          {secretOpen && (
            <div className="terminal-overlay" role="dialog" aria-modal="true" aria-label="Map Terminal">
              <div className="terminal-window">
                <div className="terminal-header">MAP TERMINAL — ` to close</div>
                <div className="terminal-body">
                  {secretLines.map((l, i) => (<div key={i} className="terminal-line">{l}</div>))}
                </div>
                <div className="terminal-input">
              <span className="terminal-prompt">{promptUser()}</span>
              <input
                className="terminal-field"
                autoFocus
                value={secretInput}
                onChange={e => setSecretInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = secretInput; setSecretLines(prev => [...prev, `${promptUser()} ${val}`]); setSecretInput(''); runCmd(val);
                  } else if (e.key === 'Escape') { setSecretOpen(false); }
                }}
                placeholder={awaitPass ? 'Password' : 'type help'}
              />
                </div>
                <div className="terminal-hint mt-2">Try: regions, goto area51, zoom 5, center -115.8 37.24, scan, login.</div>
              </div>
            </div>
          )}
          {alertMode && (<><div className="alert-overlay" /><div className="alert-banner">ALERT MODE — Unauthorized access detected</div></>)}
          {/* Map controls */}
          {/* Career Data Display */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-gray-900/90 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-green-500 text-xs font-mono mb-2">
                CAREER TACTICAL DISPLAY
              </div>
              <div className="text-white text-xs font-mono space-y-1">
                <div>MARKERS: {careerData?.markers.length || 0}</div>
                <div>STATUS: <span className="text-green-500">OPERATIONAL</span></div>
                <div>SOURCE: <span className="text-green-500">RESUME.JSON</span></div>
                {selectedCareerMarker && (
                  <div>TARGET: <span className="text-green-500">{selectedCareerMarker.codename}</span></div>
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

          {/* Career Legend (Mission Legend) - moved to top right */}
          {careerData && (
            <div className="absolute right-4 z-60 top-20 md:top-24">
              <div className="bg-gray-900/90 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-green-500 text-xs font-mono mb-2">
                  MISSION LEGEND
                </div>
                <div className="space-y-2">
                  {Object.entries(careerData.categories).map(([type, config]) => {
                    const markersOfType = careerData.markers.filter(m => m.type === type);
                    if (markersOfType.length === 0) return null;
                    
                    return (
                      <div key={type} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{
                            backgroundColor: config.color,
                            borderColor: config.color,
                            boxShadow: `0 0 8px ${config.color}80`
                          }}
                        />
                        <span className="text-white text-xs font-mono">
                          {config.icon} {config.label} ({markersOfType.length})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Crosshair cursor overlay with coordinates */}
          {cursorPoint && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Vertical line */}
              <div
                className="absolute bg-green-500/30"
                style={{ left: `${cursorPoint.x}px`, top: 0, width: '1px', height: '100%' }}
              />
              {/* Horizontal line */}
              <div
                className="absolute bg-green-500/30"
                style={{ top: `${cursorPoint.y}px`, left: 0, height: '1px', width: '100%' }}
              />
              {/* Cursor square */}
              <div
                className="absolute border border-green-500/70 bg-green-500/5 shadow-[0_0_10px_rgba(0,255,0,0.4)]"
                style={{
                  left: `${Math.max(0, Math.min(containerDimensions.width, cursorPoint.x)) - 6}px`,
                  top: `${Math.max(0, Math.min(containerDimensions.height, cursorPoint.y)) - 6}px`,
                  width: '12px',
                  height: '12px'
                }}
              />
              {/* Coordinates box (slightly offset, clamped to viewport) */}
              {(() => {
                const offset = 14;
                const boxWidth = 170;
                const boxHeight = 44;
                const left = Math.min(cursorPoint.x + offset, containerDimensions.width - boxWidth - 6);
                const top = Math.min(cursorPoint.y + offset, containerDimensions.height - boxHeight - 6);
                return (
                  <div
                    className="absolute bg-gray-900/90 border border-green-500/30 rounded p-2 backdrop-blur-sm"
                    style={{ left: `${Math.max(6, left)}px`, top: `${Math.max(6, top)}px`, width: `${boxWidth}px` }}
                  >
                    <div className="text-green-500 text-[10px] font-mono mb-1">COORDINATES</div>
                    <div className="text-white text-[10px] font-mono">LAT: {currentCoords.lat}°</div>
                    <div className="text-white text-[10px] font-mono">LNG: {currentCoords.lng}°</div>
                  </div>
                );
              })()}
            </div>
          )}

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

          {/* Career details dialog */}
          {selectedCareerMarker && (
            <div className="absolute inset-0 flex items-center justify-center z-[110]">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/60"
                onClick={() => setSelectedCareerMarker(null)}
              />
              <div className="relative tactical-glass bg-black/70 border border-green-500/30 rounded-lg p-5 w-[90vw] max-w-2xl mx-auto">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {selectedCareerMarker.logo && (
                      <img
                        src={selectedCareerMarker.logo}
                        alt={selectedCareerMarker.name}
                        className="w-10 h-10 rounded-full border border-green-500/40 object-contain bg-black/40"
                      />
                    )}
                    <div>
                      <div className="holo-text font-mono text-xl">{selectedCareerMarker.name}</div>
                      {selectedCareerMarker.codename && (
                        <div className="text-green-500 font-mono text-xs">{selectedCareerMarker.codename}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCareerMarker(null)}
                    className="tactical-button text-xs px-2 py-1"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs font-mono text-white">
                  {selectedCareerMarker.position && (
                    <div><span className="text-green-400">Position:</span> {selectedCareerMarker.position}</div>
                  )}
                  <div>
                    <span className="text-green-400">Dates:</span> {resumeDataService.getDateRange(selectedCareerMarker)}
                  </div>
                  <div>
                    <span className="text-green-400">Location:</span> {selectedCareerMarker.location.city || ''}{selectedCareerMarker.location.city ? ', ' : ''}{selectedCareerMarker.location.region || ''}
                  </div>
                  <div>
                    <span className="text-green-400">Coords:</span> {selectedCareerMarker.location.lat.toFixed(4)}, {selectedCareerMarker.location.lng.toFixed(4)}
                  </div>
                </div>
                {selectedCareerMarker.summary && (
                  <div className="text-sm text-gray-200 font-mono mb-4">{selectedCareerMarker.summary}</div>
                )}
                {selectedCareerMarker.highlights && selectedCareerMarker.highlights.length > 0 && (
                  <div className="mb-4">
                    <div className="text-green-400 font-mono text-xs mb-2">Highlights</div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-200">
                      {selectedCareerMarker.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Tech stacks */}
                <div className="flex flex-col gap-2">
                  {selectedCareerMarker.languages && selectedCareerMarker.languages.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-green-400 font-mono text-xs">Languages:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCareerMarker.languages.map((t, i) => (
                          <span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCareerMarker.frameworks && selectedCareerMarker.frameworks.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-green-400 font-mono text-xs">Frameworks:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCareerMarker.frameworks.map((t, i) => (
                          <span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCareerMarker.technologies && selectedCareerMarker.technologies.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-green-400 font-mono text-xs">Technologies:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCareerMarker.technologies.map((t, i) => (
                          <span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCareerMarker.skills && selectedCareerMarker.skills.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-green-400 font-mono text-xs">Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCareerMarker.skills.map((t, i) => (
                          <span key={i} className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
