import * as mapboxgl from 'mapbox-gl';
import { TerminalCommand, TerminalState, TerminalCommandResult } from '../types';
import { getGeofences, goToGeofence } from '../../../utils/easterEggs/mapEasterEggs';
import { createDefaultFS, resolvePath, isDir, listDir, readFile } from '../../../utils/fauxFS';
import { CareerMapData } from '../../../types/careerData';

export class CommandProcessor {
  private commands: Map<string, TerminalCommand> = new Map();
  private filesystem = createDefaultFS();

  constructor(
    private careerData: CareerMapData | null = null,
    private map: mapboxgl.Map | null = null
  ) {
    this.initializeCommands();
  }

  private initializeCommands() {
    // System commands
    this.registerCommand({
      name: 'help',
      execute: () => ({
        output: [
          'Commands: help, clear, login, regions, companies, goto <key>, goto hq <company>, hq <company>, zoom <n>, center <lng> <lat>, scan, close',
          'Linux-ish: pwd, ls, whoami, uname -a, date, echo <txt>, cat <file>, man <cmd>, sudo su'
        ]
      })
    });

    this.registerCommand({
      name: 'clear',
      execute: () => ({
        newState: { 
          lines: ["MAP-TERM v0.1 — type 'help'", ""] 
        }
      })
    });

    this.registerCommand({
      name: 'cls',
      execute: () => this.commands.get('clear')?.execute([], {} as TerminalState) || {}
    });

    this.registerCommand({
      name: 'close',
      execute: () => ({
        newState: { isOpen: false }
      })
    });

    // Authentication commands
    this.registerCommand({
      name: 'login',
      execute: () => ({
        output: ['Password:'],
        newState: { awaitPassword: true }
      })
    });

    // Information commands
    this.registerCommand({
      name: 'regions',
      execute: () => ({
        output: [this.listRegions()]
      })
    });

    this.registerCommand({
      name: 'companies',
      execute: () => ({
        output: [this.listCompanies()]
      })
    });

    // Navigation commands
    this.registerCommand({
      name: 'goto',
      execute: (args, state) => this.executeGoto(args, state)
    });

    this.registerCommand({
      name: 'hq',
      execute: (args, state) => this.executeHQ(args, state)
    });

    this.registerCommand({
      name: 'zoom',
      execute: (args) => this.executeZoom(args)
    });

    this.registerCommand({
      name: 'center',
      execute: (args) => this.executeCenter(args)
    });

    this.registerCommand({
      name: 'scan',
      execute: () => this.executeScan()
    });

    // UXV commands
    this.registerCommand({
      name: 'uxv',
      execute: (args, state) => this.executeUXV(args, state)
    });

    // Linux-like commands
    this.registerCommand({
      name: 'pwd',
      execute: (_args, state) => ({
        output: [state.currentWorkingDir]
      })
    });

    this.registerCommand({
      name: 'ls',
      execute: (args, state) => this.executeLs(args, state)
    });

    this.registerCommand({
      name: 'cd',
      execute: (args, state) => this.executeCd(args, state)
    });

    this.registerCommand({
      name: 'cat',
      execute: (args, state) => this.executeCat(args, state)
    });

    this.registerCommand({
      name: 'whoami',
      execute: (_args, state) => ({
        output: [state.isAdmin ? 'root' : 'guest']
      })
    });

    this.registerCommand({
      name: 'uname',
      execute: (args) => ({
        output: [args[0] === '-a' ? 'Linux mc 6.2.0-mc #1 SMP x86_64 GNU/Linux' : 'Linux']
      })
    });

    this.registerCommand({
      name: 'date',
      execute: () => ({
        output: [new Date().toString()]
      })
    });

    this.registerCommand({
      name: 'echo',
      execute: (args) => ({
        output: [args.join(' ')]
      })
    });

    this.registerCommand({
      name: 'man',
      execute: () => ({
        output: ['No manual entry. This is not a real shell.']
      })
    });

    this.registerCommand({
      name: 'sudo',
      execute: (args) => this.executeSudo(args)
    });

    // Easter egg commands
    this.registerCommand({
      name: 'probe',
      execute: () => ({
        output: ['PROBE: Complete the phrase to calibrate sensors. "_____ the _____"'],
        newState: { puzzleStage: 1 }
      })
    });
  }

  private registerCommand(command: TerminalCommand) {
    this.commands.set(command.name, command);
  }

  public processCommand(input: string, state: TerminalState): TerminalCommandResult {
    const trimmedInput = input.trim();

    // Handle puzzle stage
    if (state.puzzleStage === 1) {
      if (trimmedInput.toLowerCase().includes('watch') && trimmedInput.toLowerCase().includes('skies')) {
        return {
          output: ['Probe complete. Anomalies acknowledged.'],
          newState: { puzzleStage: 0 },
          actions: [{ type: 'unlock_achievement', payload: 'hidden_commands' }]
        };
      } else {
        return { output: ['Hint: a classic UFO trope.'] };
      }
    }

    // Handle password prompt
    if (state.awaitPassword) {
      if (trimmedInput.toLowerCase() === 'legion') {
        return {
          output: ['ACCESS GRANTED.'],
          newState: { 
            isAdmin: true, 
            awaitPassword: false, 
            wrongPasswords: 0 
          },
          actions: [
            { type: 'unlock_achievement', payload: 'map_admin' },
            { type: 'play_sound', payload: 'access_granted' }
          ]
        };
      } else {
        const newWrongCount = state.wrongPasswords + 1;
        const result: TerminalCommandResult = {
          output: ['ACCESS DENIED.'],
          newState: { 
            awaitPassword: false, 
            wrongPasswords: newWrongCount 
          }
        };

        if (newWrongCount >= 3) {
          result.newState!.alertMode = true;
          result.newState!.wrongPasswords = 0;
          result.actions = [{ type: 'trigger_alert', payload: 6000 }];
        }

        return result;
      }
    }

    if (!trimmedInput) {
      return { output: [''] };
    }

    // Parse command and arguments
    const [commandName, ...args] = trimmedInput.split(/\s+/);
    const command = this.commands.get(commandName.toLowerCase());

    if (command) {
      if (command.adminOnly && !state.isAdmin) {
        return { output: ['Permission denied. Admin access required.'] };
      }
      return command.execute(args, state);
    } else {
      return { output: [`Unknown: ${commandName}`] };
    }
  }

  // Helper methods
  private listRegions(): string {
    return getGeofences().map(g => g.key).join(', ');
  }

  private listCompanies(): string {
    return (this.careerData?.markers || [])
      .map(m => m.name)
      .filter((v, i, a) => !!v && a.indexOf(v) === i)
      .join(', ') || '(none)';
  }

  private executeGoto(args: string[], state: TerminalState): TerminalCommandResult {
    if (!args[0]) {
      return { output: ['Usage: goto <region-key> | goto hq <company>'] };
    }

    if (args[0].toLowerCase() === 'hq') {
      const query = args.slice(1).join(' ');
      if (!query) {
        return { output: ['Usage: goto hq <company>'] };
      }
      return this.executeHQ([query], state);
    } else {
      const key = args[0].toLowerCase();
      if (this.map && goToGeofence(this.map, key, 10)) {
        return {
          output: [`Navigating to ${key}…`],
          newState: { isOpen: false },
          actions: [
            { type: 'unlock_achievement', payload: `visit_${key}` },
            { type: 'play_sound', payload: 'navigate' }
          ]
        };
      } else {
        return { output: [`Unknown region: ${key}`] };
      }
    }
  }

  private executeHQ(args: string[], state: TerminalState): TerminalCommandResult {
    const query = args.join(' ');
    if (!query) {
      return { output: ['Usage: hq <company>'] };
    }

    if (!this.map || !this.careerData) {
      return { output: ['Map or career data not available'] };
    }

    const target = this.careerData.markers.find(m => 
      (m.name || '').toLowerCase().includes(query.toLowerCase())
    );

    if (!target) {
      return { output: [`Unknown company: ${query}`] };
    }

    return {
      output: [`Navigating to ${query} HQ…`],
      newState: { isOpen: false },
      actions: [
        { 
          type: 'fly_to', 
          payload: { 
            center: [target.location.lng, target.location.lat], 
            zoom: 10, 
            duration: 1200 
          } 
        },
        { type: 'unlock_achievement', payload: `visit_hq_${query.toLowerCase()}` },
        { type: 'play_sound', payload: 'navigate' }
      ]
    };
  }

  private executeZoom(args: string[]): TerminalCommandResult {
    const zoom = parseFloat(args[0]);
    if (!this.map || isNaN(zoom)) {
      return { output: ['Usage: zoom <number>'] };
    }

    return {
      output: [`Zoom ${zoom}`],
      actions: [{ type: 'zoom', payload: { zoom, duration: 500 } }]
    };
  }

  private executeCenter(args: string[]): TerminalCommandResult {
    const lng = parseFloat(args[0]);
    const lat = parseFloat(args[1]);
    
    if (!this.map || isNaN(lng) || isNaN(lat)) {
      return { output: ['Usage: center <lng> <lat>'] };
    }

    return {
      output: [`Center ${lng}, ${lat}`],
      actions: [{ 
        type: 'fly_to', 
        payload: { center: [lng, lat], duration: 800 } 
      }]
    };
  }

  private executeScan(): TerminalCommandResult {
    return {
      output: ['Scanning…'],
      actions: [
        { type: 'unlock_achievement', payload: 'map_scan' },
        { type: 'play_sound', payload: 'scan' }
      ]
    };
  }

  private executeUXV(args: string[], state: TerminalState): TerminalCommandResult {
    const subcommand = (args[0] || '').toLowerCase();
    
    if (!subcommand || subcommand === 'help') {
      return {
        output: ['uxv subcmds: start [lng lat], stop, goto <lng> <lat> | region <key>, speed <mps>, drop']
      };
    }

    // start [lng lat]
    if (subcommand === 'start') {
      let position: { lng: number; lat: number } | undefined = undefined;
      const lng = parseFloat(args[1]);
      const lat = parseFloat(args[2]);
      if (!isNaN(lng) && !isNaN(lat)) {
        position = { lng, lat };
      } else if (this.map) {
        const c = this.map.getCenter();
        position = { lng: c.lng, lat: c.lat };
      }
      return {
        output: ['UXV: start'],
        newState: { isOpen: false },
        actions: [
          { type: 'start_uxv', payload: { position } },
          { type: 'play_sound', payload: 'engage' }
        ]
      };
    }

    // stop
    if (subcommand === 'stop') {
      return { output: ['UXV: stop'], newState: { isOpen: false }, actions: [{ type: 'uxv_stop' }] };
    }

    // goto <lng> <lat> | region <key>
    if (subcommand === 'goto') {
      if (args[1] && args[1].toLowerCase() === 'region') {
        const key = (args[2] || '').toLowerCase();
        if (!key) return { output: ['Usage: uxv goto region <key>'] };
        const g = getGeofences().find(x => x.key === key);
        if (!g) return { output: [`Unknown region: ${key}`] };
        const tgt = {
          lng: (g.box.minLng + g.box.maxLng) / 2,
          lat: (g.box.minLat + g.box.maxLat) / 2
        };
        return {
          output: [`UXV: target set to ${key}`],
          newState: { isOpen: false },
          actions: [
            { type: 'uxv_goto', payload: { target: tgt } },
            { type: 'play_sound', payload: 'navigate' }
          ]
        };
      }

      const lng = parseFloat(args[1]);
      const lat = parseFloat(args[2]);
      if (isNaN(lng) || isNaN(lat)) return { output: ['Usage: uxv goto <lng> <lat>'] };
      return {
        output: [`UXV: target set to ${lng}, ${lat}`],
        newState: { isOpen: false },
        actions: [
          { type: 'uxv_goto', payload: { target: { lng, lat } } },
          { type: 'play_sound', payload: 'navigate' }
        ]
      };
    }

    // speed <mps>
    if (subcommand === 'speed') {
      const speed = parseFloat(args[1]);
      if (isNaN(speed)) return { output: ['Usage: uxv speed <mps>'] };
      return { output: [`UXV: speed ${speed} m/s`], newState: { isOpen: false }, actions: [{ type: 'uxv_speed', payload: { speed } }] };
    }

    // drop
    if (subcommand === 'drop') {
      return { output: ['UXV: payload drop'], newState: { isOpen: false }, actions: [{ type: 'uxv_drop' }] };
    }

    // return
    if (subcommand === 'return') {
      return { output: ['UXV: return to base'], newState: { isOpen: false }, actions: [{ type: 'uxv_return' }] };
    }

    // follow on|off
    if (subcommand === 'follow') {
      const val = (args[1] || '').toLowerCase();
      if (val !== 'on' && val !== 'off') return { output: ['Usage: uxv follow <on|off>'] };
      return { output: [`UXV: follow ${val}`], newState: { isOpen: false }, actions: [{ type: 'uxv_follow', payload: { follow: val === 'on' } }] };
    }

    return { output: [`UXV: unknown subcommand '${subcommand}'`] };
  }

  private executeLs(args: string[], state: TerminalState): TerminalCommandResult {
    const target = resolvePath(state.currentWorkingDir, args[0] || '.');
    const list = listDir(this.filesystem, target);
    
    if (list) {
      return { output: [list.join('  ')] };
    } else {
      return { output: [`ls: cannot access '${args[0] || '.'}': Not a directory`] };
    }
  }

  private executeCd(args: string[], state: TerminalState): TerminalCommandResult {
    const target = args[0] || '/';
    const newPath = resolvePath(state.currentWorkingDir, target);
    
    if (isDir(this.filesystem, newPath)) {
      return { newState: { currentWorkingDir: newPath } };
    } else {
      return { output: [`cd: no such file or directory: ${target}`] };
    }
  }

  private executeCat(args: string[], state: TerminalState): TerminalCommandResult {
    const fileArg = args[0];
    if (!fileArg) {
      return { output: ['cat: missing file operand'] };
    }

    let path = resolvePath(state.currentWorkingDir, fileArg);
    
    // Try /docs if not found
    if (!readFile(this.filesystem, path) && !fileArg.includes('/')) {
      path = resolvePath('/docs', fileArg);
    }

    // Permission check for secrets
    if (path.endsWith('/secrets') && !state.isAdmin) {
      return { output: ['cat: secrets: Permission denied'] };
    }

    // Special files
    if (path.endsWith('/docs/regions.txt')) {
      return { output: [getGeofences().map(g => g.key).join('\n')] };
    }

    if (path.endsWith('/docs/companies.txt')) {
      return { output: [this.listCompanies()] };
    }

    const content = readFile(this.filesystem, path);
    if (content !== null) {
      return { output: [content] };
    } else {
      return { output: [`cat: ${fileArg}: No such file`] };
    }
  }

  private executeSudo(args: string[]): TerminalCommandResult {
    if ((args[0] || '').toLowerCase() === 'su') {
      return {
        output: ['sudo: Authentication failure'],
        newState: { alertMode: true },
        actions: [{ type: 'trigger_alert', payload: 6000 }]
      };
    } else {
      return { output: ['sudo: permission denied'] };
    }
  }

  public updateCareerData(careerData: CareerMapData | null) {
    this.careerData = careerData;
  }

  public updateMap(map: mapboxgl.Map | null) {
    this.map = map;
  }
}
