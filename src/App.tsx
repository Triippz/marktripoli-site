// React & Router
import { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Store & Utils
import { useMissionControl } from './store/missionControl';
import { missionAudio } from './utils/audioSystem';

// Base Components
import { SkipNavigation } from './components/SkipNavigation';
import BootSequence from './components/boot/BootSequence';
import MapboxScene from './components/map/MapboxScene';

// Layout Components
import HUDTopLeftStack from './components/layout/HUDTopLeftStack';
import MainStatusPanel from './components/layout/MainStatusPanel';
import TerminalOverlay from './components/layout/TerminalOverlay';
import AchievementOverlay from './components/layout/AchievementOverlay';
import SocialLinksOverlay from './components/layout/ContactFormOverlay';
import BackgroundGridOverlay from './components/BackgroundGridOverlay';

// HUD Components
import LiveTelemetry from './components/hud/LiveTelemetry';
import StatusIndicators from './components/hud/StatusIndicators';

// Styles
import './App.css';
import './styles/tactical-enhancements.css';


function MissionControlInterface() {
  const { telemetryLogs, userRank, soundEnabled, toggleSound } = useMissionControl();
  const [showContactForm, setShowContactForm] = useState(false);
  const [earthControlActive, setEarthControlActive] = useState(false);

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
      console.log('[App] 📡 Earth control active - interactive mode enabled');
    }
  }, [earthControlActive]);


  return (
    <div className="h-screen w-screen text-white overflow-hidden relative">
      {/* Tactical Grid Background */}
      <BackgroundGridOverlay />
      
      {/* Interactive Map */}
      <MapboxScene />

      <SkipNavigation />

      {/* Status Indicators - Top Header with actions on right */}
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          zIndex: 60,
          pointerEvents: 'auto'
        }}
      >
        <StatusIndicators 
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
          onContactClick={() => setShowContactForm(true)}
          userLabel={userRank.username || `${userRank.badge} ${userRank.title}`}
        />
      </div>

      {/* Social Links */}
      <SocialLinksOverlay 
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
      />

      {/* HUD Top Left Stack - User Rank */}
      <HUDTopLeftStack userRank={userRank} />

      {/* Main Status Panel - Center Information */}
      <MainStatusPanel showStatusPanel={true} />

      {/* Terminal Overlay - Interactive Site Viewer */}
      <TerminalOverlay />

      {/* Achievement Overlay - Gamification System */}
      <AchievementOverlay />

      {/* Live Telemetry */}
      <LiveTelemetry telemetryLogs={telemetryLogs} />
    </div>
  );
}

// Global keyboard handler component
function GlobalKeyboardHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGlobalKeyPress = (event: KeyboardEvent) => {
      // Executive Briefing shortcuts
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        navigate('/briefing');
      } else if (event.key === 'b' && (!event.target || (event.target as HTMLElement)?.tagName !== 'INPUT')) {
        event.preventDefault();
        navigate('/briefing');
      }

      // Mission Control shortcut - ESC or M to return to main
      if (event.key === 'Escape' || (event.key === 'm' && (!event.target || (event.target as HTMLElement)?.tagName !== 'INPUT'))) {
        event.preventDefault();
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  }, [navigate]);

  return null; // This component only handles events
}

function App() {
  const { addTelemetry, soundEnabled } = useMissionControl();

  // Use local state for boot status to avoid cross-store dependencies
  const [bootCompleted, setBootCompleted] = useState(false);
  const [booting, setBooting] = useState(!bootCompleted);

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
    return <BootSequence onComplete={() => {
      setBooting(false);
      setBootCompleted(true);
      localStorage.setItem('mc-boot-completed', 'true');
    }} />;
  }

  return (
    <div>
      <Router>
        <GlobalKeyboardHandler />
        <Routes>
          <Route path="/" element={<MissionControlInterface />} />
          <Route path="/briefing" element={
            <Suspense fallback={<div>Loading...</div>}>
              <div>Executive Briefing Placeholder</div>
            </Suspense>
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
