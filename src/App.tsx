import { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMissionControl } from './store/missionControl';
import ErrorBoundary from './components/ErrorBoundary';
import { InitializingLoader, TacticalLoader } from './components/LoadingSpinner';
import { AccessibilityProvider, AccessibilityStyles } from './components/AccessibilityProvider';
import { SkipNavigation, SkipTarget } from './components/SkipNavigation';
import MapboxGlobe from './components/MapboxGlobe';
import { missionAudio } from './utils/audioSystem';
import './App.css';
import './styles/tactical-enhancements.css';

// Lazy load components for better performance
const MapboxScene = lazy(() => import('./components/map/MapboxScene'));
const Terminal = lazy(() => import('./components/terminal/Terminal'));
const ExecutiveBriefing = lazy(() => import('./components/briefing/ExecutiveBriefing'));
const AchievementSystem = lazy(() => import('./components/gamification/AchievementSystem'));
const EncryptedContactForm = lazy(() => import('./components/contact/EncryptedContactForm'));

// Boot sequence messages
const bootMessages = [
  'INIT SYSTEMS...',
  'VERIFYING KEYS...',
  'HANDSHAKE OK...',
  'AUTH MARK TRIPOLI...',
  'SECURE LINK ESTABLISHED.',
  'ENTERING MISSION CONTROL...'
];

function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (currentMessage >= bootMessages.length) {
      setTimeout(onComplete, 1000);
      return;
    }

    const message = bootMessages[currentMessage];
    let charIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (charIndex <= message.length) {
        setDisplayText(message.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentMessage(prev => prev + 1);
        }, 500);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentMessage, onComplete]);

  return (
    <>
      {/* Background Globe */}
      <MapboxGlobe />
      
      {/* Boot Sequence Overlay */}
      <motion.div 
        className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center z-50 px-4"
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="mission-panel w-full max-w-[90vw] md:max-w-4xl p-6 md:p-8 lg:p-12"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-16">
            <motion.div 
              className="holo-text font-mono text-2xl md:text-4xl mb-6"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(0, 255, 0, 0.5)',
                  '0 0 30px rgba(0, 255, 0, 0.8)',
                  '0 0 20px rgba(0, 255, 0, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              MISSION CONTROL v2.0
            </motion.div>
            <div className="text-green-400 font-mono text-base md:text-lg mb-2">
              TACTICAL OPERATIONS SYSTEM
            </div>
            <div className="text-gray-400 font-mono text-xs md:text-sm">
              Earth Surveillance Network • Global Command Interface
            </div>
          </div>
          
          <div className="w-full">
            <div className="text-center mb-10">
              <div className="matrix-text text-xl mb-4 h-8 flex items-center justify-center">
                <span className="terminal-cursor">{displayText}</span>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative w-full">
              <div className="w-full bg-gray-900/50 rounded-full h-3 mb-6 border border-green-500/20">
                <motion.div 
                  className="relative h-full rounded-full overflow-hidden"
                  style={{
                    background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 50%, #00ff00 100%)',
                    boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentMessage + 1) / bootMessages.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Animated scanner line */}
                  <motion.div
                    className="absolute top-0 right-0 w-8 h-full bg-gradient-to-r from-transparent to-white/30"
                    animate={{ x: [-32, 8] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
              
              <div className="flex justify-between text-green-400 font-mono text-sm">
                <span>INITIALIZATION PROGRESS</span>
                <span>{Math.round(((currentMessage + 1) / bootMessages.length) * 100)}% COMPLETE</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

function MissionControlHUD({ onContactClick }: { onContactClick?: () => void }) {
  const { userRank, telemetryLogs, soundEnabled, toggleSound } = useMissionControl();

  return (
    <motion.div 
      className="fixed top-4 left-4 right-4 z-40 pointer-events-none"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Left HUD */}
        <motion.div 
          className="floating-card-glow p-4 max-w-sm pointer-events-auto"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="holo-text text-sm font-mono mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
            MISSION CONTROL HUD
          </div>
          <div className="text-white text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span>RANK:</span>
              <span className="text-green-400">{userRank.badge} {userRank.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>STATUS:</span>
              <div className="flex items-center">
                <div className="status-dot active mr-1" />
                <span className="text-green-400">OPERATIONAL</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>LINK:</span>
              <div className="flex items-center">
                <div className="status-dot active mr-1" />
                <span className="text-green-400">SECURE</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Controls */}
        <motion.div 
          className="floating-card p-4 pointer-events-auto"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex space-x-2">
            <button 
              className="tactical-button text-xs px-3 py-2"
              onClick={toggleSound}
            >
              AUDIO: {soundEnabled ? 'ON' : 'OFF'}
            </button>
            <button 
              className="tactical-button text-xs px-3 py-2"
              onClick={() => window.location.pathname === '/briefing' ? window.location.href = '/' : window.location.href = '/briefing'}
            >
              {window.location.pathname === '/briefing' ? 'MAP VIEW' : 'EXEC BRIEF'}
            </button>
            {onContactClick && (
              <button 
                className="tactical-button text-xs px-3 py-2"
                onClick={onContactClick}
              >
                CONTACT
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Telemetry Ticker */}
      <motion.div 
        className="mt-4 floating-card p-4 overflow-hidden pointer-events-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
          <span className="text-green-400 font-mono text-xs uppercase">Live Telemetry</span>
        </div>
        <div className="matrix-text text-xs">
          {telemetryLogs.slice(-1)[0] ? (
            `[${new Date().toLocaleTimeString()}] ${telemetryLogs.slice(-1)[0].message}`
          ) : (
            '[STANDBY] Awaiting mission parameters...'
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function MissionControlInterface() {
  const [showContactForm, setShowContactForm] = useState(false);
  
  return (
    <div className="h-screen w-screen text-white overflow-hidden relative">
      {/* Background Globe */}
      <MapboxGlobe />
      
      <SkipNavigation />
      
      <header role="banner">
        <MissionControlHUD onContactClick={() => setShowContactForm(true)} />
      </header>
      
      {/* Main Content Area - Tactical Overlays */}
      <SkipTarget id="main-content" className="pt-32 h-full w-full relative z-10">
        <main role="main" aria-label="Mission Control tactical interface">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="h-full flex items-center justify-center"
          >
            {/* Central Mission Status Card */}
            <motion.div
              className="mission-panel p-8 max-w-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3" />
                  <h1 className="holo-text font-mono text-2xl">MISSION CONTROL ACTIVE</h1>
                </div>
                
                <div className="text-green-400 font-mono mb-8">
                  Global Surveillance Network Online
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="tactical-glass p-4">
                    <div className="text-xs font-mono text-gray-400 mb-1">SATELLITES</div>
                    <div className="text-green-400 font-mono text-xl">247</div>
                    <div className="text-xs font-mono text-green-600">OPERATIONAL</div>
                  </div>
                  
                  <div className="tactical-glass p-4">
                    <div className="text-xs font-mono text-gray-400 mb-1">COVERAGE</div>
                    <div className="text-green-400 font-mono text-xl">99.8%</div>
                    <div className="text-xs font-mono text-green-600">GLOBAL</div>
                  </div>
                  
                  <div className="tactical-glass p-4">
                    <div className="text-xs font-mono text-gray-400 mb-1">DATA LINKS</div>
                    <div className="text-green-400 font-mono text-xl">1,247</div>
                    <div className="text-xs font-mono text-green-600">ACTIVE</div>
                  </div>
                  
                  <div className="tactical-glass p-4">
                    <div className="text-xs font-mono text-gray-400 mb-1">THREATS</div>
                    <div className="text-green-400 font-mono text-xl">0</div>
                    <div className="text-xs font-mono text-green-600">DETECTED</div>
                  </div>
                </div>
                
                <div className="text-gray-400 font-mono text-sm">
                  Click areas on Earth to access site intelligence
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </SkipTarget>

      {/* Terminal Overlay */}
      <ErrorBoundary>
        <Suspense fallback={<div />}>
          <Terminal />
        </Suspense>
      </ErrorBoundary>

      {/* Achievement System */}
      <ErrorBoundary>
        <Suspense fallback={<div />}>
          <AchievementSystem />
        </Suspense>
      </ErrorBoundary>

      {/* Contact Form */}
      <ErrorBoundary>
        <Suspense fallback={<div />}>
          <EncryptedContactForm 
            isOpen={showContactForm}
            onClose={() => setShowContactForm(false)}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Grid overlay for authentic terminal feel */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
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