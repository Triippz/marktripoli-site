import React from 'react';
import { UXVPosition } from '../types';
import { missionAudio } from '../../../utils/audioSystem';

interface UXVControlPanelProps {
  pos: UXVPosition;
  target: UXVPosition | null;
  base: UXVPosition | null;
  speed: number;
  trailMax: number;
  follow: boolean;
  panelPos: { left: number; top: number } | null;
  containerDimensions: { width: number; height: number };
  panelRef: React.RefObject<HTMLDivElement>;
  draggingRef: React.MutableRefObject<boolean>;
  dragOffsetRef: React.MutableRefObject<{ dx: number; dy: number }>;
  onClose: () => void;
  onSetTarget: (target: UXVPosition) => void;
  onSetSpeed: (speed: number) => void;
  onSetTrailMax: (max: number) => void;
  onSetFollow: (follow: boolean) => void;
  onDropPayload: () => void;
  onStop: () => void;
  onReturnToBase: () => void;
  onSetPanelPos: (pos: { left: number; top: number }) => void;
}

const UXVControlPanel: React.FC<UXVControlPanelProps> = ({
  pos,
  target,
  base,
  speed,
  trailMax,
  follow,
  panelPos,
  containerDimensions,
  panelRef,
  draggingRef,
  dragOffsetRef,
  onClose,
  onSetTarget,
  onSetSpeed,
  onSetTrailMax,
  onSetFollow,
  onDropPayload,
  onStop,
  onReturnToBase,
  onSetPanelPos
}) => {
  const handleDragStart = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    
    const rect = panelRef.current.getBoundingClientRect();
    dragOffsetRef.current = { 
      dx: e.clientX - rect.left, 
      dy: e.clientY - rect.top 
    };
    draggingRef.current = true;

    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return;
      
      const left = Math.min(
        Math.max(0, ev.clientX - dragOffsetRef.current.dx), 
        containerDimensions.width - 320
      );
      const top = Math.min(
        Math.max(0, ev.clientY - dragOffsetRef.current.dy), 
        containerDimensions.height - 160
      );
      
      onSetPanelPos({ left, top });
    };

    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      
      // Persist panel position
      try {
        localStorage.setItem('uxvPanelPos', JSON.stringify(panelPos));
      } catch {}
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleSetTarget = () => {
    const lngInput = document.getElementById('uxv-lng') as HTMLInputElement;
    const latInput = document.getElementById('uxv-lat') as HTMLInputElement;
    
    const lng = parseFloat(lngInput?.value || '');
    const lat = parseFloat(latInput?.value || '');
    
    if (!isNaN(lng) && !isNaN(lat)) {
      onSetTarget({ lng, lat });
      // Clear inputs
      if (lngInput) lngInput.value = '';
      if (latInput) latInput.value = '';
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute z-[120] w-80"
      style={{
        left: panelPos?.left ?? Math.max(16, containerDimensions.width - 320 - 16),
        top: panelPos?.top ?? Math.max(16, containerDimensions.height - 280),
        cursor: draggingRef.current ? 'grabbing' : 'default'
      }}
    >
      <div className="tactical-panel p-4">
        {/* Header with drag handle */}
        <div
          className="flex justify-between items-center mb-2 cursor-move"
          onMouseDown={handleDragStart}
        >
          <div className="holo-text text-sm font-mono">UXV CONTROL</div>
          <button 
            className="tactical-button text-xs px-2 py-1" 
            onClick={onClose}
          >
            Hide
          </button>
        </div>

        {/* Position display */}
        <div className="text-xs font-mono text-gray-300 space-y-1 mb-2">
          <div>Pos: {pos.lng.toFixed(3)}, {pos.lat.toFixed(3)}</div>
          {target && (
            <div>Target: {target.lng.toFixed(3)}, {target.lat.toFixed(3)}</div>
          )}
          {base && (
            <div>Base: {base.lng.toFixed(3)}, {base.lat.toFixed(3)}</div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-2">
          {/* Target input */}
          <div className="flex items-center gap-2">
            <input 
              id="uxv-lng" 
              className="bg-gray-800 border border-green-500/30 rounded px-2 py-1 text-xs font-mono w-28" 
              placeholder="lng" 
            />
            <input 
              id="uxv-lat" 
              className="bg-gray-800 border border-green-500/30 rounded px-2 py-1 text-xs font-mono w-28" 
              placeholder="lat" 
            />
            <button 
              className="tactical-button text-xs px-2 py-1" 
              onClick={handleSetTarget}
            >
              Set Target
            </button>
          </div>

          {/* Speed control */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-gray-300">
              Speed: {speed} m/s
            </label>
            <input 
              type="range" 
              min="50" 
              max="1500" 
              value={speed} 
              onChange={(e) => onSetSpeed(parseInt(e.target.value))} 
            />
          </div>

          {/* Trail length control */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-gray-300">
              Trail Len: {trailMax}
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={trailMax}
              onChange={(e) => onSetTrailMax(parseInt(e.target.value))}
            />
          </div>

          {/* Volume control */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-gray-300">
              Volume: {Math.round(missionAudio.getVolume() * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(missionAudio.getVolume() * 100)}
              onChange={(e) => {
                const v = parseInt(e.target.value) / 100;
                missionAudio.setVolume(v);
              }}
            />
          </div>

          {/* Follow checkbox */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-gray-300 flex items-center gap-1">
              <input 
                type="checkbox" 
                checked={follow} 
                onChange={e => onSetFollow(e.target.checked)} 
              />
              Follow
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button 
              className="tactical-button text-xs px-2 py-1" 
              onClick={onDropPayload}
            >
              Drop
            </button>
            <button 
              className="tactical-button text-xs px-2 py-1" 
              onClick={onStop}
            >
              Stop
            </button>
            <button 
              disabled={!base} 
              className="tactical-button text-xs px-2 py-1" 
              onClick={onReturnToBase}
            >
              Return to Base
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UXVControlPanel;