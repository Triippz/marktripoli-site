import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Screen reader announcements for tactical interface
export function ScreenReaderAnnouncer({ message }: { message: string }) {
  return (
    <div
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {message}
    </div>
  );
}

// Skip navigation for mission control interface
export function SkipNavigation() {
  return (
    <div className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50">
      <a
        href="#main-content"
        className="bg-mc-green text-mc-black px-4 py-2 rounded font-mono uppercase tracking-wide"
      >
        Skip to Mission Control
      </a>
      <a
        href="#briefing"
        className="bg-mc-green text-mc-black px-4 py-2 rounded font-mono uppercase tracking-wide ml-2"
      >
        Skip to Executive Briefing
      </a>
    </div>
  );
}

// Accessible focus management for mission pins
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const focusableElements = useRef<Map<string, HTMLElement>>(new Map());

  const registerFocusable = (id: string, element: HTMLElement) => {
    focusableElements.current.set(id, element);
  };

  const moveFocus = (direction: 'next' | 'prev' | 'first' | 'last') => {
    const elements = Array.from(focusableElements.current.entries());
    const currentIndex = elements.findIndex(([id]) => id === focusedElement);
    
    let newIndex: number;
    switch (direction) {
      case 'next':
        newIndex = (currentIndex + 1) % elements.length;
        break;
      case 'prev':
        newIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
        break;
      case 'first':
        newIndex = 0;
        break;
      case 'last':
        newIndex = elements.length - 1;
        break;
    }

    const [newId, newElement] = elements[newIndex] || elements[0];
    if (newElement) {
      newElement.focus();
      setFocusedElement(newId);
    }
  };

  return {
    focusedElement,
    setFocusedElement,
    registerFocusable,
    moveFocus
  };
}

// Accessible mission pin component
interface AccessibleMissionPinProps {
  id: string;
  name: string;
  type: string;
  codename?: string;
  isSelected: boolean;
  isEngaged: boolean;
  onEngage: () => void;
  onFocus: () => void;
  position: { x: number; y: number };
}

export function AccessibleMissionPin({
  id,
  name,
  type,
  codename,
  isSelected,
  isEngaged,
  onEngage,
  onFocus,
  position
}: AccessibleMissionPinProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onEngage();
        break;
      case 'Escape':
        buttonRef.current?.blur();
        break;
    }
  };

  const ariaLabel = `Mission site: ${name}${codename ? ` codename ${codename}` : ''}, type: ${type}. ${isEngaged ? 'Currently engaged' : 'Press Enter to engage'}`;

  return (
    <button
      ref={buttonRef}
      className={`
        absolute mission-pin touch-target
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black
        ${isSelected ? 'z-10' : 'z-0'}
        transition-all duration-200
      `}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={onEngage}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      aria-expanded={isEngaged}
      role="button"
      tabIndex={0}
    >
      <div
        className={`
          w-4 h-4 rounded-full border-2 transition-all duration-300
          ${isSelected 
            ? 'border-green-400 bg-green-400 shadow-glow-strong' 
            : 'border-green-500 bg-transparent'
          }
        `}
      />
      
      {/* Screen reader only status */}
      <span className="sr-only">
        {isSelected && 'Selected, '}
        {isEngaged && 'Engaged, '}
        Mission site {name}
      </span>
    </button>
  );
}

// Accessible terminal with proper ARIA roles
interface AccessibleTerminalProps {
  isOpen: boolean;
  siteName: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function AccessibleTerminal({ 
  isOpen, 
  siteName, 
  onClose, 
  children 
}: AccessibleTerminalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus management
      const firstFocusable = dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }

      // Trap focus within dialog
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
        
        if (event.key === 'Tab') {
          const focusableElements = dialogRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as NodeListOf<HTMLElement>;
          
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (event.shiftKey) {
              if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
              }
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="bg-gray-900 border border-green-500/30 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terminal-title"
        aria-describedby="terminal-description"
      >
        {/* Accessible header */}
        <div className="border-b border-mc-green/30 p-4 flex justify-between items-center">
          <div>
            <h2 id="terminal-title" className="text-green-500 text-lg font-mono">
              MISSION TERMINAL
            </h2>
            <p id="terminal-description" className="text-gray-400 text-sm font-mono">
              Viewing dossier for {siteName}
            </p>
          </div>
          <button
            className="text-green-500 hover:text-red-400 font-mono text-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={onClose}
            aria-label={`Close ${siteName} terminal`}
          >
            ✕
          </button>
        </div>

        {/* Terminal content with proper landmarks */}
        <main className="flex-1 overflow-hidden" role="main">
          {children}
        </main>
      </div>
      
      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite">
        Terminal opened for {siteName}. Use Tab to navigate, Escape to close.
      </div>
    </div>
  );
}

// High contrast mode toggle
export function HighContrastToggle() {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('mc-high-contrast') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('mc-high-contrast', String(highContrast));
  }, [highContrast]);

  return (
    <button
      className="bg-transparent border border-green-500 text-green-500 px-2 py-1 rounded hover:bg-green-500 hover:text-black transition-colors text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
      onClick={() => setHighContrast(!highContrast)}
      aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
      aria-pressed={highContrast}
    >
      CONTRAST: {highContrast ? 'HIGH' : 'NORMAL'}
    </button>
  );
}

// Reduced motion toggle
export function ReducedMotionToggle() {
  const [reducedMotion, setReducedMotion] = useState(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches || localStorage.getItem('mc-reduced-motion') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    localStorage.setItem('mc-reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

  return (
    <button
      className="bg-transparent border border-green-500 text-green-500 px-2 py-1 rounded hover:bg-green-500 hover:text-black transition-colors text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
      onClick={() => setReducedMotion(!reducedMotion)}
      aria-label={`${reducedMotion ? 'Enable' : 'Disable'} animations and motion effects`}
      aria-pressed={reducedMotion}
    >
      MOTION: {reducedMotion ? 'REDUCED' : 'NORMAL'}
    </button>
  );
}

// Keyboard navigation help
export function KeyboardHelp() {
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts = [
    { key: 'Tab / Shift+Tab', action: 'Navigate between mission sites' },
    { key: 'Enter / Space', action: 'Engage selected mission site' },
    { key: 'Escape', action: 'Close terminal or return to map' },
    { key: 'Arrow Keys', action: 'Navigate within terminal tabs' },
    { key: 'Ctrl/Cmd + K', action: 'Open command palette' },
    { key: 'B', action: 'Open executive briefing' },
    { key: '?', action: 'Show this help' }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          setShowHelp(!showHelp);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showHelp]);

  return (
    <>
      <button
        className="bg-transparent border border-green-500 text-green-500 px-2 py-1 rounded hover:bg-green-500 hover:text-black transition-colors text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
        onClick={() => setShowHelp(!showHelp)}
        aria-label="Show keyboard navigation help"
      >
        HELP: ?
      </button>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              className="bg-gray-900 border border-green-500/30 rounded-lg p-6 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-green-500 text-lg font-mono font-bold mb-4">
                KEYBOARD NAVIGATION
              </h3>
              <div className="space-y-3">
                {shortcuts.map(({ key, action }) => (
                  <div key={key} className="flex justify-between items-center">
                    <kbd className="bg-black border border-green-500/50 rounded px-2 py-1 text-xs font-mono text-green-400">
                      {key}
                    </kbd>
                    <span className="text-white text-sm ml-4 flex-1">
                      {action}
                    </span>
                  </div>
                ))}
              </div>
              <button
                className="w-full mt-6 bg-green-500 text-black py-2 rounded font-mono uppercase font-bold hover:bg-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                onClick={() => setShowHelp(false)}
              >
                Close Help
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}