/**
 * Pipeline Defender: the simulation. Pure state + fixed-timestep update,
 * no DOM, no React, no rendering. GameOverlay owns the rAF loop and the
 * canvas; this module owns what happens per tick.
 *
 * Coordinates are normalised: x and y run 0..1 over the playfield, so the
 * canvas can resize freely without touching game logic.
 */
import {
  threatById,
  toolById,
  waveFor,
  TOOLS,
  type ToolId,
} from './content';

export interface ThreatSprite {
  id: number;
  defId: string;
  toolId: ToolId;
  glyph: string;
  x: number;
  y: number;
  vy: number;
  points: number;
  /* Remaining ms of the "wrong tool" flash. */
  flashMs: number;
}

export interface Shot {
  x: number;
  y: number;
  toolId: ToolId;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifeMs: number;
}

export type GameStatus =
  | 'title'
  | 'interstitial'
  | 'playing'
  | 'paused'
  | 'gameover';

export type GameEvent =
  | 'shoot'
  | 'kill'
  | 'wrongTool'
  | 'leak'
  | 'waveEnd'
  | 'gameOver';

export interface GameState {
  status: GameStatus;
  wave: number;
  score: number;
  lives: number;
  streak: number;
  multiplier: number;
  activeTool: ToolId;
  /* Tool the interstitial currently explains, if the coming wave has one. */
  introducesTool: ToolId | undefined;
  playerX: number;
  moveDir: -1 | 0 | 1;
  threats: ThreatSprite[];
  shots: Shot[];
  particles: Particle[];
  spawnedInWave: number;
  spawnTimerMs: number;
  /* Reduced-motion: movement is applied in discrete steps. */
  stepAccumulatorMs: number;
}

export interface Engine {
  state: GameState;
  /* Advance the simulation. dt is clamped by the caller's loop. */
  update(dtMs: number): void;
  startRun(): void;
  continueWave(): void;
  fire(): void;
  setMoveDir(dir: -1 | 0 | 1): void;
  setPlayerX(x: number): void;
  setTool(id: ToolId): void;
  cycleTool(): void;
  togglePause(): void;
  pause(): void;
}

const LIVES = 3;
const PLAYER_SPEED = 0.55; /* playfield-widths per second */
const SHOT_SPEED = 1.4; /* playfield-heights per second */
const FLASH_MS = 260;
const STEP_MS = 250; /* reduced-motion: 4 discrete steps per second */
/* Streak thresholds: x2 from 5 straight correct kills, x3 from 10. */
const MULTIPLIER_STEP = 5;
const MULTIPLIER_MAX = 3;

interface EngineOptions {
  reducedMotion: boolean;
  onEvent: (event: GameEvent, state: GameState) => void;
  /* Injected so the engine itself stays deterministic and testable. */
  random?: () => number;
}

export function createEngine({
  reducedMotion,
  onEvent,
  random = Math.random,
}: EngineOptions): Engine {
  const state: GameState = {
    status: 'title',
    wave: 0,
    score: 0,
    lives: LIVES,
    streak: 0,
    multiplier: 1,
    activeTool: 'gitleaks',
    introducesTool: 'gitleaks',
    playerX: 0.5,
    moveDir: 0,
    threats: [],
    shots: [],
    particles: [],
    spawnedInWave: 0,
    spawnTimerMs: 0,
    stepAccumulatorMs: 0,
  };

  let nextThreatId = 1;
  const speedScale = reducedMotion ? 0.7 : 1;

  function resetRun() {
    state.wave = 0;
    state.score = 0;
    state.lives = LIVES;
    state.streak = 0;
    state.multiplier = 1;
    state.activeTool = 'gitleaks';
    state.playerX = 0.5;
    state.threats = [];
    state.shots = [];
    state.particles = [];
  }

  function enterInterstitial() {
    state.wave += 1;
    const wave = waveFor(state.wave);
    state.introducesTool = wave.introducesTool;
    state.spawnedInWave = 0;
    state.spawnTimerMs = 0;
    state.status = 'interstitial';
  }

  function spawn(waveNumber: number) {
    const wave = waveFor(waveNumber);
    const defId =
      wave.threatIds[Math.floor(random() * wave.threatIds.length)];
    const def = threatById(defId);
    state.threats.push({
      id: nextThreatId++,
      defId: def.id,
      toolId: def.toolId,
      glyph: def.glyph,
      x: 0.12 + random() * 0.76,
      y: -0.04,
      vy: wave.speed * def.speedFactor * speedScale,
      points: def.points,
      flashMs: 0,
    });
    state.spawnedInWave += 1;
  }

  function burst(x: number, y: number) {
    if (reducedMotion) {
      return;
    }
    for (let i = 0; i < 10; i++) {
      const angle = random() * Math.PI * 2;
      const speed = 0.1 + random() * 0.25;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        lifeMs: 350 + random() * 250,
      });
    }
  }

  function onKill(threat: ThreatSprite) {
    state.streak += 1;
    state.multiplier = Math.min(
      1 + Math.floor(state.streak / MULTIPLIER_STEP),
      MULTIPLIER_MAX
    );
    state.score += threat.points * state.multiplier;
    burst(threat.x, threat.y);
    onEvent('kill', state);
  }

  function step(dtMs: number) {
    const dt = dtMs / 1000;

    /* Player */
    state.playerX = Math.min(
      0.97,
      Math.max(0.03, state.playerX + state.moveDir * PLAYER_SPEED * dt)
    );

    /* Spawning */
    const wave = waveFor(state.wave);
    if (state.spawnedInWave < wave.count) {
      state.spawnTimerMs -= dtMs;
      if (state.spawnTimerMs <= 0) {
        spawn(state.wave);
        state.spawnTimerMs = wave.spawnMs;
      }
    }

    /* Shots */
    for (const shot of state.shots) {
      shot.y -= SHOT_SPEED * dt;
    }
    state.shots = state.shots.filter((s) => s.y > -0.05);

    /* Threats fall; reduced motion moves them in discrete snaps. */
    let fallDt = dt;
    if (reducedMotion) {
      state.stepAccumulatorMs += dtMs;
      if (state.stepAccumulatorMs >= STEP_MS) {
        fallDt = state.stepAccumulatorMs / 1000;
        state.stepAccumulatorMs = 0;
      } else {
        fallDt = 0;
      }
    }
    for (const threat of state.threats) {
      if (fallDt > 0) {
        threat.y += threat.vy * fallDt;
      }
      threat.flashMs = Math.max(0, threat.flashMs - dtMs);
    }

    /* Shot ↔ threat collisions. Hit boxes are generous: glyphs are wide. */
    for (const shot of [...state.shots]) {
      const hit = state.threats.find(
        (t) =>
          Math.abs(t.x - shot.x) < 0.09 && Math.abs(t.y - shot.y) < 0.045
      );
      if (!hit) {
        continue;
      }
      state.shots = state.shots.filter((s) => s !== shot);
      if (hit.toolId === shot.toolId) {
        state.threats = state.threats.filter((t) => t !== hit);
        onKill(hit);
      } else {
        /* The lesson: the wrong scanner does not see this threat class. */
        hit.flashMs = FLASH_MS;
        state.streak = 0;
        state.multiplier = 1;
        onEvent('wrongTool', state);
      }
    }

    /* Threats reaching production */
    const leaked = state.threats.filter((t) => t.y >= 1);
    if (leaked.length > 0) {
      state.threats = state.threats.filter((t) => t.y < 1);
      state.lives -= leaked.length;
      state.streak = 0;
      state.multiplier = 1;
      onEvent('leak', state);
      if (state.lives <= 0) {
        state.lives = 0;
        state.status = 'gameover';
        onEvent('gameOver', state);
        return;
      }
    }

    /* Particles */
    for (const p of state.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifeMs -= dtMs;
    }
    state.particles = state.particles.filter((p) => p.lifeMs > 0);

    /* Wave cleared */
    if (
      state.spawnedInWave >= wave.count &&
      state.threats.length === 0 &&
      state.shots.length === 0
    ) {
      onEvent('waveEnd', state);
      enterInterstitial();
    }
  }

  return {
    state,

    update(dtMs: number) {
      if (state.status !== 'playing') {
        return;
      }
      step(dtMs);
    },

    startRun() {
      resetRun();
      enterInterstitial();
    },

    continueWave() {
      if (state.status === 'interstitial') {
        state.status = 'playing';
      }
    },

    fire() {
      if (state.status !== 'playing') {
        return;
      }
      state.shots.push({
        x: state.playerX,
        y: 0.93,
        toolId: state.activeTool,
      });
      onEvent('shoot', state);
    },

    setMoveDir(dir) {
      state.moveDir = dir;
    },

    setPlayerX(x) {
      state.playerX = Math.min(0.97, Math.max(0.03, x));
    },

    setTool(id) {
      state.activeTool = id;
    },

    cycleTool() {
      const index = TOOLS.findIndex((t) => t.id === state.activeTool);
      state.activeTool = TOOLS[(index + 1) % TOOLS.length].id;
    },

    togglePause() {
      if (state.status === 'playing') {
        state.status = 'paused';
      } else if (state.status === 'paused') {
        state.status = 'playing';
      }
    },

    pause() {
      if (state.status === 'playing') {
        state.status = 'paused';
      }
    },
  };
}

/* Re-exported for the overlay's HUD so it renders tools in binding order. */
export { TOOLS, toolById };
export type { ToolId };
