/**
 * Pipeline Defender: canvas drawing. Geometry and code glyphs only; every
 * translatable word is DOM in GameOverlay. Colours are read from the CSS
 * tokens at open time (and re-read on theme/design change), so the game
 * matches whatever design × theme combination is active.
 */
import { TOOLS, type ToolId } from './content';
import type { GameState } from './engine';

export interface Palette {
  bg: string;
  border: string;
  text: string;
  muted: string;
  dim: string;
  tool: Record<ToolId, string>;
}

export function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => style.getPropertyValue(name).trim();
  const tool = {} as Record<ToolId, string>;
  for (const t of TOOLS) {
    tool[t.id] = token(t.colorToken);
  }
  return {
    bg: token('--c-bg'),
    border: token('--c-border'),
    text: token('--c-text'),
    muted: token('--c-text-muted'),
    dim: token('--c-text-dim'),
    tool,
  };
}

/* The four pipeline stages, drawn as horizontal rules the threats fall
   through. Labels are code-ish and locale-neutral by design. */
const STAGES: ReadonlyArray<{ y: number; label: string }> = [
  { y: 0.22, label: 'commit' },
  { y: 0.44, label: 'build' },
  { y: 0.66, label: 'test' },
  { y: 0.88, label: 'deploy' },
];

export function draw(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  palette: Palette,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  /* Pipeline stages */
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1;
  ctx.font = `${Math.max(10, height * 0.022)}px "JetBrains Mono", monospace`;
  ctx.textBaseline = 'bottom';
  for (const stage of STAGES) {
    const y = stage.y * height;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
    ctx.fillStyle = palette.dim;
    ctx.textAlign = 'left';
    ctx.fillText(stage.label, 8, y - 4);
  }
  ctx.setLineDash([]);

  /* Production line: what the player defends. */
  const prodY = height - 2;
  ctx.strokeStyle = palette.text;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, prodY);
  ctx.lineTo(width, prodY);
  ctx.stroke();

  /* Threats: glyph in a box, tinted by the tool that would catch them once
     they flash (the wrong-tool flash shows the *matching* colour: the game
     tells you what you should have used). */
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const threatFont = `${Math.max(11, height * 0.026)}px "JetBrains Mono", monospace`;
  for (const threat of state.threats) {
    const x = threat.x * width;
    const y = threat.y * height;
    ctx.font = threatFont;
    const label = threat.glyph;
    const metrics = ctx.measureText(label);
    const paddingX = 8;
    const boxW = metrics.width + paddingX * 2;
    const boxH = Math.max(20, height * 0.045);
    const flashing = threat.flashMs > 0;
    ctx.strokeStyle = flashing ? palette.tool[threat.toolId] : palette.border;
    ctx.lineWidth = flashing ? 2 : 1;
    ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
    ctx.fillStyle = flashing ? palette.tool[threat.toolId] : palette.text;
    ctx.fillText(label, x, y);
  }

  /* Shots: short vertical dashes in the firing tool's colour. */
  ctx.lineWidth = 3;
  for (const shot of state.shots) {
    ctx.strokeStyle = palette.tool[shot.toolId];
    ctx.beginPath();
    ctx.moveTo(shot.x * width, shot.y * height);
    ctx.lineTo(shot.x * width, shot.y * height + height * 0.025);
    ctx.stroke();
  }

  /* Player: a scanner gate in the active tool's colour. */
  const px = state.playerX * width;
  const py = 0.95 * height;
  const gateW = Math.max(34, width * 0.05);
  const toolColor = palette.tool[state.activeTool];
  ctx.strokeStyle = toolColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(px - gateW / 2, py, gateW, height * 0.03);
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px, py - height * 0.018);
  ctx.stroke();

  /* Particles */
  ctx.fillStyle = toolColor;
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.lifeMs / 400));
    ctx.fillRect(p.x * width - 1.5, p.y * height - 1.5, 3, 3);
  }
  ctx.globalAlpha = 1;
}
