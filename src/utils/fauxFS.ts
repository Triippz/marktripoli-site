export type FSNode = { type: 'dir' | 'file'; children?: Record<string, FSNode>; content?: string };

export function createDefaultFS(): FSNode {
  const root: FSNode = { type: 'dir', children: {} };
  const addDir = (path: string) => ensureDir(root, path);
  const addFile = (path: string, content: string) => {
    const { parent, name } = splitPath(path);
    const dir = ensureDir(root, parent);
    dir.children![name] = { type: 'file', content };
  };

  ['/bin','/boot','/dev','/etc','/home','/usr','/var','/tmp','/opt','/sys','/proc','/docs'].forEach(addDir);
  addFile('/docs/easter-eggs.md', `Mission Control — Hidden Systems\n\nKeys:\n- Konami: Toggle Matrix rain\n- U: UFO fleet\n- D: Paw burst\n- G: Glitch header\n- P: Neon pulse\n- H: Hiking mode\n- V: Scanlines\n- B: UFO beam\n\nTerminals:\n- Map: regions, companies, goto, hq, probe\n- Briefing: eggs, trigger, puzzle\n`);
  addFile('/README.txt', 'Welcome to Mission Control. Type help for commands.');
  addFile('/secrets', 'ACCESS DENIED');

  return root;
}

export function resolvePath(cwd: string, input: string): string {
  if (!input || input === '.') return canonicalize(cwd);
  const abs = input.startsWith('/') ? input : (cwd.endsWith('/') ? cwd + input : cwd + '/' + input);
  return canonicalize(abs);
}

export function canonicalize(path: string): string {
  const parts = path.split('/');
  const out: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') { out.pop(); continue; }
    out.push(part);
  }
  return '/' + out.join('/');
}

export function getNode(fs: FSNode, path: string): FSNode | null {
  const { parts } = decompose(path);
  let cur: FSNode = fs;
  for (const p of parts) {
    if (!cur.children || !cur.children[p]) return null;
    cur = cur.children[p];
  }
  return cur;
}

export function isDir(fs: FSNode, path: string): boolean {
  const n = getNode(fs, path);
  return !!n && n.type === 'dir';
}

export function listDir(fs: FSNode, path: string): string[] | null {
  const n = getNode(fs, path);
  if (!n || n.type !== 'dir') return null;
  return Object.keys(n.children || {}).sort();
}

export function readFile(fs: FSNode, path: string): string | null {
  const n = getNode(fs, path);
  if (!n || n.type !== 'file') return null;
  return n.content || '';
}

function ensureDir(root: FSNode, path: string): FSNode {
  const { parts } = decompose(path);
  let cur = root;
  for (const p of parts) {
    if (!cur.children) cur.children = {};
    if (!cur.children[p]) cur.children[p] = { type: 'dir', children: {} };
    cur = cur.children[p];
  }
  return cur;
}

function decompose(path: string): { parts: string[] } {
  const canonical = canonicalize(path);
  const parts = canonical.split('/').filter(Boolean);
  return { parts };
}

function splitPath(path: string): { parent: string; name: string } {
  const can = canonicalize(path);
  const idx = can.lastIndexOf('/');
  const parent = idx <= 0 ? '/' : can.slice(0, idx);
  const name = can.slice(idx + 1);
  return { parent, name };
}

