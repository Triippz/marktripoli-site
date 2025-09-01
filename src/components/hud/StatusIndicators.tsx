import ButtonGroup from './ButtonGroup';
import { useState, useRef, useEffect } from 'react';

interface StatusIndicatorsProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  onContactClick: () => void;
  userLabel?: string;
}

export default function StatusIndicators({ soundEnabled, toggleSound, onContactClick, userLabel }: StatusIndicatorsProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div className="tactical-panel relative overflow-hidden px-4 md:px-8 py-3 md:py-4">
      {/* Animated scan line */}
      <div className="animate-scan-line absolute top-0 left-0 right-0 h-full opacity-30" />
      
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center" style={{ gap: '2rem' }}>
          {/* STATUS indicator */}
          <div className="flex items-center" style={{gap: '0.75rem'}}>
            <span className="holo-text text-sm font-bold tracking-wider">STATUS:</span>
            <div className="status-dot active" />
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-green-500/30" />

          {/* LINK indicator */}
          <div className="flex items-center" style={{gap: '0.75rem'}}>
            <span className="holo-text text-sm font-bold tracking-wider">LINK:</span>
            <div className="status-dot active" />
          </div>
        </div>

        {/* Right-aligned controls */}
        <div className="ml-4 flex items-center gap-2 relative" ref={menuRef}>
          <ButtonGroup 
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
            onContactClick={onContactClick}
          />
          {/* User icon */}
          <button
            onClick={() => setOpen(v => !v)}
            className="tactical-button text-xs px-2 py-2 min-h-[36px] flex items-center justify-center"
            aria-label="User menu"
            title="User menu"
          >
            👤
          </button>
          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-full mt-2 bg-gray-900/95 border border-green-500/30 rounded-md p-3 min-w-[200px] shadow-lg backdrop-blur-sm z-10">
              <div className="text-green-500 font-mono text-xs mb-2">USER</div>
              <div className="text-white font-mono text-sm mb-3">
                {userLabel || 'Guest Operator'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="border border-green-500/40 text-green-300 hover:text-green-200 hover:border-green-400/60 rounded px-2 py-1 font-mono text-[10px] uppercase"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60" />
    </div>
  );
}
