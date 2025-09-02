import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionControl } from '../../store/missionControl';
import { useResponsiveStore } from '../../store/missionControlV2';
import TypewriterText from './TypewriterText';
import Dossier from '../dossier/Dossier';
import CommandInput from './CommandInput';
import CareerEngagementSequences from '../engagement/CareerEngagementSequences';

// Lazy load mobile overlay
const MobileTerminalOverlay = lazy(() => import('./MobileTerminalOverlay'));

function Terminal() {
  const { 
    selectedSite, 
    selectSite, 
    terminalState, 
    setTerminalState,
    setActiveTab,
    addTelemetry,
    addCommand,
    visitedSites,
    userRank,
    soundEnabled,
    unlockEasterEgg
  } = useMissionControl();

  const { 
    isMobile, 
    getAnimationSettings, 
    shouldReduceMotion 
  } = useResponsiveStore();

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showEngagementSequence, setShowEngagementSequence] = useState(false);

  useEffect(() => {
    if (selectedSite && terminalState === 'idle') {
      setTerminalState('loading');
      addTelemetry({
        source: 'TERMINAL',
        message: `Establishing link to ${selectedSite.codename || selectedSite.name}`,
        level: 'info'
      });

      // Show engagement sequence first
      setShowEngagementSequence(true);
    }
  }, [selectedSite, terminalState, setTerminalState, addTelemetry]);

  const handleEngagementComplete = () => {
    setShowEngagementSequence(false);
    
    // Start download progress after engagement sequence
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTerminalState('viewing');
          addTelemetry({
            source: 'TERMINAL',
            message: `Dossier downloaded: ${selectedSite?.codename || selectedSite?.name}`,
            level: 'success'
          });
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const handleClose = () => {
    selectSite(null);
    setTerminalState('idle');
    setDownloadProgress(0);
    setShowEngagementSequence(false);
    addTelemetry({
      source: 'TERMINAL',
      message: 'Terminal session closed',
      level: 'info'
    });
  };

  const handleCommand = (command: string) => {
    const cmd = {
      input: command.toLowerCase(),
      timestamp: new Date(),
      result: processCommand(command.toLowerCase())
    };
    
    addCommand(cmd);
    addTelemetry({
      source: 'CMD',
      message: `Executed: ${command}`,
      level: 'info'
    });
  };

  const processCommand = (command: string): string => {
    if (command.includes('engage') && selectedSite) {
      return `[SUCCESS] Target ${selectedSite.codename || selectedSite.name} engaged. Dossier accessible.`;
    }
    if (command.includes('brief')) {
      setActiveTab('briefing');
      return '[SUCCESS] Switching to mission briefing.';
    }
    if (command.includes('logs')) {
      setActiveTab('logs');
      return '[SUCCESS] Accessing deployment logs.';
    }
    if (command.includes('aar')) {
      setActiveTab('aar');
      return '[SUCCESS] Loading after-action report.';
    }
    if (command.includes('media')) {
      setActiveTab('media');
      return '[SUCCESS] Accessing media files.';
    }
    if (command.includes('exec') || command.includes('executive')) {
      window.location.href = '/briefing';
      return '[SUCCESS] Launching executive briefing interface...';
    }
    if (command.includes('contact') || command.includes('comm')) {
      // This would need to be passed down as a prop or handled via global state
      return '[SUCCESS] Encrypted communication channel opened.';
    }
    if (command.includes('help')) {
      return 'Available commands: engage, brief, logs, aar, media, exec, contact, close';
    }
    if (command.includes('close')) {
      handleClose();
      return '[SUCCESS] Closing terminal session.';
    }
    
    // Hidden/Easter Egg Commands
    if (command.includes('sudo aliens') || command.includes('sudo ufo')) {
      unlockEasterEgg('hidden_commands');
      return '[CLASSIFIED] UFO tracking protocol activated. Keep watching the skies...';
    }
    if (command.includes('k9 deploy') || command.includes('dog deploy')) {
      unlockEasterEgg('k9_deploy');
      return '[SUCCESS] K9 asset deployed for morale operations. *woof*';
    }
    if (command.includes('matrix') || command.includes('red pill')) {
      return '[SYSTEM] Wake up, Neo... The matrix has you. Follow the white rabbit.';
    }
    if (command.includes('hack gibson') || command.includes('crash override')) {
      return '[ELITE] Mess with the best, die like the rest. HACK THE PLANET!';
    }
    if (command.includes('tea') || command.includes('coffee')) {
      return '[NOTICE] Caffeine levels optimal. Mission readiness maintained.';
    }
    if (command.includes('status') || command.includes('sitrep')) {
      const stats = `[STATUS] Sites visited: ${visitedSites.length}/8 | Rank: ${userRank.title} | Audio: ${soundEnabled ? 'ON' : 'OFF'}`;
      return stats;
    }
    if (command.includes('clear') || command.includes('cls')) {
      // In a real implementation, this would clear the terminal
      return '[SUCCESS] Terminal buffer cleared.';
    }
    if (command.includes('konami') || command === '↑↑↓↓←→←→ba') {
      unlockEasterEgg('konami_code');
      return '[ACHIEVEMENT] Konami code detected. 30 lives granted.';
    }
    if (command.includes('whoami')) {
      return '[IDENTITY] Mark Tripoli - Engineering Leader, Former Marine, Code Architect';
    }
    if (command.includes('date') || command.includes('time')) {
      return `[TIMESTAMP] ${new Date().toLocaleString()} - Mission Control Time`;
    }
    
    return `[ERROR] Unknown command: ${command}. Type 'help' for available commands.`;
  };

  if (!selectedSite) return null;

  // Use mobile overlay for mobile devices
  if (isMobile) {
    return (
      <Suspense fallback={<div className="fixed inset-0 bg-black z-50" />}>
        <MobileTerminalOverlay />
      </Suspense>
    );
  }

  // Desktop/tablet layout
  const animationSettings = getAnimationSettings();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-mc-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: shouldReduceMotion ? 0 : animationSettings.duration / 1000
        }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          className="bg-gray-900 border border-green-500/30 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { 
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: animationSettings.duration / 1000
          }}
        >
          {/* Terminal Header */}
          <div className="border-b border-mc-green/30 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-green-500 text-lg font-mono">
                MISSION TERMINAL
              </div>
              <div className="text-gray-400 text-sm font-mono">
                {selectedSite.codename || selectedSite.name}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <button 
                className="text-green-500 hover:text-red-400 font-mono text-xl"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Career Engagement Sequences */}
          {showEngagementSequence && selectedSite && (
            <CareerEngagementSequences
              site={selectedSite}
              onComplete={handleEngagementComplete}
            />
          )}

          {/* Terminal Content */}
          <div className="flex-1 overflow-hidden">
            {terminalState === 'loading' && !showEngagementSequence && (
              <div className="p-6 space-y-4">
                <TypewriterText
                  text={`Establishing secure link to ${selectedSite.codename || selectedSite.name}...`}
                  speed={30}
                />
                <TypewriterText
                  text="Decrypting mission package..."
                  speed={40}
                  delay={1000}
                />
                <TypewriterText
                  text={`Downloading dossier: ${selectedSite.type.toUpperCase()}_${selectedSite.id.toUpperCase()}.classified`}
                  speed={20}
                  delay={2000}
                />
                
                <div className="mt-6">
                  <div className="text-green-500 text-sm font-mono mb-2">
                    DOWNLOAD PROGRESS
                  </div>
                  <div className="bg-gray-800 h-2 rounded">
                    <motion.div
                      className="h-full bg-green-500 rounded"
                      initial={{ width: 0 }}
                      animate={{ width: `${downloadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-gray-400 text-xs font-mono mt-1">
                    {Math.round(downloadProgress)}% complete
                  </div>
                </div>
              </div>
            )}

            {terminalState === 'viewing' && (
              <div className="flex flex-col h-full">
                <Dossier site={selectedSite} />
                
                {/* Command Input */}
                <div className="border-t border-mc-green/30 p-4">
                  <CommandInput onCommand={handleCommand} />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Terminal;