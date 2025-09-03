import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileBurgerMenuProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  onContactClick?: () => void;
}

export default function MobileBurgerMenu({ soundEnabled, toggleSound, onContactClick }: MobileBurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigation = () => {
    if (location.pathname === '/briefing') {
      navigate('/');
    } else {
      navigate('/briefing');
    }
    setIsOpen(false);
  };

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Burger Button */}
      <button
        className="tactical-button text-xs px-3 py-2 min-h-[44px] flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <div className="flex flex-col gap-1">
          <div className={`w-4 h-0.5 bg-green-400 transition-transform duration-200 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`w-4 h-0.5 bg-green-400 transition-opacity duration-200 ${isOpen ? 'opacity-0' : ''}`} />
          <div className={`w-4 h-0.5 bg-green-400 transition-transform duration-200 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
            <div className="tactical-glass border border-green-500/30 rounded-md p-6 w-full max-w-sm my-auto">
              <div className="text-center mb-6">
                <div className="holo-text text-lg mb-2">MISSION CONTROL</div>
                <div className="text-gray-400 font-mono text-xs">TACTICAL MENU</div>
              </div>
              
              <div className="space-y-3">
                {/* Audio Toggle */}
                <button
                  className="tactical-button text-sm px-4 py-3 w-full flex items-center justify-between"
                  onClick={toggleSound}
                >
                  <span>AUDIO</span>
                  <span className="text-green-400">{soundEnabled ? 'ON' : 'OFF'}</span>
                </button>

                {/* Navigation */}
                <button
                  className="tactical-button text-sm px-4 py-3 w-full"
                  onClick={handleNavigation}
                >
                  {location.pathname === '/briefing' ? 'MAP VIEW' : 'EXEC BRIEF'}
                </button>

                {/* Contact */}
                {onContactClick && (
                  <button
                    className="tactical-button text-sm px-4 py-3 w-full"
                    onClick={handleContactClick}
                  >
                    CONTACT
                  </button>
                )}

                {/* Close Button */}
                <button
                  className="border border-red-500/50 text-red-300 hover:text-red-200 hover:border-red-400/70 rounded px-4 py-3 font-mono text-sm w-full mt-6"
                  onClick={() => setIsOpen(false)}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}