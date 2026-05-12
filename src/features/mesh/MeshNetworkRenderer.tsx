import { useEffect, useRef, useState, useCallback } from 'react';
import { createInitialMeshState } from './meshData';
import { tickSimulation } from './meshSimulation';
import { drawNode, drawEdge } from './meshSymbols';
import type { MeshState, MeshEdge, MeshNode, MeshCluster } from './types';

interface MeshNetworkRendererProps {
  map: mapboxgl.Map;
  active: boolean;
  onComplete?: () => void;
}

interface ScreenPos { x: number; y: number }

function getAltOffset(node: MeshNode, zoom: number): number {
  const alt = node.detail?.alt;
  if (!alt || alt <= 500) return 0;
  const zoomScale = Math.max(0.5, zoom / 4);
  if (alt > 10_000_000) return 180 * zoomScale;
  if (alt > 5_000) return 90 * zoomScale;
  if (alt > 1_000) return 50 * zoomScale;
  return 0;
}

// ── Edge bundling ───────────────────────────────────────────────────────────
interface ScreenEdge { from: ScreenPos; to: ScreenPos; edge: MeshEdge }

function bundleEdges(edges: ScreenEdge[], zoom: number): ScreenEdge[] {
  if (zoom >= 6 || edges.length < 20) return edges;
  const threshold = Math.max(4, 60 / Math.pow(1.6, zoom));
  const used = new Uint8Array(edges.length);
  const bundled: ScreenEdge[] = [];

  for (let i = 0; i < edges.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const midAx = (edges[i].from.x + edges[i].to.x) * 0.5;
    const midAy = (edges[i].from.y + edges[i].to.y) * 0.5;
    let fx = edges[i].from.x, fy = edges[i].from.y;
    let tx = edges[i].to.x, ty = edges[i].to.y;
    let count = 1;

    for (let j = i + 1; j < edges.length; j++) {
      if (used[j]) continue;
      const midBx = (edges[j].from.x + edges[j].to.x) * 0.5;
      const midBy = (edges[j].from.y + edges[j].to.y) * 0.5;
      const dx = midBx - midAx, dy = midBy - midAy;
      if (dx * dx + dy * dy < threshold * threshold) {
        fx += edges[j].from.x; fy += edges[j].from.y;
        tx += edges[j].to.x; ty += edges[j].to.y;
        count++; used[j] = 1;
      }
    }

    bundled.push(count === 1
      ? edges[i]
      : { from: { x: fx / count, y: fy / count }, to: { x: tx / count, y: ty / count }, edge: edges[i].edge }
    );
  }
  return bundled;
}

// ── Node Detail Popup ───────────────────────────────────────────────────────
function NodeDetailPopup({ node, pos, onClose }: { node: MeshNode; pos: ScreenPos; onClose: () => void }) {
  const d = node.detail;
  return (
    <div
      style={{
        position: 'absolute', left: pos.x + 16, top: pos.y - 10, zIndex: 200,
        background: 'rgba(0,0,0,0.92)', border: '1px solid #00ff00', borderRadius: 2,
        padding: '8px 10px', fontFamily: '"JetBrains Mono","Courier New",monospace',
        fontSize: 10, color: '#00ff00', pointerEvents: 'auto', minWidth: 200, maxWidth: 280,
        boxShadow: '0 0 12px rgba(0,255,0,0.15)', lineHeight: 1.5,
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontWeight: 'bold', fontSize: 11 }}>{d.callsign || node.label}</span>
        <span style={{ cursor: 'pointer', opacity: 0.6, fontSize: 12 }} onClick={onClose}>×</span>
      </div>
      <div style={{ borderBottom: '1px solid rgba(0,255,0,0.2)', marginBottom: 4, paddingBottom: 4 }}>
        <span style={{ color: '#44ffb0' }}>{d.affiliation}</span>{' / '}
        <span style={{ color: '#ff8800' }}>{d.domain}</span>
        {d.echelon && <span style={{ color: '#888' }}> / {d.echelon}</span>}
      </div>
      <div style={{ color: '#aaa', fontSize: 9, marginBottom: 4 }}>{d.description}</div>
      <table style={{ borderSpacing: 0, width: '100%', fontSize: 9 }}>
        <tbody>
          <tr><td style={{ color: '#888', paddingRight: 8 }}>STATUS</td><td style={{ color: d.status === 'OPERATIONAL' ? '#00ff00' : '#ff4444' }}>{d.status}</td></tr>
          <tr><td style={{ color: '#888' }}>LAT</td><td>{node.geo.lat.toFixed(4)}°</td></tr>
          <tr><td style={{ color: '#888' }}>LNG</td><td>{node.geo.lng.toFixed(4)}°</td></tr>
          {d.alt != null && <tr><td style={{ color: '#888' }}>ALT</td><td>{
            d.domain === 'SPACE' ? `${(d.alt / 1000).toLocaleString()} km (GEO)`
            : d.domain === 'AIR' ? `${Math.round(d.alt * 3.281).toLocaleString()} ft MSL`
            : d.domain === 'SEA' ? 'Sea level'
            : `${d.alt.toLocaleString()} m`
          }</td></tr>}
          {d.heading != null && <tr><td style={{ color: '#888' }}>HDG</td><td>{String(d.heading).padStart(3, '0')}° T</td></tr>}
          {d.speed != null && <tr><td style={{ color: '#888' }}>SPD</td><td>{d.speed} {d.domain === 'SPACE' ? 'km/h' : d.domain === 'SEA' || d.domain === 'AIR' ? 'kts' : 'km/h'}</td></tr>}
          <tr><td style={{ color: '#888' }}>TRANSPORT</td><td>{node.transport.join(', ')}</td></tr>
          <tr><td style={{ color: '#888', verticalAlign: 'top' }}>DID</td><td style={{ color: '#ff44ff', wordBreak: 'break-all', fontSize: 8 }}>{d.did}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Draggable Cluster List Panel ────────────────────────────────────────────
function ClusterListPanel({ clusters, nodes, onFlyTo, onClose }: {
  clusters: MeshCluster[];
  nodes: MeshNode[];
  onFlyTo: (center: { lng: number; lat: number }, zoom: number) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ dragging: boolean; offsetX: number; offsetY: number }>({ dragging: false, offsetX: 0, offsetY: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-clickable]')) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragState.current = { dragging: true, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragState.current.dragging || !panelRef.current) return;
      const panel = panelRef.current;
      panel.style.left = `${e.clientX - dragState.current.offsetX}px`;
      panel.style.top = `${e.clientY - dragState.current.offsetY}px`;
      panel.style.right = 'auto';
    };
    const onMouseUp = () => { dragState.current.dragging = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, []);

  return (
    <div
      ref={panelRef}
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute', top: 12, right: 12, zIndex: 200,
        background: 'rgba(0,0,0,0.90)', border: '1px solid #00ff00', borderRadius: 2,
        padding: '8px 0', fontFamily: '"JetBrains Mono","Courier New",monospace',
        fontSize: 10, color: '#00ff00', pointerEvents: 'auto', minWidth: 180,
        boxShadow: '0 0 12px rgba(0,255,0,0.15)', maxHeight: '60vh', overflowY: 'auto',
        cursor: 'grab', userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px 6px', borderBottom: '1px solid rgba(0,255,0,0.2)' }}>
        <span style={{ fontWeight: 'bold', fontSize: 11, letterSpacing: 1 }}>MESH CLUSTERS</span>
        <span data-clickable style={{ cursor: 'pointer', opacity: 0.6, fontSize: 12 }} onClick={onClose}>×</span>
      </div>
      {clusters.map(cluster => {
        const clusterNodes = nodes.filter(n => n.clusterId === cluster.id);
        const activeCount = clusterNodes.filter(n => n.alpha > 0).length;
        const movers = clusterNodes.filter(n => n.path && n.path.length > 0).length;
        const zoom = cluster.id === 'nova' ? 10 : cluster.id === 'conus' ? 4 : 5;
        return (
          <div
            key={cluster.id}
            data-clickable
            onClick={() => onFlyTo(cluster.center, zoom)}
            style={{
              padding: '6px 10px', cursor: 'pointer', borderBottom: '1px solid rgba(0,255,0,0.08)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,0,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 2 }}>{cluster.name}</div>
            <div style={{ color: '#888', fontSize: 9 }}>
              {activeCount} nodes · {movers} mobile
            </div>
          </div>
        );
      })}
      <div
        data-clickable
        onClick={() => onFlyTo({ lng: -40, lat: 45 }, 2)}
        style={{ padding: '6px 10px', cursor: 'pointer', transition: 'background 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,0,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ fontWeight: 'bold', marginBottom: 2, color: '#ff44ff' }}>SPACE LAYER</div>
        <div style={{ color: '#888', fontSize: 9 }}>
          {nodes.filter(n => n.type === 'satellite').length} satellites · backhaul
        </div>
      </div>
    </div>
  );
}

// ── Main Renderer ───────────────────────────────────────────────────────────
export function MeshNetworkRenderer({ map, active }: MeshNetworkRendererProps): JSX.Element | null {
  const stateRef = useRef<MeshState>(createInitialMeshState());
  const rafRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTimeRef = useRef<number>(0);
  const screenPosRef = useRef<Map<string, ScreenPos>>(new Map());

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showClusterList, setShowClusterList] = useState(true);
  const liveSelectedRef = useRef<{ node: MeshNode; pos: ScreenPos } | null>(null);
  const [, forceRender] = useState(0);

  const handleCanvasClick = useCallback((e: MouseEvent) => {
    const positions = screenPosRef.current;
    const state = stateRef.current;
    const clickX = e.offsetX;
    const clickY = e.offsetY;
    const hitRadius = 18;

    let closestId: string | null = null;
    let closestDist = hitRadius * hitRadius;

    for (const node of state.nodes) {
      if (node.alpha <= 0) continue;
      const pos = positions.get(node.id);
      if (!pos) continue;
      const dx = pos.x - clickX, dy = pos.y - clickY;
      const dist = dx * dx + dy * dy;
      if (dist <= closestDist) {
        closestId = node.id;
        closestDist = dist;
      }
    }

    setSelectedNodeId(closestId);
  }, []);

  const handleFlyTo = useCallback((center: { lng: number; lat: number }, zoom: number) => {
    map.flyTo({ center: [center.lng, center.lat], zoom, duration: 2000 });
    setSelectedNodeId(null);
  }, [map]);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
      if (canvasRef.current?.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
      stateRef.current = createInitialMeshState();
      lastTimeRef.current = 0;
      setSelectedNodeId(null);
      liveSelectedRef.current = null;
      setShowClusterList(true);
      return;
    }

    const container = map.getContainer();
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:54';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const onMapClick = (e: mapboxgl.MapMouseEvent) => {
      handleCanvasClick({ offsetX: e.point.x, offsetY: e.point.y } as MouseEvent);
    };
    map.on('click', onMapClick);

    let cw = container.clientWidth, ch = container.clientHeight;
    const resize = () => { cw = container.clientWidth; ch = container.clientHeight; canvas.width = cw; canvas.height = ch; };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');

    const render = (timestamp: number) => {
      if (!ctx) { rafRef.current = requestAnimationFrame(render); return; }

      const deltaMs = lastTimeRef.current === 0 ? 16 : timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      stateRef.current = tickSimulation(stateRef.current, Math.min(deltaMs, 100));
      const state = stateRef.current;
      const zoom = map.getZoom();

      ctx.clearRect(0, 0, cw, ch);

      // Cull nodes on the backside of the globe using angular distance from camera center.
      // On a globe, map.project() can return screen coords for backside points — this catches them.
      const center = map.getCenter();
      const cLat = center.lat * Math.PI / 180;
      const cLng = center.lng * Math.PI / 180;
      // At low zoom the visible hemisphere is ~90°, at high zoom much less
      const maxAngDeg = Math.min(85, 50 + zoom * 8);
      const cosMaxAng = Math.cos(maxAngDeg * Math.PI / 180);

      const positions = screenPosRef.current;
      positions.clear();

      for (let i = 0; i < state.nodes.length; i++) {
        const node = state.nodes[i];
        if (node.alpha <= 0) continue;

        const nLat = node.geo.lat * Math.PI / 180;
        const nLng = node.geo.lng * Math.PI / 180;
        // Great-circle angular distance (dot product on unit sphere)
        const cosAng = Math.sin(cLat) * Math.sin(nLat) + Math.cos(cLat) * Math.cos(nLat) * Math.cos(nLng - cLng);
        if (cosAng < cosMaxAng) continue;

        try {
          const pt = map.project([node.geo.lng, node.geo.lat]);
          if (pt.x > -40 && pt.x < cw + 40 && pt.y > -40 && pt.y < ch + 40) {
            positions.set(node.id, pt);
          }
        } catch { /* off-globe */ }
      }

      // Edges — connect to elevated positions for airborne nodes
      const screenEdges: ScreenEdge[] = [];
      for (let i = 0; i < state.edges.length; i++) {
        const edge = state.edges[i];
        if (edge.alpha <= 0) continue;
        const fromGround = positions.get(edge.fromNodeId);
        const toGround = positions.get(edge.toNodeId);
        if (!fromGround || !toGround) continue;

        const fromNode = state.nodes.find(n => n.id === edge.fromNodeId);
        const toNode = state.nodes.find(n => n.id === edge.toNodeId);
        const fromAlt = fromNode ? getAltOffset(fromNode, zoom) : 0;
        const toAlt = toNode ? getAltOffset(toNode, zoom) : 0;

        screenEdges.push({
          from: { x: fromGround.x, y: fromGround.y - fromAlt },
          to: { x: toGround.x, y: toGround.y - toAlt },
          edge,
        });
      }

      const visible = bundleEdges(screenEdges, zoom);
      for (let i = 0; i < visible.length; i++) drawEdge(ctx, visible[i].from, visible[i].to, visible[i].edge);

      // Nodes
      for (let i = 0; i < state.nodes.length; i++) {
        const pos = positions.get(state.nodes[i].id);
        if (pos) drawNode(ctx, state.nodes[i], pos, zoom);
      }

      // Live popup data
      if (selectedNodeId) {
        const liveNode = state.nodes.find(n => n.id === selectedNodeId);
        const livePos = positions.get(selectedNodeId);
        if (liveNode && livePos && liveNode.alpha > 0) {
          let heading = liveNode.detail.heading;
          if (liveNode.path && liveNode.path.length > 1 && liveNode.pathT != null) {
            const segs = liveNode.path.length - 1;
            const si = Math.min(Math.floor(liveNode.pathT * segs), segs - 1);
            const a = liveNode.path[si], b = liveNode.path[si + 1] || a;
            heading = Math.round((Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180 / Math.PI + 360) % 360);
          }
          liveSelectedRef.current = {
            node: { ...liveNode, geo: { ...liveNode.geo }, detail: { ...liveNode.detail, heading } },
            pos: livePos,
          };
          if (Math.floor(state.elapsedMs / 250) !== Math.floor((state.elapsedMs - deltaMs) / 250)) {
            forceRender(v => v + 1);
          }
        } else {
          liveSelectedRef.current = null;
        }
      } else {
        liveSelectedRef.current = null;
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current); rafRef.current = 0;
      window.removeEventListener('resize', resize);
      map.off('click', onMapClick);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      canvasRef.current = null;
    };
  }, [active, map, handleCanvasClick, selectedNodeId]);

  if (!active) return null;

  const state = stateRef.current;
  const liveData = liveSelectedRef.current;

  return (
    <>
      {showClusterList && (
        <ClusterListPanel
          clusters={state.clusters}
          nodes={state.nodes}
          onFlyTo={handleFlyTo}
          onClose={() => setShowClusterList(false)}
        />
      )}
      {!showClusterList && (
        <div
          onClick={() => setShowClusterList(true)}
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 200,
            background: 'rgba(0,0,0,0.85)', border: '1px solid #00ff00', borderRadius: 2,
            padding: '4px 8px', fontFamily: '"JetBrains Mono",monospace', fontSize: 9,
            color: '#00ff00', cursor: 'pointer', pointerEvents: 'auto',
          }}
        >
          CLUSTERS ▸
        </div>
      )}
      {liveData && (
        <NodeDetailPopup
          node={liveData.node}
          pos={liveData.pos}
          onClose={() => { setSelectedNodeId(null); liveSelectedRef.current = null; }}
        />
      )}
    </>
  );
}

export default MeshNetworkRenderer;
