interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpOverlay({ isOpen, onClose }: HelpOverlayProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center" 
      style={{ zIndex: 70 }} 
      role="dialog" 
      aria-modal="true" 
      aria-label="Hidden Controls"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mission-panel p-6 md:p-8 max-w-lg w-[90%]">
        <div className="holo-text font-mono text-lg mb-3">Hidden Controls</div>
        <div className="text-sm font-mono text-gray-300 space-y-1">
          <div><span className="text-green-400">Konami</span>: Toggle Matrix rain</div>
          <div><span className="text-green-400">U</span>: UFO fleet flyby</div>
          <div><span className="text-green-400">D</span>: Paw print burst</div>
          <div><span className="text-green-400">G</span>: Glitch header</div>
          <div><span className="text-green-400">P</span>: Neon panel pulse</div>
          <div><span className="text-green-400">H</span>: Hiking mode (mountains)</div>
          <div><span className="text-green-400">V</span>: CRT scanlines</div>
          <div><span className="text-green-400">B</span>: UFO beam spotlight</div>
          <div><span className="text-green-400">?</span>: Toggle this help</div>
          <div><span className="text-green-400">`</span> or <span className="text-green-400">Ctrl/Cmd+Alt+T</span>: Secret terminal</div>
          <div className="pt-2 text-gray-400">Map: idle for random events (UFO blips, satellite streaks, anomaly pings, aurora).</div>
        </div>
        <div className="text-[11px] font-mono text-gray-400 mt-3">See docs/EASTER_EGGS.md for details.</div>
        <div className="mt-4 flex justify-end">
          <button className="tactical-button text-xs px-3 py-2" onClick={onClose}>Close (Esc)</button>
        </div>
      </div>
    </div>
  );
}