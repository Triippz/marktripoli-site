import { resolvePath as fsResolve, isDir as fsIsDir, listDir as fsList, readFile as fsRead } from '../../../utils/fauxFS';
import type { TerminalCommand } from '../types/terminal';
import type { EasterEggType } from '../types/easterEggs';

export const terminalCommands: TerminalCommand[] = [
  {
    name: 'help',
    description: 'Show available commands',
    handler: (_, { actions }) => {
      actions.appendLine('Commands: help, clear, login, eggs, trigger <name>, scan, unlock-all, exit');
      actions.appendLine('Linux-ish: pwd, ls, whoami, uname -a, date, echo <txt>, cat <file>, man <cmd>, sudo su');
      actions.appendLine('Map link: companies, goto hq <company>, hq <company>');
      actions.appendLine("Eggs: matrix, ufo, paws, glitch, neon, scanlines, beam, hiking, crayon");
      actions.appendLine("Marine chow: crayon, mre, chow, oorah, semper fi, taste test");
    }
  },
  {
    name: 'clear',
    description: 'Clear terminal screen',
    handler: (_, { actions }) => {
      actions.clear();
    }
  },
  {
    name: 'cls',
    description: 'Clear terminal screen (Windows style)',
    handler: (_, { actions }) => {
      actions.clear();
    }
  },
  {
    name: 'login',
    description: 'Login to admin account',
    handler: (_, { state, actions }) => {
      if (state.isAdmin) {
        actions.appendLine('Already logged in as admin.');
        return;
      }
      // Set awaiting password state
      actions.appendLine('Password:');
      // This would be handled by the useTerminal hook
    }
  },
  {
    name: 'eggs',
    description: 'List available easter eggs',
    handler: (_, { actions }) => {
      actions.appendLine('Available (screen): matrix, ufo, paws, glitch, neon, scanlines, beam, hiking, crayon.');
      actions.appendLine('Map (idle/geofence): ping, streak, aurora, ring, radar, sand, stars, neonSweep.');
    }
  },
  {
    name: 'trigger',
    description: 'Trigger an easter egg effect',
    handler: (args, { actions, onTriggerEgg }) => {
      const name = (args[0] || '').toLowerCase();
      if (!name) {
        actions.appendLine('Usage: trigger <name>');
        return;
      }
      
      const validEggs: EasterEggType[] = ['matrix', 'ufo', 'paws', 'glitch', 'neon', 'scanlines', 'beam', 'hiking', 'crayon'];
      if (validEggs.includes(name as EasterEggType)) {
        const success = onTriggerEgg?.(name as EasterEggType) ?? false;
        actions.appendLine(success ? `Triggered: ${name}` : `Unknown egg: ${name}`);
      } else {
        actions.appendLine(`Unknown egg: ${name}`);
      }
    }
  },
  {
    name: 'scan',
    description: 'Scan all easter egg effects',
    handler: (_, { actions, onTriggerEgg }) => {
      const eggs: EasterEggType[] = ['matrix', 'ufo', 'paws', 'glitch', 'neon', 'scanlines', 'beam', 'hiking', 'crayon'];
      eggs.forEach((egg, i) => {
        setTimeout(() => onTriggerEgg?.(egg), i * 250);
      });
      actions.appendLine('Scanning…');
    }
  },
  {
    name: 'unlock-all',
    description: 'Unlock all easter eggs (requires admin)',
    handler: (_, { state, actions, onTriggerEgg, onUnlockEasterEgg }) => {
      if (!state.isAdmin) {
        actions.appendLine('Insufficient clearance. Use login.');
        return;
      }
      const eggs: EasterEggType[] = ['matrix', 'ufo', 'paws', 'glitch', 'neon', 'scanlines', 'beam', 'hiking', 'crayon'];
      eggs.forEach((egg, i) => {
        setTimeout(() => onTriggerEgg?.(egg), i * 180);
      });
      actions.appendLine('All systems engaged.');
      try {
        onUnlockEasterEgg?.('easter_hunter');
      } catch {
        // Silent fail
      }
    }
  },
  {
    name: 'companies',
    description: 'List companies from resume',
    handler: (_, { actions, resume }) => {
      const names = Array.from(new Set((resume?.work || []).map((w: any) => w.name).filter(Boolean)));
      actions.appendLine(names.join(', ') || '(none)');
    }
  },
  {
    name: 'hq',
    description: 'Navigate to company HQ',
    handler: (args, { actions }) => {
      const query = args.join(' ');
      if (!query) {
        actions.appendLine('Usage: hq <company>');
        return;
      }
      navigateToMap(query, actions);
    }
  },
  {
    name: 'goto',
    description: 'Navigate to location',
    handler: (args, { actions }) => {
      const isGotoHq = (args[0] || '').toLowerCase() === 'hq';
      const query = isGotoHq ? args.slice(1).join(' ') : '';
      if (!query) {
        actions.appendLine('Usage: goto hq <company>');
        return;
      }
      navigateToMap(query, actions);
    }
  },
  {
    name: 'exit',
    description: 'Close terminal',
    handler: (_, { actions }) => {
      actions.close();
      actions.appendLine('Session closed.');
    }
  },
  {
    name: 'close',
    description: 'Close terminal',
    handler: (_, { actions }) => {
      actions.close();
      actions.appendLine('Session closed.');
    }
  },
  // Linux-ish commands
  {
    name: 'pwd',
    description: 'Print working directory',
    handler: (_, { state, actions }) => {
      actions.appendLine(state.currentDirectory);
    }
  },
  {
    name: 'cd',
    description: 'Change directory',
    handler: (args, { state, actions, fsRoot }) => {
      const target = args[0] || '/';
      const nextPath = fsResolve(state.currentDirectory, target);
      if (fsIsDir(fsRoot, nextPath)) {
        // Update current directory - this would be handled by the hook
        actions.appendLine(''); // Silent success
      } else {
        actions.appendLine(`cd: no such file or directory: ${target}`);
      }
    }
  },
  {
    name: 'ls',
    description: 'List directory contents',
    handler: (args, { state, actions, fsRoot }) => {
      const target = fsResolve(state.currentDirectory, args[0] || '.');
      const list = fsList(fsRoot, target);
      if (list) {
        actions.appendLine(list.join('  '));
      } else {
        actions.appendLine(`ls: cannot access '${args[0] || '.'}': Not a directory`);
      }
    }
  },
  {
    name: 'whoami',
    description: 'Print current user',
    handler: (_, { state, actions }) => {
      actions.appendLine(state.isAdmin ? 'root' : 'guest');
    }
  },
  {
    name: 'uname',
    description: 'System information',
    handler: (args, { actions }) => {
      const showAll = args[0] === '-a';
      actions.appendLine(showAll ? 'Linux mc 6.2.0-mc #1 SMP x86_64 GNU/Linux' : 'Linux');
    }
  },
  {
    name: 'date',
    description: 'Display current date and time',
    handler: (_, { actions }) => {
      actions.appendLine(new Date().toString());
    }
  },
  {
    name: 'echo',
    description: 'Display text',
    handler: (args, { actions }) => {
      actions.appendLine(args.join(' '));
    }
  },
  {
    name: 'cat',
    description: 'Display file contents',
    handler: (args, { state, actions, fsRoot }) => {
      const fileArg = args[0];
      if (!fileArg) {
        actions.appendLine('cat: missing file operand');
        return;
      }
      
      let path = fsResolve(state.currentDirectory, fileArg);
      // Convenience: allow 'cat easter-eggs.md'
      if (!fsRead(fsRoot, path) && !fileArg.includes('/')) {
        path = fsResolve('/docs', fileArg);
      }
      
      if (path.endsWith('/secrets') && !state.isAdmin) {
        actions.appendLine('cat: secrets: Permission denied');
        return;
      }
      
      const content = fsRead(fsRoot, path);
      actions.appendLine(content != null ? content : `cat: ${fileArg}: No such file`);
    }
  },
  {
    name: 'man',
    description: 'Display manual pages',
    handler: (_, { actions }) => {
      actions.appendLine('No manual entry. This is not a real shell.');
    }
  },
  {
    name: 'sudo',
    description: 'Execute as superuser',
    handler: (args, { actions, onTriggerAlert }) => {
      if ((args[0] || '').toLowerCase() === 'su') {
        try {
          onTriggerAlert?.(6000);
        } catch {
          // Silent fail
        }
        actions.appendLine('sudo: Authentication failure');
      } else {
        actions.appendLine('sudo: permission denied');
      }
    }
  },
  
  // Marine Corps Crayon Commands
  {
    name: 'crayon',
    description: 'Open tactical nutrition selector',
    handler: (_, { actions, onTriggerEgg }) => {
      actions.appendLine('Lunch is served, Devil Dog! 🖍️');
      onTriggerEgg?.('crayon');
    }
  },
  {
    name: 'crayola',
    description: 'Deploy 64-count variety pack',
    handler: (_, { actions, onTriggerEgg }) => {
      actions.appendLine('64-count variety pack deployed!');
      onTriggerEgg?.('crayon');
    }
  },
  {
    name: 'mre',
    description: 'Display MRE contents',
    handler: (_, { actions, onTriggerEgg }) => {
      actions.appendLine('MRE Contents:');
      actions.appendLine('• Main course: Mystery meat (probably)');
      actions.appendLine('• Side dish: Jalapeño cheese (expired 2019)');
      actions.appendLine('• Dessert: 64-count crayon variety pack 🖍️');
      actions.appendLine('• Accessory: Spoon (handle missing)');
      actions.appendLine('');
      actions.appendLine('Lunch is ready, Marine!');
      onTriggerEgg?.('crayon');
    }
  },
  {
    name: 'chow',
    description: 'Display chow hall menu',
    handler: (_, { actions, onTriggerEgg }) => {
      actions.appendLine('CHOW HALL MENU - TODAY ONLY');
      actions.appendLine('═══════════════════════════════');
      actions.appendLine('Main Course: Whatever Gunny found in the freezer');
      actions.appendLine('Sides: MRE jalapeño cheese (the good stuff)');
      actions.appendLine('Beverages: Coffee (brewed since Desert Storm)');
      actions.appendLine('Dessert: Premium crayon selection 🖍️');
      actions.appendLine('');
      actions.appendLine('Semper Fidelis! Semper Hungry!');
      onTriggerEgg?.('crayon');
    }
  },
  {
    name: 'lunch',
    description: 'Today\'s lunch special',
    handler: (_, { actions, onTriggerEgg }) => {
      actions.appendLine('Today\'s special: Wax-based nutrition! 🖍️');
      onTriggerEgg?.('crayon');
    }
  },
  {
    name: 'oorah',
    description: 'Marine Corps motivational cry',
    handler: (_, { actions, onTriggerEgg }) => {
      actions.appendLine('OORAH! Ready for chow, Marine? 🖍️');
      onTriggerEgg?.('crayon');
    }
  },
  {
    name: 'semper',
    description: 'Semper Fidelis',
    handler: (args, { actions, onTriggerEgg }) => {
      if (args[0] && args[0].toLowerCase() === 'fi') {
        actions.appendLine('Semper Fi, Marine! Time for some tactical nutrition! 🖍️');
        onTriggerEgg?.('crayon');
      } else {
        actions.appendLine('Semper what, Marine? (Try: semper fi)');
      }
    }
  },
  {
    name: 'taste',
    description: 'Conduct taste test protocol',
    handler: (args, { actions, onTriggerEgg }) => {
      if (args[0] && args[0].toLowerCase() === 'test') {
        actions.appendLine('FIELD TASTE TEST PROTOCOL INITIATED');
        actions.appendLine('═══════════════════════════════════════');
        actions.appendLine('Marine Corps Regulation 64.1: Crayon Quality Assurance');
        actions.appendLine('All Marines must conduct thorough taste testing');
        actions.appendLine('for tactical nutrition assessment.');
        actions.appendLine('');
        actions.appendLine('Opening crayon selector... 🖍️');
        onTriggerEgg?.('crayon');
      } else {
        actions.appendLine('Usage: taste test (for comprehensive crayon evaluation)');
      }
    }
  }
];

function navigateToMap(query: string, actions: any) {
  // Navigate to map with query param
  const params = new URLSearchParams(window.location.search);
  params.set('hq', query);
  window.history.replaceState({}, '', '/');
  window.location.href = '/?' + params.toString();
  actions.appendLine(`Opening map for HQ: ${query}`);
}

export function findCommand(name: string): TerminalCommand | undefined {
  return terminalCommands.find(cmd => cmd.name === name.toLowerCase());
}