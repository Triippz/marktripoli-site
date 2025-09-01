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
import { missionAudio } from '../../utils/audioSystem';

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mothershipVisible, setMothershipVisible] = useState(false);
  const [uxvActive, setUxvActive] = useState(false);
  const [uxvPos, setUxvPos] = useState<{ lng: number; lat: number } | null>(null);
  const [uxvTarget, setUxvTarget] = useState<{ lng: number; lat: number } | null>(null);
  const [uxvSpeed, setUxvSpeed] = useState<number>(200);
  const [uxvExplosions, setUxvExplosions] = useState<Array<{ id: string; lng: number; lat: number; start: number }>>([]);
  const [uxvPanelOpen, setUxvPanelOpen] = useState(false);
  const [uxvFollow, setUxvFollow] = useState(false);
  const [uxvContextMenu, setUxvContextMenu] = useState<{ open: boolean; x: number; y: number; lng: number; lat: number } | null>(null);
  const [uxvBase, setUxvBase] = useState<{ lng: number; lat: number } | null>(null);
  const [uxvTrail, setUxvTrail] = useState<Array<{ lng: number; lat: number }>>([]);
  const [uxvProjectiles, setUxvProjectiles] = useState<Array<{ id: string; sx: number; sy: number; ex: number; ey: number; start: number; dur: number }>>([]);
  const [uxvPreview, setUxvPreview] = useState<{ lng: number; lat: number } | null>(null);
  const [uxvPanelPos, setUxvPanelPos] = useState<{ left: number; top: number } | null>(null);
  const uxvPanelRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  // Trail controls
  const [uxvTrailMax, setUxvTrailMax] = useState<number>(() => {
    try { const v = parseInt(localStorage.getItem('uxvTrailMax') || '50'); return isNaN(v) ? 50 : Math.min(200, Math.max(10, v)); } catch { return 50; }
  });

  // Load persisted panel position
  useEffect(() => {
    try {
      const raw = localStorage.getItem('uxvPanelPos');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.left === 'number' && typeof parsed?.top === 'number') {
          setUxvPanelPos(parsed);
        }
      }
    } catch {}
  }, []);
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
      if (
        e.key === '`' ||
        ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 't')
      ) {
        e.preventDefault(); setSecretOpen(v => !v);
      }
      if (e.key === 'Escape' && secretOpen) setSecretOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [secretOpen]);

  // Map interactions for UXV
  useEffect(() => {
    const m = map.current; if (!m) return;
    const onClick = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      if (!uxvActive) return;
      const { lng, lat } = e.lngLat;
      setUxvTarget({ lng, lat });
    };
    const onCtx = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      if (!uxvActive) return;
      const { lng, lat } = e.lngLat; const { x, y } = e.point as { x: number; y: number };
      setUxvContextMenu({ open: true, x, y, lng, lat });
    };
    m.on('click', onClick);
    m.on('contextmenu', onCtx);
    return () => { try { m.off('click', onClick); m.off('contextmenu', onCtx); } catch {} };
  }, [uxvActive]);

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
          if (ok) { saveAch(`visit_hq_${q.toLowerCase()}`); setSecretOpen(false); try { missionAudio.playEffect('navigate'); } catch {} }
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
      case 'uxv': {
        const sub = (args[0] || '').toLowerCase();
        if (!sub || sub === 'help') { addLine('uxv subcmds: start [lng lat], stop, goto <lng> <lat> | region <key>, speed <mps>, drop'); break; }
        if (sub === 'start') {
          if (args.length >= 3) {
            const lng = parseFloat(args[1]); const lat = parseFloat(args[2]);
            if (!isNaN(lng) && !isNaN(lat)) { setUxvPos({ lng, lat }); setUxvBase({ lng, lat }); setUxvTrail([{ lng, lat }]); setUxvActive(true); setUxvPanelOpen(false); setSecretOpen(false); try { map.current?.easeTo({ center: [lng, lat], zoom: 12, duration: 800 }); } catch {}; addLine(`UXV started at ${lng.toFixed(3)}, ${lat.toFixed(3)}`); break; }
          }
          const c = map.current?.getCenter();
          if (c) { setUxvPos({ lng: c.lng, lat: c.lat }); setUxvBase({ lng: c.lng, lat: c.lat }); setUxvTrail([{ lng: c.lng, lat: c.lat }]); setUxvActive(true); setUxvPanelOpen(false); setSecretOpen(false); try { map.current?.easeTo({ center: [c.lng, c.lat], zoom: 12, duration: 800 }); } catch {}; addLine('UXV started at map center'); }
          else { addLine('UXV start failed'); }
          break;
        }
        if (sub === 'stop') { setUxvActive(false); setUxvTarget(null); addLine('UXV stopped'); break; }
        if (sub === 'goto') {
          if ((args[1] || '').toLowerCase() === 'region') {
            const key = (args[2] || '').toLowerCase();
            const g = getGeofences().find(g => g.key === key);
            if (g) { const lng = (g.box.minLng + g.box.maxLng)/2; const lat = (g.box.minLat + g.box.maxLat)/2; setUxvTarget({ lng, lat }); addLine(`UXV targeting ${key}`); try { missionAudio.playEffect('navigate'); } catch {} }
            else addLine('Unknown region');
          } else {
            const lng = parseFloat(args[1]); const lat = parseFloat(args[2]);
            if (!isNaN(lng) && !isNaN(lat)) { setUxvTarget({ lng, lat }); addLine(`UXV targeting ${lng.toFixed(3)}, ${lat.toFixed(3)}`); try { missionAudio.playEffect('navigate'); } catch {} }
            else addLine('Usage: uxv goto <lng> <lat> | region <key>');
          }
          break;
        }
        if (sub === 'speed') { const sp = parseFloat(args[1]); if (!isNaN(sp) && sp > 0) { setUxvSpeed(sp); addLine(`UXV speed ${sp} m/s`); } else { addLine('Usage: uxv speed <mps>'); } break; }
        if (sub === 'drop') { if (uxvPos) { const id = `${Date.now()}`; const trg = uxvTarget || uxvPos; setUxvProjectiles(prev => [...prev, { id, sx: uxvPos.lng, sy: uxvPos.lat, ex: trg.lng, ey: trg.lat, start: performance.now(), dur: 2000 }]); try { missionAudio.playEffect('sweep'); } catch {}; addLine('UXV ordnance deployed'); } else addLine('UXV not active'); break; }
        addLine('Unknown uxv subcommand');
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

            // Track zoom for mothership visibility
            const onMove = () => {
              if (!map.current) return;
              const z = map.current.getZoom();
              setZoomLevel(z);
              setMothershipVisible(z <= 1.2);
            };
            map.current.on('move', onMove);
            onMove();

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

  // Animate UXV movement + trail + projectiles
  useEffect(() => {
    let raf = 0; let last = performance.now(); let lastTrail = last;
    const step = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      if (uxvActive && uxvPos && uxvTarget) {
        const dLng = uxvTarget.lng - uxvPos.lng;
        const dLat = uxvTarget.lat - uxvPos.lat;
        const dist = Math.sqrt(dLng * dLng + dLat * dLat);
        if (dist < 0.0003) {
          setUxvPos(uxvTarget);
          setUxvTarget(null);
        } else {
          const degPerSec = uxvSpeed / 111000; // approx degrees/sec
          const stepSize = Math.min(dist, degPerSec * Math.max(0.001, dt));
          const nx = uxvPos.lng + (dLng / dist) * stepSize;
          const ny = uxvPos.lat + (dLat / dist) * stepSize;
          setUxvPos({ lng: nx, lat: ny });
          if (now - lastTrail > 120) {
            setUxvTrail(prev => {
              const arr = prev.slice();
              const lastPt = arr[arr.length - 1];
              const moved = !lastPt || Math.hypot((lastPt.lng - nx), (lastPt.lat - ny)) > 0.00005;
              if (moved) {
                arr.push({ lng: nx, lat: ny });
                if (arr.length > uxvTrailMax) arr.splice(0, arr.length - uxvTrailMax);
              }
              return arr;
            });
            lastTrail = now;
          }
          if (uxvFollow && map.current) {
            try { map.current.easeTo({ center: [nx, ny], duration: 280, essential: false }); } catch {}
          }
        }
      }
      // Update projectiles, spawn explosion on impact
      if (uxvProjectiles.length > 0) {
        setUxvProjectiles(prev => {
          const remain: typeof prev = [];
          prev.forEach(p => {
            const t = (now - p.start) / p.dur;
            if (t >= 1) {
              setUxvExplosions(ex => [...ex, { id: p.id, lng: p.ex, lat: p.ey, start: now }]);
              try { missionAudio.playEffect('alert'); } catch {}
            } else remain.push(p);
          });
          return remain;
        });
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [uxvActive, uxvPos, uxvTarget, uxvSpeed, uxvFollow, uxvProjectiles]);

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
        if (uxvActive) {
          setUxvTarget({ lng: careerMarker.location.lng, lat: careerMarker.location.lat });
          addMapTelemetry({ source: 'UXV', message: `Tasked to ${careerMarker.name}`, level: 'info' });
        } else {
          setSelectedCareerMarker(careerMarker);
          addMapTelemetry({ source: 'MAP', message: `Engaging career target: ${careerMarker.codename}`, level: 'success' });
          map.current?.flyTo({ center: [careerMarker.location.lng, careerMarker.location.lat], zoom: 8, pitch: 10, bearing: 0, duration: 2000 });
        }
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

      {/* Mothership overlay when zoomed out */}
      {mapLoaded && mothershipVisible && (
        <MothershipOverlay container={mapContainer} />
      )}

      {/* UXV game overlay */}
      {mapLoaded && uxvActive && uxvPos && (
        <UXVOverlay mapRef={map} pos={uxvPos} target={uxvTarget} explosions={uxvExplosions} onExplosionsChange={setUxvExplosions} trail={uxvTrail} projectiles={uxvProjectiles} />
      )}

      {/* UXV clickable marker to open panel */}
      {mapLoaded && uxvActive && uxvPos && (
        <UXVMarkerOverlay mapRef={map} pos={uxvPos} target={uxvTarget} onClick={() => setUxvPanelOpen(true)} />
      )}

      {/* UXV Control Panel */}
      {uxvActive && uxvPanelOpen && uxvPos && (
        <div
          ref={uxvPanelRef}
          className="absolute z-[120] w-80"
          style={{
            left: (uxvPanelPos?.left ?? Math.max(16, containerDimensions.width - 320 - 16)),
            top: (uxvPanelPos?.top ?? Math.max(16, containerDimensions.height - 280)),
            cursor: draggingRef.current ? 'grabbing' : 'default'
          }}
        >
          <div className="tactical-panel p-4">
            <div
              className="flex justify-between items-center mb-2 cursor-move"
              onMouseDown={(e) => {
                e.preventDefault(); e.stopPropagation();
                if (!uxvPanelRef.current || !mapContainer.current) return;
                const rect = uxvPanelRef.current.getBoundingClientRect();
                dragOffsetRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
                draggingRef.current = true;
                const onMove = (ev: MouseEvent) => {
                  if (!draggingRef.current || !mapContainer.current) return;
                  const cont = mapContainer.current.getBoundingClientRect();
                  const left = Math.min(Math.max(0, ev.clientX - cont.left - dragOffsetRef.current.dx), cont.width - 320);
                  const top = Math.min(Math.max(0, ev.clientY - cont.top - dragOffsetRef.current.dy), cont.height - 160);
                  setUxvPanelPos({ left, top });
                };
                const onUp = () => {
                  draggingRef.current = false;
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                  try { const pos = uxvPanelPos || { left: 0, top: 0 }; localStorage.setItem('uxvPanelPos', JSON.stringify(pos)); } catch {}
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
            >
              <div className="holo-text text-sm font-mono">UXV CONTROL</div>
              <button className="tactical-button text-xs px-2 py-1" onClick={() => setUxvPanelOpen(false)}>Hide</button>
            </div>
            <div className="text-xs font-mono text-gray-300 space-y-1 mb-2">
              <div>Pos: {uxvPos.lng.toFixed(3)}, {uxvPos.lat.toFixed(3)}</div>
              {uxvTarget && (<div>Target: {uxvTarget.lng.toFixed(3)}, {uxvTarget.lat.toFixed(3)}</div>)}
              {uxvBase && (<div>Base: {uxvBase.lng.toFixed(3)}, {uxvBase.lat.toFixed(3)}</div>)}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-gray-300">Speed: {uxvSpeed} m/s</label>
                <input type="range" min="50" max="1500" value={uxvSpeed} onChange={(e) => setUxvSpeed(parseInt((e.target as HTMLInputElement).value))} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-gray-300">Trail Len: {uxvTrailMax}</label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={uxvTrailMax}
                  onChange={(e) => {
                    const v = parseInt((e.target as HTMLInputElement).value);
                    const clamped = Math.min(200, Math.max(10, v));
                    setUxvTrailMax(clamped);
                    try { localStorage.setItem('uxvTrailMax', String(clamped)); } catch {}
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-gray-300">Volume: {Math.round(missionAudio.getVolume()*100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(missionAudio.getVolume()*100)}
                  onChange={(e) => {
                    const v = parseInt((e.target as HTMLInputElement).value) / 100;
                    missionAudio.setVolume(v);
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-mono text-gray-300 flex items-center gap-1"><input type="checkbox" checked={uxvFollow} onChange={e => setUxvFollow((e.target as HTMLInputElement).checked)} /> Follow</label>
              </div>
              <div className="flex items-center gap-2">
                <button className="tactical-button text-xs px-2 py-1" onClick={() => {
                  if (uxvPos) {
                    const id = `${Date.now()}`;
                    const target = uxvTarget || uxvPos; // if no target, drop at current pos
                    setUxvProjectiles(prev => [...prev, { id, sx: uxvPos.lng, sy: uxvPos.lat, ex: target.lng, ey: target.lat, start: performance.now(), dur: 2000 }]);
                    try { missionAudio.playEffect('sweep'); } catch {}
                  }
                }}>Drop</button>
                <button className="tactical-button text-xs px-2 py-1" onClick={() => { setUxvActive(false); setUxvTarget(null); }}>Stop</button>
                <button disabled={!uxvBase} className="tactical-button text-xs px-2 py-1" onClick={() => { if (uxvBase) setUxvTarget({ ...uxvBase }); }}>Return to Base</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UXV marker (click to open controls) */}
      {mapLoaded && uxvActive && uxvPos && (
        <UXVMarkerOverlay mapRef={map} pos={uxvPos} target={uxvTarget} onClick={() => setUxvPanelOpen(true)} />
      )}

      {/* Task preview overlay */}
      {uxvActive && uxvPreview && (
        <TaskPreviewOverlay
          mapRef={map}
          target={uxvPreview}
          onConfirm={() => { setUxvTarget(uxvPreview); setUxvPreview(null); try { missionAudio.playEffect('navigate'); } catch {} }}
          onCancel={() => setUxvPreview(null)}
        />
      )}

      {/* Context menu for UXV actions */}
      {uxvContextMenu?.open && (
        <div className="absolute z-[121]" style={{ left: uxvContextMenu.x, top: uxvContextMenu.y }}>
          <div className="tactical-panel p-2 text-xs font-mono">
            <div className="flex flex-col gap-1">
              <button className="tactical-button text-[11px] px-2 py-1" onClick={() => { setUxvTarget({ lng: uxvContextMenu.lng, lat: uxvContextMenu.lat }); setUxvContextMenu(null); }}>Set Target Here</button>
              <button className="tactical-button text-[11px] px-2 py-1" onClick={() => { if (uxvPos) setUxvProjectiles(prev => [...prev, { id: `${Date.now()}`, sx: uxvPos.lng, sy: uxvPos.lat, ex: uxvContextMenu.lng, ey: uxvContextMenu.lat, start: performance.now(), dur: 1800 }]); setUxvContextMenu(null); }}>Drop Payload Here</button>
              <button className="tactical-button text-[11px] px-2 py-1" onClick={() => setUxvContextMenu(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

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

// Overlay: Mothership + escorts using Canvas 2D (lightweight WebGL feel)
function MothershipOverlay({ container }: { container: React.RefObject<HTMLDivElement> }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!container.current) return;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '52';
    container.current.appendChild(canvas);
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    const resize = () => { if (!container.current) return; canvas.width = container.current.clientWidth; canvas.height = container.current.clientHeight; };
    resize();
    window.addEventListener('resize', resize);
    const start = performance.now();
    const drawShip = (x: number, y: number, scale: number, hue: number) => {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      // Glow
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.7)`;
      ctx.shadowBlur = 16;
      // Body
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 80, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dome
      ctx.fillStyle = 'rgba(200,255,240,0.8)';
      ctx.beginPath();
      ctx.ellipse(0, -10, 26, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lights
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.9)`;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath(); ctx.ellipse(i * 18, 12, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    };
    const drawEscort = (x: number, y: number, scale: number, hue: number) => {
      if (!ctx) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
      ctx.shadowColor = `hsla(${hue},100%,60%,0.7)`; ctx.shadowBlur = 10;
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.9)`;
      ctx.beginPath(); ctx.ellipse(0, 0, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };
    const render = (ts: number) => {
      if (!ctx) return;
      const t = (ts - start) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width * 0.5;
      const cy = canvas.height * 0.15; // near top edge (orbit above earth)
      const radius = Math.min(canvas.width, canvas.height) * 0.45;
      // Mothership orbit param
      const theta = t * 0.2;
      const mx = cx + Math.cos(theta) * radius;
      const my = cy + Math.sin(theta) * (radius * 0.2);
      drawShip(mx, my, 0.6, 150);
      // Escorts
      for (let i = 0; i < 5; i++) {
        const a = theta + i * (Math.PI * 2 / 5) + Math.sin(t * 0.8 + i) * 0.2;
        const ex = cx + Math.cos(a) * (radius * 0.8);
        const ey = cy + Math.sin(a) * (radius * 0.18);
        drawEscort(ex, ey, 0.35, 150);
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); };
  }, [container]);
  return null;
}

function UXVOverlay({ mapRef, pos, target, explosions, onExplosionsChange, trail, projectiles }: { mapRef: React.RefObject<mapboxgl.Map>, pos: { lng: number; lat: number }, target: { lng: number; lat: number } | null, explosions: Array<{ id: string; lng: number; lat: number; start: number }>, onExplosionsChange: (arr: any) => void, trail: Array<{ lng: number; lat: number }>, projectiles: Array<{ id: string; sx: number; sy: number; ex: number; ey: number; start: number; dur: number }> }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const container = map.getContainer();
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute'; canvas.style.top = '0'; canvas.style.left = '0';
    canvas.style.width = '100%'; canvas.style.height = '100%'; canvas.style.pointerEvents = 'none'; canvas.style.zIndex = '53';
    container.appendChild(canvas); canvasRef.current = canvas;
    const ctx = canvas.getContext('2d'); let raf = 0;
    const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
    resize(); window.addEventListener('resize', resize);
    const drawUXV = (pt: { x: number; y: number }) => {
      if (!ctx) return; ctx.save(); ctx.translate(pt.x, pt.y);
      ctx.fillStyle = 'rgba(69,255,176,0.9)'; ctx.strokeStyle = 'rgba(69,255,176,0.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(6, 10); ctx.lineTo(-6, 10); ctx.closePath(); ctx.fill();
      ctx.restore();
    };
    const drawExplosion = (pt: { x: number; y: number }, age: number) => {
      if (!ctx) return; const r = Math.min(60, age * 120);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
      grd.addColorStop(0, 'rgba(255,200,80,0.9)');
      grd.addColorStop(0.6, 'rgba(255,80,60,0.5)');
      grd.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    };
    const render = () => {
      if (!ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height);
      const p = map.project(pos as any);
      // Trail rendering with age-based fade and smooth rounded curves (Catmull-Rom style via quadratic midpoints)
      if (trail && trail.length > 1) {
        // Build screen-space points, append current position to ensure connection
        const pts = trail.map(ll => map.project(ll as any));
        pts.push(p);

        // Configure round joins/caps for smooth turns
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Outer glow stroke (single smooth path)
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(69,255,176,0.25)';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const cp = pts[i];
          const mid = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 };
          ctx.quadraticCurveTo(cp.x, cp.y, mid.x, mid.y);
        }
        // Curve to the last point
        const last = pts[pts.length - 1];
        ctx.quadraticCurveTo(last.x, last.y, last.x, last.y);
        ctx.stroke();

        // Inner stroke re-trace with slightly brighter color
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = 'rgba(69,255,176,0.85)';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const cp = pts[i];
          const mid = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 };
          ctx.quadraticCurveTo(cp.x, cp.y, mid.x, mid.y);
        }
        ctx.quadraticCurveTo(last.x, last.y, last.x, last.y);
        ctx.stroke();
      }
      // Projectiles with parabolic arc
      const now = performance.now();
      projectiles.forEach((pr) => {
        const t = Math.min(1, (now - pr.start) / pr.dur);
        const lng = pr.sx + (pr.ex - pr.sx) * t;
        const lat = pr.sy + (pr.ey - pr.sy) * t;
        const pt = map.project({ lng, lat } as any);
        const arc = Math.sin(Math.PI * t);
        const yOffset = arc * 40; // pixels
        ctx.save();
        ctx.fillStyle = 'rgba(255,200,80,0.9)';
        ctx.beginPath(); ctx.arc(pt.x, pt.y - yOffset, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      drawUXV(p);
      if (target) {
        const t = map.project(target as any); ctx.strokeStyle = 'rgba(69,255,176,0.6)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(t.x, t.y); ctx.stroke(); ctx.setLineDash([]);
      }
      // Explosions fade out by age
      const remaining: typeof explosions = [];
      for (const ex of explosions) {
        const pt = map.project({ lng: ex.lng, lat: ex.lat } as any);
        const age = (now - ex.start) / 1000;
        if (age < 1.0) { drawExplosion(pt, age); remaining.push(ex); }
      }
      if (remaining.length !== explosions.length) onExplosionsChange(remaining);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); };
  }, [mapRef, pos, target, explosions, onExplosionsChange, trail, projectiles]);
  return null;
}

function TaskPreviewOverlay({ mapRef, target, onConfirm, onCancel }: { mapRef: React.RefObject<mapboxgl.Map>, target: { lng: number; lat: number }, onConfirm: () => void, onCancel: () => void }) {
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const m = mapRef.current; if (!m) return;
    const update = () => { const p = m.project(target as any); setPt({ x: p.x, y: p.y }); };
    update(); m.on('move', update); m.on('zoom', update);
    return () => { try { m.off('move', update); m.off('zoom', update); } catch {} };
  }, [mapRef, target]);
  if (!pt) return null;
  return (
    <div className="absolute z-[121]" style={{ left: pt.x - 10, top: pt.y - 10 }}>
      {/* Crosshair */}
      <div className="absolute -left-4 -top-4 w-8 h-8 border border-green-500/60 rounded-sm" />
      {/* Action bubble */}
      <div className="tactical-panel p-2 text-xs font-mono mt-8">
        <div className="text-green-400 mb-1">Task UXV here?</div>
        <div className="flex gap-2">
          <button className="tactical-button text-[11px] px-2 py-1" onClick={onConfirm}>Confirm</button>
          <button className="tactical-button text-[11px] px-2 py-1" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Clickable UXV marker element positioned via map.project
function UXVMarkerOverlay({ mapRef, pos, target, onClick }: { mapRef: React.RefObject<mapboxgl.Map>, pos: { lng: number; lat: number }, target: { lng: number; lat: number } | null, onClick: () => void }) {
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  const angle = (() => {
    if (!target) return 0;
    const dLng = target.lng - pos.lng; const dLat = target.lat - pos.lat;
    return Math.atan2(dLat, dLng) * 180 / Math.PI; // degrees
  })();
  useEffect(() => {
    const m = mapRef.current; if (!m) return;
    const update = () => { const p = m.project(pos as any); setPt({ x: p.x, y: p.y }); };
    update();
    m.on('move', update);
    m.on('zoom', update);
    return () => { try { m.off('move', update); m.off('zoom', update); } catch {} };
  }, [mapRef, pos]);
  if (!pt) return null;
  return (
    <div className="absolute z-[120]" style={{ left: pt.x - 16, top: pt.y - 16 }}>
      <button title="UXV" onClick={onClick} style={{ transform: `rotate(${angle}deg)` }} className="block">
        <img src="/icons/drone.svg" alt="UXV" width="32" height="32" className="drop-shadow-[0_0_8px_rgba(69,255,176,0.6)] opacity-90 hover:opacity-100" />
      </button>
    </div>
  );
}
