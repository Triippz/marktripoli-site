import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMissionControl } from './store/missionControl';
import ErrorBoundary from './components/ErrorBoundary';
import { InitializingLoader } from './components/LoadingSpinner';
import { AccessibilityProvider, AccessibilityStyles } from './components/AccessibilityProvider';
import { SkipNavigation } from './components/SkipNavigation';
import MapboxGlobe from './components/MapboxGlobe';
import { missionAudio } from './utils/audioSystem';
import BootSequence from './components/boot/BootSequence';
import HUDTopLeftStack from './components/layout/HUDTopLeftStack';
import TopRightButtonControls from './components/layout/TopRightButtonControls';
import MainStatusPanel from './components/layout/MainStatusPanel';
import TerminalOverlay from './components/layout/TerminalOverlay';
import AchievementOverlay from './components/layout/AchievementOverlay';
import ContactFormOverlay from './components/layout/ContactFormOverlay';
import BackgroundGridOverlay from './components/BackgroundGridOverlay';
import LiveTelemetry from './components/hud/LiveTelemetry';
import StatusIndicators from './components/hud/StatusIndicators';
import TacticalStatusBar from './components/enhanced/TacticalStatusBar';
import './App.css';
import './styles/tactical-enhancements.css';

// Lazy load components for better performance
// const MapboxScene = lazy(() => import('./components/map/MapboxScene'));
const ExecutiveBriefing = lazy(() => import('./components/briefing/ExecutiveBriefing'));



function MissionControlInterface() {
  const { telemetryLogs, userRank, soundEnabled, toggleSound } = useMissionControl();
  const [showContactForm, setShowContactForm] = useState(false);
  const [earthControlActive, setEarthControlActive] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(true);

  // Auto-trigger earth control mode after a brief delay
  useEffect(() => {
    console.log('[App] 🚀 Mission Control loaded - starting 2 second timer for earth control');
    const timer = setTimeout(() => {
      console.log('[App] ⏰ Timer fired - setting earthControlActive to TRUE');
      setEarthControlActive(true);
    }, 2000); // 2 seconds after mission control loads

    return () => clearTimeout(timer);
  }, []);

  // Debug earth control active state changes
  useEffect(() => {
    console.log('[App] 🌍 earthControlActive state changed to:', earthControlActive);
    if (earthControlActive) {
      console.log('[App] 📡 Passing interactive=true to MapboxGlobe');
    }
  }, [earthControlActive]);

  const handleTransitionComplete = () => {
    // Keep the status panel visible after transition completes
    console.log('[App] Transition complete - keeping status panel visible');
    // If you later want to auto-hide, reintroduce a timeout here.
  };
  
  return (
    <div className="h-screen w-screen text-white overflow-hidden relative">
      {/* Background Globe */}
      <MapboxGlobe 
        interactive={earthControlActive}
        onTransitionComplete={handleTransitionComplete}
        onUserInteraction={() => setShowStatusPanel(false)}
      />
      
      <SkipNavigation />
      
      {/* HUD Cluster: top-left stack (MissionHUD + StatusIndicators) */}
      <HUDTopLeftStack userRank={userRank} />

      {/* Top-right button controls */}
      <TopRightButtonControls 
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        onContactClick={() => setShowContactForm(true)}
      />
      
      {/* Main Content Area - Tactical Overlays */}
      <MainStatusPanel showStatusPanel={showStatusPanel} />

      {/* Terminal Overlay */}
      <TerminalOverlay />

      {/* Achievement System */}
      <AchievementOverlay />

      {/* Contact Form */}
      <ContactFormOverlay 
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
      />

      {/* Live Telemetry */}
      <LiveTelemetry telemetryLogs={telemetryLogs} />

      {/* Status Indicators - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-50 pointer-events-auto">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <StatusIndicators />
        </motion.div>
      </div>

      {/* Tactical Status Bar */}
      <TacticalStatusBar />

      {/* Grid overlay for authentic terminal feel */}
      <BackgroundGridOverlay />
    </div>
  );
}

function App() {
  const [booting, setBooting] = useState(true);
  const { addTelemetry, soundEnabled } = useMissionControl();

  useEffect(() => {
    // Initialize audio system
    const initAudio = async () => {
      await missionAudio.initialize();
      missionAudio.setEnabled(soundEnabled);
      
      if (soundEnabled) {
        await missionAudio.playBootup();
      }
    };
    
    initAudio();
    
    // Add initial telemetry when app loads
    addTelemetry({
      source: 'SYSTEM',
      message: 'Mission Control interface initialized',
      level: 'success'
    });
  }, [addTelemetry, soundEnabled]);

  if (booting) {
    return <BootSequence onComplete={() => setBooting(false)} />;
  }

  return (
    <AccessibilityProvider>
      <AccessibilityStyles />
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<MissionControlInterface />} />
            <Route path="/briefing" element={
              <ErrorBoundary>
                <Suspense fallback={<InitializingLoader message="LOADING EXECUTIVE BRIEFING..." />}>
                  <ExecutiveBriefing />
                </Suspense>
              </ErrorBoundary>
            } />
          </Routes>
        </Router>
      </ErrorBoundary>
    </AccessibilityProvider>
  );
}

export default App;
