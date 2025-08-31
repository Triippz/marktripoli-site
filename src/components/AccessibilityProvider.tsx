import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  focusVisible: boolean;
  announcements: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Check for stored preferences
    const stored = localStorage.getItem('accessibility-settings');
    const defaultSettings: AccessibilitySettings = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      fontSize: 'normal',
      focusVisible: true,
      announcements: true
    };

    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    root.classList.remove('font-large', 'font-extra-large');
    if (settings.fontSize === 'large') {
      root.classList.add('font-large');
    } else if (settings.fontSize === 'extra-large') {
      root.classList.add('font-extra-large');
    }

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible-enabled');
    } else {
      root.classList.remove('focus-visible-enabled');
    }

    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Listen for system preference changes
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Screen reader announcements
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.announcements) return;

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  };

  const contextValue: AccessibilityContextType = {
    ...settings,
    updateSetting,
    announce
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      <ScreenReaderAnnouncements />
    </AccessibilityContext.Provider>
  );
}

// Component for live region announcements
function ScreenReaderAnnouncements() {
  return (
    <>
      <div
        id="polite-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        id="assertive-announcements"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}

// Accessibility styles component
export function AccessibilityStyles() {
  return (
    <style>
      {`
        /* Screen reader only content */
        .sr-only {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }

        /* High contrast mode */
        .high-contrast {
          --mc-green: #00ff00;
          --mc-red: #ff0000;
          --mc-yellow: #ffff00;
          --mc-blue: #0066ff;
          --mc-white: #ffffff;
          --mc-black: #000000;
          --mc-gray: #808080;
        }

        .high-contrast * {
          text-shadow: none !important;
          box-shadow: none !important;
        }

        .high-contrast .tactical-panel,
        .high-contrast .terminal-window {
          border-width: 2px !important;
          background: #000000 !important;
        }

        /* Font size adjustments */
        .font-large {
          font-size: 1.125rem;
        }

        .font-large .text-xs { font-size: 0.875rem; }
        .font-large .text-sm { font-size: 1rem; }
        .font-large .text-base { font-size: 1.25rem; }
        .font-large .text-lg { font-size: 1.5rem; }
        .font-large .text-xl { font-size: 1.875rem; }

        .font-extra-large {
          font-size: 1.25rem;
        }

        .font-extra-large .text-xs { font-size: 1rem; }
        .font-extra-large .text-sm { font-size: 1.125rem; }
        .font-extra-large .text-base { font-size: 1.375rem; }
        .font-extra-large .text-lg { font-size: 1.625rem; }
        .font-extra-large .text-xl { font-size: 2rem; }

        /* Enhanced focus visibility */
        .focus-visible-enabled *:focus-visible {
          outline: 3px solid var(--mc-green) !important;
          outline-offset: 2px !important;
        }

        .focus-visible-enabled button:focus-visible,
        .focus-visible-enabled [role="button"]:focus-visible {
          box-shadow: 0 0 0 3px var(--mc-green) !important;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Skip navigation link */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: var(--mc-green);
          color: var(--mc-black);
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          z-index: 1000;
          font-weight: bold;
          transition: top 0.3s;
        }

        .skip-link:focus {
          top: 6px;
        }

        /* Ensure sufficient color contrast */
        .text-gray-400 {
          color: #9ca3af;
        }

        .high-contrast .text-gray-400 {
          color: #ffffff;
        }

        /* Touch targets */
        @media (pointer: coarse) {
          button, [role="button"], input, select, textarea, a[href] {
            min-height: 44px;
            min-width: 44px;
          }
        }

        /* Animation preferences */
        :root {
          --animation-duration: 0.3s;
          --transition-duration: 0.2s;
        }

        * {
          animation-duration: var(--animation-duration);
          transition-duration: var(--transition-duration);
        }
      `}
    </style>
  );
}