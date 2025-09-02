import { useState, useCallback } from 'react';
import type { TerminalState, TerminalActions, TerminalContext } from '../types/terminal';
import { findCommand } from '../utils/terminalCommands';
import { resolvePath as fsResolve, isDir as fsIsDir } from '../../../utils/fauxFS';
import type { FSNode } from '../../../utils/fauxFS';

interface UseTerminalProps {
  fsRoot: FSNode;
  resume?: any;
  onTriggerAlert?: (duration?: number) => void;
  onUnlockEasterEgg?: (id: string) => void;
  onTriggerEgg?: (name: string) => boolean;
}

export function useTerminal({
  fsRoot,
  resume,
  onTriggerAlert,
  onUnlockEasterEgg,
  onTriggerEgg
}: UseTerminalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<string[]>(["MC-TERM v0.1 — type 'help'", ""]);
  const [input, setInput] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('/');
  const [isAdmin, setIsAdmin] = useState(false);
  const [awaitingPassword, setAwaitingPassword] = useState(false);
  const [wrongPasswordAttempts, setWrongPasswordAttempts] = useState(0);
  const [puzzleStage, setPuzzleStage] = useState(0);

  const state: TerminalState = {
    isOpen,
    lines,
    input,
    currentDirectory,
    isAdmin,
    awaitingPassword,
    wrongPasswordAttempts,
    puzzleStage
  };

  const appendLine = useCallback((line: string = '') => {
    setLines(prev => [...prev, line]);
  }, []);

  const clear = useCallback(() => {
    setLines(["MC-TERM v0.1 — type 'help'", ""]);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const executeCommand = useCallback((rawCommand: string) => {
    const command = rawCommand.trim();
    
    // Handle puzzle stage
    if (puzzleStage === 1) {
      if (command.toLowerCase().includes('follow') && command.toLowerCase().includes('rabbit')) {
        appendLine('RIDDLE SOLVED. The matrix acknowledges your curiosity.');
        setPuzzleStage(0);
        try {
          onUnlockEasterEgg?.('code_breaker');
        } catch {
          // Silent fail
        }
      } else {
        appendLine('Hint: what did Morpheus say to Neo?');
      }
      return;
    }

    // Handle password input
    if (awaitingPassword) {
      if (command === 'legion' || command === 'LEGION') {
        appendLine('ACCESS GRANTED. Welcome, operator.');
        setIsAdmin(true);
        setAwaitingPassword(false);
        setWrongPasswordAttempts(0);
        try {
          onUnlockEasterEgg?.('hidden_commands');
        } catch {
          // Silent fail
        }
      } else {
        appendLine('ACCESS DENIED.');
        const nextAttempts = wrongPasswordAttempts + 1;
        setWrongPasswordAttempts(nextAttempts);
        setAwaitingPassword(false);
        
        if (nextAttempts >= 3) {
          try {
            onTriggerAlert?.(6000);
          } catch {
            // Silent fail
          }
          setTimeout(() => {
            // Reset attempts after alert
            setWrongPasswordAttempts(0);
          }, 4000);
        }
      }
      return;
    }

    if (!command) {
      appendLine();
      return;
    }

    const [cmdName, ...args] = command.split(/\s+/);
    
    // Special handling for login command
    if (cmdName.toLowerCase() === 'login') {
      if (isAdmin) {
        appendLine('Already logged in as admin.');
        return;
      }
      setAwaitingPassword(true);
      appendLine('Password:');
      return;
    }

    // Special handling for puzzle command
    if (cmdName.toLowerCase() === 'puzzle') {
      appendLine('RIDDLE: The signal hides in green rain. What must you do?');
      setPuzzleStage(1);
      return;
    }

    // Special handling for cd command (needs to update state)
    if (cmdName.toLowerCase() === 'cd') {
      const target = args[0] || '/';
      const nextPath = fsResolve(currentDirectory, target);
      if (fsIsDir(fsRoot, nextPath)) {
        setCurrentDirectory(nextPath);
      } else {
        appendLine(`cd: no such file or directory: ${target}`);
      }
      return;
    }

    // Find and execute command
    const cmd = findCommand(cmdName);
    if (cmd) {
      const context: TerminalContext = {
        state,
        actions: { open, close, toggle, setInput, executeCommand, appendLine, clear },
        fsRoot,
        resume,
        onTriggerAlert,
        onUnlockEasterEgg,
        onTriggerEgg
      };
      cmd.handler(args, context);
    } else {
      appendLine(`Unknown command: ${cmdName}`);
    }
  }, [
    puzzleStage, awaitingPassword, wrongPasswordAttempts, isAdmin, currentDirectory,
    appendLine, onUnlockEasterEgg, onTriggerAlert, onTriggerEgg, fsRoot, resume,
    state, open, close, toggle, clear
  ]);

  const actions: TerminalActions = {
    open,
    close,
    toggle,
    setInput,
    executeCommand,
    appendLine,
    clear
  };

  const getPrompt = useCallback(() => {
    return (isAdmin ? 'root@mc' : 'guest@mc') + ':' + currentDirectory + '$';
  }, [isAdmin, currentDirectory]);

  return {
    ...state,
    ...actions,
    getPrompt
  };
}