import { useState, useCallback } from 'react';
import { TerminalState, TerminalControls } from '../types';

const INITIAL_STATE: TerminalState = {
  isOpen: false,
  lines: ["MAP-TERM v0.1 — type 'help'", ""],
  input: '',
  awaitPassword: false,
  isAdmin: false,
  wrongPasswords: 0,
  alertMode: false,
  puzzleStage: 0,
  currentWorkingDir: '/'
};

export function useTerminalState(): TerminalState & TerminalControls {
  const [state, setState] = useState<TerminalState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<TerminalState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggle = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const setInput = useCallback((input: string) => {
    setState(prev => ({ ...prev, input }));
  }, []);

  const addLine = useCallback((line: string = '') => {
    setState(prev => ({ ...prev, lines: [...prev.lines, line] }));
  }, []);

  const clearLines = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      lines: ["MAP-TERM v0.1 — type 'help'", ""] 
    }));
  }, []);

  const executeCommand = useCallback((command: string) => {
    // This will be implemented by the command processor
    // For now, just add to lines
    setState(prev => ({
      ...prev,
      lines: [...prev.lines, `${getPromptString(prev)} ${command}`, ''],
      input: ''
    }));
  }, []);

  return {
    ...state,
    toggle,
    close,
    executeCommand,
    setInput,
    addLine,
    clearLines,
    updateState
  } as any;
}

function getPromptString(state: TerminalState): string {
  const user = state.isAdmin ? 'root' : 'guest';
  return `${user}@map:${state.currentWorkingDir}$`;
}