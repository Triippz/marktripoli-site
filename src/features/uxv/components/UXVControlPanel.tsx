import React from 'react';
import { UXVPosition, WeaponType, PatrolMode } from '../types';
import { missionAudio } from '../../../utils/audioSystem';

interface UXVControlPanelProps {
  pos: UXVPosition;
  target: UXVPosition | null;
  base: UXVPosition | null;
  speed: number;
  trailMax: number;
  follow: boolean;
  weaponType: WeaponType;
  patrolMode: PatrolMode;
  altitude: number;
  charging: boolean;
  chargePower: number;
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
  onSetWeaponType: (weapon: WeaponType) => void;
  onSetPatrolMode: (mode: PatrolMode) => void;
  onSetAltitude: (altitude: number) => void;
  onStartCharging: () => void;
  onStopCharging: () => void;
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
  weaponType,
  patrolMode,
  altitude,
  charging,
  chargePower,
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
  onSetWeaponType,
  onSetPatrolMode,
  onSetAltitude,
  onStartCharging,
  onStopCharging,
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

          {/* Weapon Type Selector */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-gray-300">Weapon:</label>
            <select 
              value={weaponType} 
              onChange={(e) => onSetWeaponType(e.target.value as WeaponType)}
              className="bg-black border border-green-500 text-green-400 text-xs px-1"
            >
              <option value="projectile">Projectile</option>
              <option value="laser">Laser</option>
              <option value="pulse">Pulse</option>
              <option value="orbital">Orbital Strike</option>
            </select>
          </div>

          {/* Patrol Mode Selector */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-gray-300">Patrol:</label>
            <select 
              value={patrolMode} 
              onChange={(e) => onSetPatrolMode(e.target.value as PatrolMode)}
              className="bg-black border border-green-500 text-green-400 text-xs px-1"
            >
              <option value="none">Manual</option>
              <option value="circle">Circle Earth</option>
              <option value="figure8">Figure-8</option>
              <option value="random">Random</option>
              <option value="zigzag">Zigzag</option>
            </select>
          </div>

          {/* Speed control */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-gray-300">
              Speed: {speed} m/s
            </label>
            <input 
              type="range" 
              min="50" 
              max="10000"
              value={speed} 
              onChange={(e) => onSetSpeed(parseInt(e.target.value))} 
            />
          </div>

          {/* Altitude control */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-gray-300">
              Alt: {altitude}m
            </label>
            <input 
              type="range" 
              min="100" 
              max="5000"
              value={altitude} 
              onChange={(e) => onSetAltitude(parseInt(e.target.value))} 
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

          {/* Charging Power Display (for laser weapons) */}
          {weaponType !== 'projectile' && (
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-gray-300">
                Power: {Math.round(chargePower * 100)}%
              </label>
              <div className="w-16 h-2 bg-gray-800 border border-green-500">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-red-400 transition-all duration-100"
                  style={{ width: `${Math.min(100, chargePower * 50)}%` }}
                />
              </div>
            </div>
          )}

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

          {/* Weapon Action buttons */}
          <div className="grid grid-cols-2 gap-1">
            {weaponType !== 'projectile' ? (
              <>
                <button 
                  className={`tactical-button text-xs px-2 py-1 ${charging ? 'bg-red-900' : ''}`}
                  onMouseDown={onStartCharging}
                  onMouseUp={onStopCharging}
                  onMouseLeave={onStopCharging}
                >
                  {charging ? 'Charging...' : 'Hold to Charge'}
                </button>
                <button 
                  className="tactical-button text-xs px-2 py-1" 
                  onClick={onDropPayload}
                >
                  Fire {weaponType}
                </button>
              </>
            ) : (
              <button 
                className="tactical-button text-xs px-2 py-1 col-span-2" 
                onClick={onDropPayload}
              >
                Launch Projectile
              </button>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
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