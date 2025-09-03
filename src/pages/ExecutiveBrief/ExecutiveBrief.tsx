import { useState, useMemo } from 'react';
import SEO from '../../components/SEO';
import { useMissionControl } from '../../store/missionControl';
import { createDefaultFS } from '../../utils/fauxFS';
import { useResponsive } from '../../hooks/useResponsive';

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
  const { isMobile, isTablet } = useResponsive();
  
  // UI state
  const [glitchTitle, setGlitchTitle] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [alertMode, setAlertMode] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Derived data
  const metadata = useResumeMetadata(resume, profile);
  const stacks = useTechStacks(resume);
  const strengths = useStrengths(resume, profile);
  const fsRoot = useMemo(() => createDefaultFS(), []);
  const easterEggs = useEasterEggs();

  // Keyboard controls
  useKeyboardControls({
    onToggleTerminal: () => setTermOpen(prev => !prev),
    onToggleHelp: () => setHelpOpen(prev => !prev),
    onGlitchTitle: () => {
      setGlitchTitle(true);
      setTimeout(() => setGlitchTitle(false), 3000);
    },
    helpOpen
  });

  // State rendering
  if (error) return <ErrorState error={error} />;
  if (loading) return <LoadingState />;

  return (
    <div className="relative w-full h-screen overflow-y-auto text-white">
      <SEO 
        title="Executive Briefing — Mark Tripoli"
        description="Interactive resume and career briefing with Mission Control theme"
      />
      
      <EasterEggSystem alertMode={alertMode} />
      
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
      
      {/* Mobile Help Button */}
      {(isMobile || isTablet) && (
        <button
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full 
                     tactical-button bg-black/80 backdrop-blur-sm 
                     border border-green-500/30 flex items-center justify-center
                     text-green-400 hover:text-green-300 hover:border-green-400/50
                     transition-all duration-200 touch-manipulation"
          onClick={() => setHelpOpen(true)}
          aria-label="Show hidden controls"
          style={{ WebkitTapHighlightColor: 'transparent' }}
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