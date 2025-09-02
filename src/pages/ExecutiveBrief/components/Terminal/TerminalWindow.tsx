import { useEffect, useRef } from 'react';

interface TerminalWindowProps {
  isOpen: boolean;
  lines: string[];
  input: string;
  prompt: string;
  placeholder: string;
  onInputChange: (value: string) => void;
  onExecuteCommand: (command: string) => void;
  onClose: () => void;
}

export function TerminalWindow({
  isOpen,
  lines,
  input,
  prompt,
  placeholder,
  onInputChange,
  onExecuteCommand,
  onClose
}: TerminalWindowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const command = input;
      onInputChange('');
      onExecuteCommand(command);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="terminal-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-label="Mission Terminal"
    >
      <div className="terminal-window">
        <div className="terminal-header">
          MISSION TERMINAL — Press Esc to close
        </div>
        <div className="terminal-body">
          {lines.map((line, i) => (
            <div key={i} className="terminal-line">
              {line}
            </div>
          ))}
        </div>
        <div className="terminal-input">
          <span className="terminal-prompt">{prompt}</span>
          <input
            ref={inputRef}
            className="terminal-field"
            autoFocus
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
        </div>
        <div className="terminal-hint mt-2">
          Hints: try 'login', 'eggs', 'trigger ufo', 'scan'.
        </div>
      </div>
    </div>
  );
}