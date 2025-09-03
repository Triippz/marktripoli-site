import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsiveStore } from '../../store/missionControlV2';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';
import { useMissionControl } from '../../store/missionControl';
import TypewriterText from './TypewriterText';
import Dossier from '../dossier/Dossier';
import CommandInput from './CommandInput';
import CareerEngagementSequences from '../engagement/CareerEngagementSequences';

function MobileTerminalOverlay() {
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
    mobileState,
    toggleMobileBottomSheet,
    setKeyboardVisible,
    getAnimationSettings
  } = useResponsiveStore();

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showEngagementSequence, setShowEngagementSequence] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);

  const animationSettings = getAnimationSettings();

  // Handle swipe gestures for closing
  const swipeRef = useSwipeGestures<HTMLDivElement>({
    onSwipeDown: () => {
      if (!isDragging) {
        handleClose();
      }
    }
  }, { 
    threshold: 100,
    preventDefaultTouchMove: true 
  });

  useEffect(() => {
    if (selectedSite && terminalState === 'idle') {
      setTerminalState('loading');
      addTelemetry({
        source: 'TERMINAL',
        message: `Establishing link to ${selectedSite.codename || selectedSite.name}`,
        level: 'info'
      });
      setShowEngagementSequence(true);
    }
  }, [selectedSite, terminalState, setTerminalState, addTelemetry]);

  // Handle virtual keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      const isKeyboardVisible = window.visualViewport ? 
        window.visualViewport.height < window.screen.height * 0.75 : 
        window.innerHeight < window.screen.height * 0.75;
      
      setKeyboardVisible(isKeyboardVisible);
    };

    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [setKeyboardVisible]);

  const handleEngagementComplete = () => {
    setShowEngagementSequence(false);
    
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
      message: 'Mobile terminal session closed',
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
      message: `Mobile executed: ${command}`,
      level: 'info'
    });
  };

  const processCommand = (command: string): string => {
    // Same command processing as desktop Terminal
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
    if (command.includes('help')) {
      return 'Mobile commands: engage, brief, logs, aar, media, exec, close, swipe down to close';
    }
    if (command.includes('close')) {
      handleClose();
      return '[SUCCESS] Closing mobile terminal session.';
    }
    
    // Easter eggs (same as desktop)
    if (command.includes('sudo aliens') || command.includes('sudo ufo')) {
      unlockEasterEgg('hidden_commands');
      return '[CLASSIFIED] UFO tracking protocol activated. Keep watching the skies...';
    }
    if (command.includes('status') || command.includes('sitrep')) {
      const stats = `[STATUS] Sites: ${visitedSites.length}/8 | Rank: ${userRank.title} | Device: Mobile | Audio: ${soundEnabled ? 'ON' : 'OFF'}`;
      return stats;
    }
    if (command.includes('whoami')) {
      return '[IDENTITY] Mark Tripoli - Engineering Leader, Former Marine, Code Architect';
    }
    
    return `[ERROR] Unknown command: ${command}. Type 'help' for mobile commands.`;
  };

  if (!selectedSite) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black z-50 flex flex-col touch-manipulation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: animationSettings.duration / 1000,
          ease: animationSettings.easing === 'linear' ? undefined : 'easeOut'
        }}
        ref={swipeRef}
        style={{
          transform: `translateY(${dragY}px)`,
        }}
      >
        {/* Mobile header with swipe indicator */}
        <div className="bg-gray-900 border-b border-green-500/30 px-4 py-3 flex justify-between items-center shrink-0">
          {/* Swipe indicator */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-600 rounded-full"></div>
          
          <div className="flex items-center space-x-3 mt-2">
            <div className="text-green-500 text-base font-mono">
              TERMINAL
            </div>
            <div className="text-gray-400 text-sm font-mono truncate max-w-[150px]">
              {selectedSite.codename || selectedSite.name}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <button 
              className="text-green-500 active:text-red-400 font-mono text-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={handleClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Career Engagement Sequences */}
        {showEngagementSequence && selectedSite && (
          <div className="flex-1 overflow-hidden">
            <CareerEngagementSequences
              site={selectedSite}
              onComplete={handleEngagementComplete}
            />
          </div>
        )}

        {/* Terminal Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {terminalState === 'loading' && !showEngagementSequence && (
            <div className="p-4 space-y-4 overflow-y-auto">
              <TypewriterText
                text={`Establishing secure link to ${selectedSite.codename || selectedSite.name}...`}
                speed={40} // Slightly faster on mobile
              />
              <TypewriterText
                text="Decrypting mission package..."
                speed={50}
                delay={800}
              />
              <TypewriterText
                text={`Downloading: ${selectedSite.type.toUpperCase()}_${selectedSite.id.toUpperCase()}.classified`}
                speed={30}
                delay={1600}
              />
              
              <div className="mt-6">
                <div className="text-green-500 text-sm font-mono mb-2">
                  DOWNLOAD PROGRESS
                </div>
                <div className="bg-gray-800 h-3 rounded-lg">
                  <motion.div
                    className="h-full bg-green-500 rounded-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${downloadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-gray-400 text-xs font-mono mt-2">
                  {Math.round(downloadProgress)}% complete
                </div>
              </div>
            </div>
          )}

          {terminalState === 'viewing' && (
            <>
              {/* Scrollable dossier content */}
              <div className="flex-1 overflow-y-auto">
                <Dossier site={selectedSite} />
              </div>
              
              {/* Fixed command input at bottom */}
              <div 
                className={`border-t border-mc-green/30 bg-gray-900 shrink-0 transition-all duration-300 ${
                  mobileState.keyboardVisible ? 'pb-0' : 'pb-safe-area-inset-bottom'
                }`}
              >
                <div className="p-4">
                  <CommandInput 
                    onCommand={handleCommand} 
                    placeholder="Enter command (or swipe down to close)..."
                    className="text-sm" // Smaller text for mobile
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Hint text for mobile users */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-gray-500 text-xs font-mono pointer-events-none">
          Swipe down to close
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MobileTerminalOverlay;