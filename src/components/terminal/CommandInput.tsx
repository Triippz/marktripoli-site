import { useState, useRef, useEffect } from 'react';
import { useMissionControl } from '../../store/missionControl';

interface CommandInputProps {
  onCommand: (command: string) => void;
}

function CommandInput({ onCommand }: CommandInputProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { commandHistory } = useMissionControl();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim();
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    onCommand(command);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Command History Display */}
      <div className="max-h-32 overflow-y-auto space-y-1">
        {commandHistory.slice(-5).map((cmd, index) => (
          <div key={index} className="text-xs font-mono">
            <div className="text-green-500">
              &gt; {cmd.input}
            </div>
            {cmd.result && (
              <div className="text-gray-400 pl-2">
                {cmd.result}
              </div>
            )}
            {cmd.error && (
              <div className="text-red-400 pl-2">
                {cmd.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Command Input */}
      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="text-green-500 font-mono mr-2">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-white font-mono outline-none caret-green-500"
          placeholder="Enter command (try 'help')"
          autoComplete="off"
        />
      </form>

      {/* Command Hints */}
      <div className="text-xs text-gray-400 font-mono">
        Quick commands: engage • brief • logs • aar • media • help • close
      </div>
    </div>
  );
}

export default CommandInput;