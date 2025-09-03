import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useTerminalState } from './hooks/useTerminalState';
import { CommandProcessor } from './services/CommandProcessor';
import TerminalWindow from './components/TerminalWindow';
import { useUXVState } from '../uxv';
import { CareerMapData } from '../career/types';
import resumeDataService from '../../services/resumeDataService';
import { TerminalAction } from './types';
import { missionAudio } from '../../utils/audioSystem';
import { useMissionControl } from '../../store/missionControl';

interface TerminalSystemProps {
  map: mapboxgl.Map | null;
  careerData: CareerMapData | null;
  onAction?: (action: TerminalAction) => void;
  onStartUXV?: (position?: { lng: number; lat: number }) => void;
  uxv?: ReturnType<typeof useUXVState>;
}

const TerminalSystem: React.FC<TerminalSystemProps> = ({
  map,
  careerData,
  onAction,
  onStartUXV,
  uxv: uxvProp
}) => {
  const terminal = useTerminalState();
  const uxv = uxvProp ?? useUXVState();
  const { triggerAlert } = useMissionControl() as any;
  const processorRef = useRef<CommandProcessor | null>(null);
  const [careerDataLocal, setCareerDataLocal] = useState<CareerMapData | null>(null);

  // Load career data locally if not provided
  useEffect(() => {
    let mounted = true;
    if (!careerData) {
      resumeDataService.getCareerMapData()
        .then((data: any) => { if (mounted) setCareerDataLocal(data as CareerMapData); })
        .catch(() => {});
    }
    return () => { mounted = false; };
  }, [careerData]);

  // Initialize command processor
  useEffect(() => {
    processorRef.current = new CommandProcessor(careerData || careerDataLocal, map);
  }, [careerData, careerDataLocal, map]);

  // Update processor when dependencies change
  useEffect(() => {
    if (processorRef.current) {
      processorRef.current.updateCareerData(careerData || careerDataLocal);
      processorRef.current.updateMap(map);
    }
  }, [careerData, careerDataLocal, map]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '`' ||
        ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 't')
      ) {
        e.preventDefault();
        terminal.toggle();
      }
      
      if (e.key === 'Escape' && terminal.isOpen) {
        terminal.close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [terminal.toggle, terminal.close, terminal.isOpen]);

  // Handle command execution
  const handleCommand = useCallback((commandInput: string) => {
    if (!processorRef.current) return;

    // Add command to terminal
    const promptString = terminal.isAdmin ? 'root@map' : 'guest@map';
    terminal.addLine(`${promptString}:${terminal.currentWorkingDir}$ ${commandInput}`);

    try {
      const result = processorRef.current.processCommand(commandInput, {
        isOpen: terminal.isOpen,
        lines: terminal.lines,
        input: terminal.input,
        awaitPassword: terminal.awaitPassword,
        isAdmin: terminal.isAdmin,
        wrongPasswords: terminal.wrongPasswords,
        alertMode: terminal.alertMode,
        puzzleStage: terminal.puzzleStage,
        currentWorkingDir: terminal.currentWorkingDir
      });

      // Add output lines
      if (result.output) {
        result.output.forEach(line => terminal.addLine(line));
      }

      // Update state
      if (result.newState) {
        (terminal as any).updateState(result.newState);
      }

      // Execute actions
      if (result.actions) {
        result.actions.forEach(action => {
          handleAction(action);
          if (onAction) {
            onAction(action);
          }
        });
      }

    } catch (error) {
      console.error('Terminal command error:', error);
      terminal.addLine('Terminal error occurred');
    }

    // Clear input
    terminal.setInput('');
  }, [terminal, onAction]);

  const handleAction = (action: TerminalAction) => {
    switch (action.type) {
      case 'fly_to':
        if (map && action.payload) {
          map.flyTo({
            center: action.payload.center,
            zoom: action.payload.zoom || map.getZoom(),
            duration: action.payload.duration || 2000,
            essential: true
          });
        }
        break;
      
      case 'zoom':
        if (map && action.payload) {
          map.zoomTo(action.payload.zoom, { 
            duration: action.payload.duration || 500 
          });
        }
        break;
      
      case 'start_uxv':
        if (onStartUXV) {
          onStartUXV(action.payload?.position);
        }
        break;
      
      case 'play_sound':
        try {
          missionAudio.playEffect(action.payload || 'beep');
        } catch (error) {
          console.warn('Failed to play sound:', error);
        }
        break;
      
      case 'unlock_achievement':
        try {
          const key = 'mcAchievements';
          const current = JSON.parse(localStorage.getItem(key) || '{}');
          current[action.payload] = { unlockedAt: Date.now() };
          localStorage.setItem(key, JSON.stringify(current));
        } catch (error) {
          console.warn('Failed to save achievement:', error);
        }
        break;
      
      case 'trigger_alert':
        // Global alert: engage ribbon/status + sound via mission control
        try { triggerAlert?.(action.payload || 6000); } catch {}
        // Local terminal visual alarm (optional)
        (terminal as any).updateState({ alertMode: true });
        setTimeout(() => {
          (terminal as any).updateState({ alertMode: false });
        }, action.payload || 4000);
        break;

      // UXV integration actions
      case 'uxv_stop':
        uxv.stopUXV();
        break;

      case 'uxv_goto':
        if (action.payload?.target) uxv.setTarget(action.payload.target);
        break;

      case 'uxv_speed':
        if (typeof action.payload?.speed === 'number') uxv.setSpeed(action.payload.speed);
        break;

      case 'uxv_drop':
        uxv.dropPayload();
        break;

      case 'uxv_return':
        uxv.returnToBase();
        break;

      case 'uxv_follow':
        if (typeof action.payload?.follow === 'boolean') uxv.setFollow(action.payload.follow);
        break;
      
      case 'trigger_easter_egg':
        // Pass to parent component to handle (ExecutiveBrief has the easter egg system)
        // The onAction callback will handle this at the parent level
        break;
    }
  };

  return (
    <>
      <TerminalWindow
        state={terminal}
        onInputChange={terminal.setInput}
        onCommand={handleCommand}
        onClose={terminal.close}
      />
    </>
  );
};

export default TerminalSystem;
