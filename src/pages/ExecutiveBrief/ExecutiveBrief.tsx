import { useState, useMemo, useEffect } from 'react';
import SEO from '../../components/SEO';
import { useMissionControl } from '../../store/missionControl';
import { createDefaultFS } from '../../utils/fauxFS';
import BackendEngineerDisclaimer from '../../components/BackendEngineerDisclaimer';

// Module imports
import { ResumeDataProvider, useResumeData } from './providers';
import { EasterEggSystem } from './components/EasterEggs';
import { Terminal } from './components/Terminal';
import { 
  HelpOverlay, 
  Navigation, 
  LoadingState, 
  ErrorState, 
  MainContent 
} from './components/UI';
import { 
  useResumeMetadata,
  useTechStacks,
  useStrengths,
  useEasterEggs,
  useKeyboardControls
} from './hooks';

function ExecutiveBriefContent() {
  const { unlockEasterEgg } = useMissionControl() as any;
  const { resume, profile, error, loading } = useResumeData();

  // UI state
  const [glitchTitle, setGlitchTitle] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [alertMode, setAlertMode] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [showHelpFab, setShowHelpFab] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Derived data
  const metadata = useResumeMetadata(resume, profile);
  const stacks = useTechStacks(resume);
  const strengths = useStrengths(resume, profile);
  const fsRoot = useMemo(() => createDefaultFS(), []);
  const easterEggs = useEasterEggs();

  // Direct keyboard listener for FAB reveal
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        setShowHelpFab(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Show disclaimer on first load
  useEffect(() => {
    const disclaimerDismissed = localStorage.getItem('backend-disclaimer-dismissed');
    if (!disclaimerDismissed) {
      setShowDisclaimer(true);
    }
  }, []);

  // Keyboard controls
  useKeyboardControls({
    onToggleTerminal: () => setTermOpen(prev => !prev),
    onToggleHelp: () => {
      setShowHelpFab(true); // Show FAB when help is accessed via keyboard
      setHelpOpen(prev => !prev);
    },
    onGlitchTitle: () => {
      setGlitchTitle(true);
      setTimeout(() => setGlitchTitle(false), 3000);
    },
    helpOpen
  });

  const handleDisclaimerClose = () => {
    setShowDisclaimer(false);
    localStorage.setItem('backend-disclaimer-dismissed', 'true');
  };

  // State rendering
  if (error) return <ErrorState error={error} />;
  if (loading) return <LoadingState />;

  return (
    <div className="relative w-full h-screen overflow-y-auto text-white">
      <SEO 
        title="Executive Briefing — Mark Tripoli"
        description="Interactive resume and career briefing with Mission Control theme"
      />
      
      <BackendEngineerDisclaimer 
        isOpen={showDisclaimer}
        onClose={handleDisclaimerClose}
      />
      
      <EasterEggSystem alertMode={alertMode} easterEggs={easterEggs} />
      
      <Terminal
        isOpen={termOpen}
        onClose={() => setTermOpen(false)}
        fsRoot={fsRoot}
        resume={resume}
        onTriggerAlert={(duration) => {
          setAlertMode(true);
          setTimeout(() => setAlertMode(false), duration || 4000);
        }}
        onUnlockEasterEgg={unlockEasterEgg}
        onTriggerEgg={easterEggs.triggerEgg}
      />

      <HelpOverlay isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <Navigation />
      
      {/* Help Button - Only visible after first "?" keypress */}
      {showHelpFab && (
        <button
          className="w-12 h-12 rounded-full 
                     tactical-button bg-black/90 backdrop-blur-sm 
                     border border-green-500/50 flex items-center justify-center
                     text-green-400 hover:text-green-300 hover:border-green-400/70
                     transition-all duration-200 touch-manipulation shadow-lg shadow-green-500/20"
          onClick={() => setHelpOpen(true)}
          aria-label="Show hidden controls"
          style={{ 
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            WebkitTapHighlightColor: 'transparent',
            zIndex: 60
          }}
        >
          <span className="text-lg font-bold">?</span>
        </button>
      )}
      
      <MainContent
        metadata={metadata}
        resume={resume}
        profile={profile}
        stacks={stacks}
        strengths={strengths}
        glitchTitle={glitchTitle}
      />
    </div>
  );
}

export default function ExecutiveBrief() {
  return (
    <ResumeDataProvider>
      <ExecutiveBriefContent />
    </ResumeDataProvider>
  );
}