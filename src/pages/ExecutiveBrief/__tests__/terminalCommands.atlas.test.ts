import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findCommand, terminalCommands } from '../utils/terminalCommands';
import type { EasterEggType } from '../types/easterEggs';

// Minimal actions mock
function makeActions() {
  return {
    appendLine: vi.fn(),
    clear: vi.fn(),
    close: vi.fn(),
  };
}

// Minimal state mock
const mockState = {
  isAdmin: false,
  currentDirectory: '/home/guest',
};

// T032a — findCommand returns command objects for 'atlas' and 'mesh'
describe('findCommand — atlas and mesh', () => {
  it('findCommand("atlas") returns a command object', () => {
    const cmd = findCommand('atlas');
    expect(cmd).toBeDefined();
    expect(cmd?.name).toBe('atlas');
  });

  it('findCommand("mesh") returns a command object', () => {
    const cmd = findCommand('mesh');
    expect(cmd).toBeDefined();
    expect(cmd?.name).toBe('mesh');
  });

  it('atlas command has a description', () => {
    const cmd = findCommand('atlas');
    expect(typeof cmd?.description).toBe('string');
    expect(cmd!.description.length).toBeGreaterThan(0);
  });

  it('mesh command has a description', () => {
    const cmd = findCommand('mesh');
    expect(typeof cmd?.description).toBe('string');
    expect(cmd!.description.length).toBeGreaterThan(0);
  });
});

// T032b — atlas command handler calls appendLine (via streamBootSequence)
describe('atlas command handler', () => {
  it('atlas command has a handler function', () => {
    const cmd = findCommand('atlas');
    expect(typeof cmd?.handler).toBe('function');
  });

  it('mesh command has a handler function', () => {
    const cmd = findCommand('mesh');
    expect(typeof cmd?.handler).toBe('function');
  });

  it('atlas command handler can be invoked without throwing', () => {
    const cmd = findCommand('atlas');
    const actions = makeActions();
    // The handler uses dynamic import so it will be async — just verify it doesn't throw synchronously
    expect(() => {
      cmd?.handler([], { state: mockState as any, actions: actions as any });
    }).not.toThrow();
  });

  it('mesh command handler can be invoked without throwing', () => {
    const cmd = findCommand('mesh');
    const actions = makeActions();
    expect(() => {
      cmd?.handler([], { state: mockState as any, actions: actions as any });
    }).not.toThrow();
  });
});

// T032e — help, eggs, trigger commands reference 'atlas'
describe('help command output includes atlas', () => {
  it('help command appends a line containing "atlas"', () => {
    const cmd = findCommand('help');
    const actions = makeActions();
    cmd?.handler([], { state: mockState as any, actions: actions as any });
    const allOutput = actions.appendLine.mock.calls.map((c: string[]) => c[0]).join('\n');
    expect(allOutput.toLowerCase()).toContain('atlas');
  });
});

describe('eggs command output includes atlas', () => {
  it('eggs command appends a line containing "atlas"', () => {
    const cmd = findCommand('eggs');
    const actions = makeActions();
    cmd?.handler([], { state: mockState as any, actions: actions as any });
    const allOutput = actions.appendLine.mock.calls.map((c: string[]) => c[0]).join('\n');
    expect(allOutput.toLowerCase()).toContain('atlas');
  });
});

describe('trigger command validEggs includes atlas', () => {
  it('trigger command succeeds when given "atlas"', () => {
    const cmd = findCommand('trigger');
    const actions = makeActions();
    const onTriggerEgg = vi.fn().mockReturnValue(true);
    cmd?.handler(['atlas'], {
      state: mockState as any,
      actions: actions as any,
      onTriggerEgg,
    } as any);
    // Should call onTriggerEgg with 'atlas' (not print "Unknown egg")
    expect(onTriggerEgg).toHaveBeenCalledWith('atlas');
    const allOutput = actions.appendLine.mock.calls.map((c: string[]) => c[0]).join('\n');
    expect(allOutput).not.toContain('Unknown egg');
  });
});
