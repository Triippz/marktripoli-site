import React, { useRef, useEffect } from 'react';
import { TerminalState } from '../types';

interface TerminalWindowProps {
  state: TerminalState;
  onInputChange: (input: string) => void;
  onCommand: (command: string) => void;
  onClose: () => void;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({
  state,
  onInputChange,
  onCommand,
  onClose
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when terminal opens
  useEffect(() => {
    if (state.isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.isOpen]);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [state.lines]);

  const getPromptString = () => {
    const user = state.isAdmin ? 'root' : 'guest';
    return `${user}@map:${state.currentWorkingDir}$`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const command = state.input;
      onCommand(command);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!state.isOpen) return null;

  return (
    <div className="terminal-overlay" role="dialog" aria-modal="true" aria-label="Map Terminal">
      <div className="terminal-window">
        <div className="terminal-header">
          MAP TERMINAL — ` to close
        </div>
        
        <div className="terminal-body" ref={bodyRef}>
          {state.lines.map((line, i) => (
            <div key={i} className="terminal-line">
              {line}
            </div>
          ))}
        </div>
        
        <div className="terminal-input">
          <span className="terminal-prompt">{getPromptString()}</span>
          <input
            ref={inputRef}
            className="terminal-field"
            autoFocus
            value={state.input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={state.awaitPassword ? 'Password' : 'type help'}
            type={state.awaitPassword ? 'password' : 'text'}
          />
        </div>
        
        <div className="terminal-hint mt-2">
          Try: regions, goto area51, zoom 5, center -115.8 37.24, scan, login.
        </div>
      </div>
    </div>
  );
};

export default TerminalWindow;