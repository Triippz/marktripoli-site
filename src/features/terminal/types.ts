export interface TerminalState {
  isOpen: boolean;
  lines: string[];
  input: string;
  awaitPassword: boolean;
  isAdmin: boolean;
  wrongPasswords: number;
  alertMode: boolean;
  puzzleStage: number;
  currentWorkingDir: string;
}

export interface TerminalCommand {
  name: string;
  execute: (args: string[], state: TerminalState) => TerminalCommandResult;
  description?: string;
  adminOnly?: boolean;
}

export interface TerminalCommandResult {
  output?: string[];
  newState?: Partial<TerminalState>;
  actions?: TerminalAction[];
}

export interface TerminalAction {
  type:
    | 'fly_to'
    | 'zoom'
    | 'navigate'
    | 'start_uxv'
    | 'uxv_stop'
    | 'uxv_goto'
    | 'uxv_speed'
    | 'uxv_drop'
    | 'uxv_return'
    | 'uxv_follow'
    | 'play_sound'
    | 'unlock_achievement'
    | 'trigger_alert';
  payload?: any;
}

export interface FileSystemNode {
  type: 'file' | 'directory';
  name: string;
  content?: string;
  children?: Record<string, FileSystemNode>;
}

export interface TerminalControls {
  toggle: () => void;
  close: () => void;
  executeCommand: (command: string) => void;
  setInput: (input: string) => void;
  addLine: (line: string) => void;
  clearLines: () => void;
}
