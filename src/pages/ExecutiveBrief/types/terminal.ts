import type { FSNode } from '../../../utils/fauxFS';
import type { EasterEggType } from './easterEggs';

export interface TerminalState {
  isOpen: boolean;
  lines: string[];
  input: string;
  currentDirectory: string;
  isAdmin: boolean;
  awaitingPassword: boolean;
  wrongPasswordAttempts: number;
  puzzleStage: number;
}

export interface TerminalActions {
  open: () => void;
  close: () => void;
  toggle: () => void;
  setInput: (input: string) => void;
  executeCommand: (command: string) => void;
  appendLine: (line?: string) => void;
  clear: () => void;
}

export interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  fsRoot: FSNode;
  resume?: any;
  onTriggerAlert?: (duration?: number) => void;
  onUnlockEasterEgg?: (id: string) => void;
  onTriggerEgg?: (type: EasterEggType) => boolean;
}

export type TerminalCommand = {
  name: string;
  description: string;
  handler: (args: string[], context: TerminalContext) => void;
};

export interface TerminalContext {
  state: TerminalState;
  actions: TerminalActions;
  fsRoot: FSNode;
  resume?: any;
  onTriggerAlert?: (duration?: number) => void;
  onUnlockEasterEgg?: (id: string) => void;
  onTriggerEgg?: (type: EasterEggType) => boolean;
}