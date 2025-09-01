import ButtonGroup from './ButtonGroup';
import { useState, useRef, useEffect } from 'react';
import { useMissionControl } from '../../store/missionControl';

interface StatusIndicatorsProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  onContactClick: () => void;
  userLabel?: string;
}

export default function StatusIndicators({ soundEnabled, toggleSound, onContactClick, userLabel }: StatusIndicatorsProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { setUserName, setBootCompleted, addTelemetry } = useMissionControl();
  const [showSignOutToast, setShowSignOutToast] = useState(false);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div className="tactical-panel relative px-4 md:px-8 py-3 md:py-4" style={{ overflow: 'visible' }}>
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
            <div className="absolute right-0 top-full mt-2 bg-gray-900/95 border border-green-500/30 rounded-md p-3 min-w-[200px] shadow-lg backdrop-blur-sm z-50">
              <div className="text-green-500 font-mono text-xs mb-2">USER</div>
              <div className="text-white font-mono text-sm mb-3">
                {userLabel || 'Guest Operator'}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="border border-green-500/40 text-green-300 hover:text-green-200 hover:border-green-400/60 rounded px-2 py-1 font-mono text-[10px] uppercase"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Clear user session and show toast before re-opening login
                    try {
                      localStorage.removeItem('mc-user');
                      localStorage.setItem('mc-remember', 'false');
                      localStorage.setItem('mc-boot-completed', 'false');
                    } catch {}
                    setUserName('');
                    addTelemetry({ source: 'AUTH', message: 'Operator signed out. Reinitializing login.', level: 'info' });
                    setOpen(false);
                    setShowSignOutToast(true);
                    // Delay boot reset so toast is visible
                    setTimeout(() => {
                      setBootCompleted(false);
                      setShowSignOutToast(false);
                    }, 1200);
                  }}
                  className="border border-red-500/50 text-red-300 hover:text-red-200 hover:border-red-400/70 rounded px-2 py-1 font-mono text-[10px] uppercase"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Centered CLASSIFIED stamp */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center"
        aria-hidden
      >
        <div className="classified-stamp">
          <span className="classified-stamp-text" data-text="CLASSIFIED">CLASSIFIED</span>
        </div>
      </div>
      
      {/* Tiny toast for sign out */}
      {showSignOutToast && (
        <div className="fixed top-16 right-6 z-[120]">
          <div className="bg-gray-900/90 border border-green-500/40 rounded px-3 py-2 shadow-md backdrop-blur-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-300 font-mono text-xs">Signing out…</span>
          </div>
        </div>
      )}

      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60" />
    </div>
  );
}
