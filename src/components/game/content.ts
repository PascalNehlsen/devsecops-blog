/**
 * Pipeline Defender: the data. Everything the game "knows" about tools and
 * threats lives here; engine.ts only sees ids and numbers.
 *
 * Adding a threat = one entry in THREATS (+ its labels in the field manual
 * translations). Adding a tool = one entry in TOOLS, a key binding, and its
 * manual/interstitial strings.
 *
 * Canvas glyphs are deliberately code artifacts, not prose: an AWS key
 * prefix, a CVE id, a typo-squatted package name. They need no translation
 * and *are* the lesson, since recognising them is the game.
 */

export type ToolId = 'gitleaks' | 'osv' | 'semgrep' | 'guardrail';

export interface ToolDef {
  id: ToolId;
  /* Keyboard key that selects the tool while playing. */
  key: '1' | '2' | '3' | '4';
  /* Short name drawn in the HUD chips (proper noun, untranslated). */
  name: string;
  /* Semantic colour token the renderer resolves at runtime, so the game
     follows the active design and theme. */
  colorToken: '--c-accent' | '--c-info' | '--c-warn' | '--c-error';
  /* Internal page a curious player can read next (field manual). */
  readMore?: string;
}

export const TOOLS: readonly ToolDef[] = [
  {
    id: 'gitleaks',
    key: '1',
    name: 'Gitleaks',
    colorToken: '--c-accent',
    readMore: '/blog/git-security-practices',
  },
  {
    id: 'osv',
    key: '2',
    name: 'OSV Scan',
    colorToken: '--c-info',
    readMore: '/docs/projects/devsecops-blog',
  },
  {
    id: 'semgrep',
    key: '3',
    name: 'Semgrep',
    colorToken: '--c-warn',
    readMore: '/docs/projects/devsecops-blog',
  },
  {
    id: 'guardrail',
    key: '4',
    name: 'Guardrail',
    colorToken: '--c-error',
    readMore: '/blog/agentic-runbooks-mcp-human-approval',
  },
] as const;

export interface ThreatDef {
  id: string;
  toolId: ToolId;
  /* Drawn on the canvas: a recognisable artifact of the threat class. */
  glyph: string;
  /* Relative fall speed; 1 is the wave's base speed. */
  speedFactor: number;
  points: number;
}

export const THREATS: readonly ThreatDef[] = [
  {
    id: 'leaked-secret',
    toolId: 'gitleaks',
    glyph: 'AKIA…J4X2',
    speedFactor: 1,
    points: 10,
  },
  {
    id: 'hardcoded-credential',
    toolId: 'gitleaks',
    glyph: 'passwd="hunter2"', // pragma: allowlist secret
    speedFactor: 0.85,
    points: 10,
  },
  {
    id: 'cve-dependency',
    toolId: 'osv',
    glyph: 'CVE-2026-31337',
    speedFactor: 1,
    points: 10,
  },
  {
    id: 'typosquat-package',
    toolId: 'osv',
    glyph: 'pip install reqeusts',
    speedFactor: 1.2,
    points: 15,
  },
  {
    id: 'injection-flaw',
    toolId: 'semgrep',
    glyph: "' OR 1=1 --",
    speedFactor: 1.1,
    points: 15,
  },
  {
    id: 'prompt-injection',
    toolId: 'guardrail',
    glyph: 'IGNORE ALL PREVIOUS…',
    speedFactor: 1.3,
    points: 20,
  },
] as const;

/* Waves introduce the tools one at a time, then mix. The interstitial after
   each wave explains the tool the *next* wave introduces, so the lesson
   arrives right before it is needed. */
export interface WaveDef {
  /* Threat pool the spawner draws from. */
  threatIds: readonly string[];
  count: number;
  /* Base fall speed in canvas-heights per second. */
  speed: number;
  spawnMs: number;
  /* Tool whose explainer the interstitial before this wave shows. */
  introducesTool?: ToolId;
}

const POOL = {
  gitleaks: ['leaked-secret', 'hardcoded-credential'],
  osv: ['cve-dependency', 'typosquat-package'],
  semgrep: ['injection-flaw'],
  guardrail: ['prompt-injection'],
} as const;

export function waveFor(n: number): WaveDef {
  /* Waves 1-4 are the tutorial arc; from 5 on it is an endless mix that
     tightens by ~8% per wave and caps so it stays humanly playable. */
  const speed = Math.min(0.055 + n * 0.008, 0.16);
  const spawnMs = Math.max(1500 - n * 70, 550);
  switch (n) {
    case 1:
      return {
        threatIds: POOL.gitleaks,
        count: 6,
        speed,
        spawnMs,
        introducesTool: 'gitleaks',
      };
    case 2:
      return {
        threatIds: [...POOL.gitleaks, ...POOL.osv],
        count: 8,
        speed,
        spawnMs,
        introducesTool: 'osv',
      };
    case 3:
      return {
        threatIds: [...POOL.gitleaks, ...POOL.osv, ...POOL.semgrep],
        count: 10,
        speed,
        spawnMs,
        introducesTool: 'semgrep',
      };
    case 4:
      return {
        threatIds: THREATS.map((t) => t.id),
        count: 12,
        speed,
        spawnMs,
        introducesTool: 'guardrail',
      };
    default:
      return {
        threatIds: THREATS.map((t) => t.id),
        count: 10 + n,
        speed,
        spawnMs,
      };
  }
}

export function threatById(id: string): ThreatDef {
  const def = THREATS.find((t) => t.id === id);
  if (!def) {
    throw new Error(`unknown threat: ${id}`);
  }
  return def;
}

export function toolById(id: ToolId): ToolDef {
  const def = TOOLS.find((t) => t.id === id);
  if (!def) {
    throw new Error(`unknown tool: ${id}`);
  }
  return def;
}
