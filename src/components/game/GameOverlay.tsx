/**
 * Pipeline Defender: the overlay shell. Owns the modal contract (focus
 * trap, aria-modal, Escape, scroll lock), the rAF loop, input, and every
 * translatable string; the simulation lives in engine.ts, drawing in
 * render.ts, sound in audio.ts.
 *
 * This module is only ever imported lazily (first G press / hint button),
 * so none of it lands in the critical-path bundle and nothing here needs
 * SSR guards beyond "mounts client-side only".
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Translate, { translate } from '@docusaurus/Translate';
import { TOOLS, toolById, type ToolId } from './content';
import { createEngine, type Engine, type GameStatus } from './engine';
import { createAudio, type GameAudio } from './audio';
import { draw, readPalette, type Palette } from './render';
import { useHighscore } from './useHighscore';
import FieldManual from './FieldManual';
import styles from './GameOverlay.module.css';

const MAX_DPR = 2;
const MAX_FRAME_MS = 100; /* survive a background tab without a threat rain */

function explainer(tool: ToolId): React.ReactNode {
  switch (tool) {
    case 'gitleaks':
      return (
        <Translate id="game.explain.gitleaks">
          Gitleaks catches secrets before they reach the git history. Once a
          key is in a commit, deleting it is not enough: rotate it.
        </Translate>
      );
    case 'osv':
      return (
        <Translate id="game.explain.osv">
          OSV scanning matches your dependencies against known CVEs, and
          catches the typosquatted package that is one letter away from the
          real one.
        </Translate>
      );
    case 'semgrep':
      return (
        <Translate id="game.explain.semgrep">
          Semgrep finds injection flaws in your own code with static rules,
          before the pull request is even reviewed.
        </Translate>
      );
    case 'guardrail':
      return (
        <Translate id="game.explain.guardrail">
          Prompt injection cannot be fixed inside the model. A guardrail
          filters what goes in and out of the LLM, and irreversible actions
          get a human approval step.
        </Translate>
      );
    default:
      return null;
  }
}

export default function GameOverlay({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const paletteRef = useRef<Palette | null>(null);
  const pointerRef = useRef<{ x: number; moved: boolean } | null>(null);
  const pressedKeys = useRef(new Set<string>());

  const [highscore, submitHighscore] = useHighscore();
  const [isNewHighscore, setIsNewHighscore] = useState(false);
  const [view, setView] = useState<'game' | 'manual'>('game');
  /* Mirrors of the mutable engine state, refreshed on engine events. */
  const [status, setStatus] = useState<GameStatus>('title');
  const [hud, setHud] = useState({
    score: 0,
    lives: 3,
    wave: 0,
    multiplier: 1,
    activeTool: 'gitleaks' as ToolId,
    introducesTool: 'gitleaks' as ToolId | undefined,
  });
  const [muted, setMuted] = useState(false);

  const prefersReduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const coarsePointer = useMemo(
    () => window.matchMedia('(pointer: coarse)').matches,
    []
  );

  const audioRef = useRef<GameAudio | null>(null);
  if (audioRef.current === null) {
    audioRef.current = createAudio();
  }

  const engineRef = useRef<Engine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = createEngine({
      reducedMotion: prefersReduced,
      onEvent: (event, state) => {
        const audio = audioRef.current;
        if (audio) {
          if (event === 'shoot') audio.play('shoot');
          if (event === 'kill') audio.play('kill');
          if (event === 'wrongTool') audio.play('wrongTool');
          if (event === 'leak') audio.play('leak');
          if (event === 'waveEnd') audio.play('waveEnd');
          if (event === 'gameOver') audio.play('gameOver');
        }
        if (event === 'gameOver') {
          setIsNewHighscore(submitHighscore(state.score));
        }
      },
    });
  }
  const engine = engineRef.current;

  /* One place that copies engine state into React; called per frame from
     the loop, cheap because React bails out on identical values. */
  const syncUi = useCallback(() => {
    const state = engine.state;
    setStatus(state.status);
    setHud((prev) =>
      prev.score === state.score &&
      prev.lives === state.lives &&
      prev.wave === state.wave &&
      prev.multiplier === state.multiplier &&
      prev.activeTool === state.activeTool &&
      prev.introducesTool === state.introducesTool
        ? prev
        : {
            score: state.score,
            lives: state.lives,
            wave: state.wave,
            multiplier: state.multiplier,
            activeTool: state.activeTool,
            introducesTool: state.introducesTool,
          }
    );
  }, [engine]);

  useEffect(() => {
    setMuted(audioRef.current?.muted() ?? false);
  }, []);

  /* Modal contract: scroll lock, initial focus, focus restore. */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlayRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  /* Canvas sizing: backing store = CSS pixels × DPR, logic in CSS pixels. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width: rect.width, height: rect.height };
    };
    resize();
    paletteRef.current = readPalette();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [view]);

  /* The loop. Runs while the overlay is open; the engine ignores update()
     outside 'playing', so title/pause screens just keep rendering. */
  useEffect(() => {
    if (view !== 'game') {
      return undefined;
    }
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(now - last, MAX_FRAME_MS);
      last = now;
      engine.update(dt);
      const ctx = canvasRef.current?.getContext('2d');
      const palette = paletteRef.current;
      if (ctx && palette) {
        draw(
          ctx,
          engine.state,
          palette,
          sizeRef.current.width,
          sizeRef.current.height
        );
      }
      syncUi();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [engine, syncUi, view]);

  /* Auto-pause when the tab or window loses attention. */
  useEffect(() => {
    const pause = () => engine.pause();
    document.addEventListener('visibilitychange', pause);
    window.addEventListener('blur', pause);
    return () => {
      document.removeEventListener('visibilitychange', pause);
      window.removeEventListener('blur', pause);
    };
  }, [engine]);

  const advance = useCallback(() => {
    const current = engine.state.status;
    if (current === 'title' || current === 'gameover') {
      setIsNewHighscore(false);
      engine.startRun();
    } else if (current === 'interstitial') {
      engine.continueWave();
    } else if (current === 'playing') {
      engine.fire();
    }
  }, [engine]);

  /* Keyboard, attached to window so play does not depend on inner focus.
     Root suppresses its own D/G handling while the overlay is open. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === 'escape') {
        onClose();
        return;
      }
      if (view === 'manual') {
        return;
      }
      switch (key) {
        case 'arrowleft':
        case 'a':
          pressedKeys.current.add(key);
          engine.setMoveDir(-1);
          event.preventDefault();
          break;
        case 'arrowright':
        case 'd':
          pressedKeys.current.add(key);
          engine.setMoveDir(1);
          event.preventDefault();
          break;
        case ' ':
          advance();
          event.preventDefault();
          break;
        case 'p':
          engine.togglePause();
          break;
        case 'm':
          setMuted(audioRef.current?.toggleMuted() ?? false);
          break;
        case '1':
        case '2':
        case '3':
        case '4': {
          const tool = TOOLS.find((t) => t.key === key);
          if (tool) {
            engine.setTool(tool.id);
          }
          break;
        }
        default:
          break;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      pressedKeys.current.delete(key);
      const left =
        pressedKeys.current.has('arrowleft') || pressedKeys.current.has('a');
      const right =
        pressedKeys.current.has('arrowright') || pressedKeys.current.has('d');
      engine.setMoveDir(left ? -1 : right ? 1 : 0);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [advance, engine, onClose, view]);

  /* Manual focus trap: Tab cycles inside the dialog. */
  const trapFocus = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') {
      return;
    }
    const root = overlayRef.current;
    if (!root) {
      return;
    }
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]')
    );
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === root)) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && active === last) {
      first.focus();
      event.preventDefault();
    }
  }, []);

  /* Touch: drag on the canvas moves the gate, a tap fires. */
  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      pointerRef.current = { x: event.clientX, moved: false };
      if (engine.state.status === 'playing') {
        engine.setPlayerX((event.clientX - rect.left) / rect.width);
      }
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [engine]
  );
  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const start = pointerRef.current;
      if (!start) {
        return;
      }
      if (Math.abs(event.clientX - start.x) > 8) {
        start.moved = true;
      }
      if (engine.state.status === 'playing') {
        const rect = event.currentTarget.getBoundingClientRect();
        engine.setPlayerX((event.clientX - rect.left) / rect.width);
      }
    },
    [engine]
  );
  const onPointerUp = useCallback(() => {
    const start = pointerRef.current;
    pointerRef.current = null;
    if (start && !start.moved) {
      advance();
    }
  }, [advance]);

  const introducedTool = hud.introducesTool
    ? toolById(hud.introducesTool)
    : undefined;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={translate({ id: 'game.title', message: 'Pipeline Defender' })}
      tabIndex={-1}
      onKeyDown={trapFocus}
    >
      <div className={styles.stage}>
        <div className={styles.hud}>
          <span className={styles.hudTitle}>pipeline-defender</span>
          <span className={styles.hudItem}>
            <Translate id="game.hud.score">Score</Translate>{' '}
            <strong>{hud.score}</strong>
            {hud.multiplier > 1 && (
              <span className={styles.hudMultiplier}>×{hud.multiplier}</span>
            )}
          </span>
          <span className={styles.hudItem}>
            <Translate id="game.hud.wave">Wave</Translate>{' '}
            <strong>{hud.wave}</strong>
          </span>
          <span className={styles.hudItem} aria-label={`${hud.lives}/3`}>
            {'◆'.repeat(hud.lives)}
            <span className={styles.hudLivesLost}>
              {'◇'.repeat(Math.max(0, 3 - hud.lives))}
            </span>
          </span>
          <span className={styles.hudSpacer} />
          <button
            type="button"
            className={styles.hudButton}
            onClick={() =>
              setMuted(audioRef.current?.toggleMuted() ?? false)
            }
            aria-pressed={muted}
          >
            {muted ? (
              <Translate id="game.hud.unmute">sound: off [M]</Translate>
            ) : (
              <Translate id="game.hud.mute">sound: on [M]</Translate>
            )}
          </button>
          <button
            type="button"
            className={styles.hudButton}
            onClick={onClose}
          >
            <Translate id="game.hud.close">close [Esc]</Translate>
          </button>
        </div>

        {view === 'manual' ? (
          <FieldManual onBack={() => setView('game')} />
        ) : (
          <>
            <div className={styles.canvasWrap}>
              <canvas
                ref={canvasRef}
                className={styles.canvas}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              />

              {status === 'title' && (
                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>
                    <Translate id="game.title">Pipeline Defender</Translate>
                  </h2>
                  <p className={styles.panelBody}>
                    <Translate id="game.intro">
                      Threats are falling through the pipeline towards
                      production. Only the matching security tool stops them:
                      switch with 1-4, move with the arrow keys, fire with
                      Space.
                    </Translate>
                  </p>
                  {highscore > 0 && (
                    <p className={styles.panelMuted}>
                      <Translate
                        id="game.best"
                        values={{ score: highscore }}
                      >
                        {'Best run: {score}'}
                      </Translate>
                    </p>
                  )}
                  {prefersReduced && (
                    <p className={styles.panelMuted}>
                      <Translate id="game.reducedNote">
                        Reduced motion is on: threats move in slower, discrete
                        steps and there are no particle effects.
                      </Translate>
                    </p>
                  )}
                  <div className={styles.panelButtons}>
                    <button
                      type="button"
                      className={styles.gameButtonPrimary}
                      onClick={advance}
                    >
                      <Translate id="game.start">Start [Space]</Translate>
                    </button>
                    <button
                      type="button"
                      className={styles.gameButton}
                      onClick={() => setView('manual')}
                    >
                      <Translate id="game.manualOpen">Field manual</Translate>
                    </button>
                  </div>
                </div>
              )}

              {status === 'interstitial' && (
                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>
                    <Translate id="game.wave" values={{ wave: hud.wave }}>
                      {'Wave {wave}'}
                    </Translate>
                  </h2>
                  {introducedTool && (
                    <>
                      <p
                        className={styles.panelTool}
                        style={{
                          color: `var(${introducedTool.colorToken})`,
                        }}
                      >
                        <kbd className={styles.hudKey}>
                          {introducedTool.key}
                        </kbd>{' '}
                        {introducedTool.name}
                      </p>
                      <p className={styles.panelBody}>
                        {explainer(introducedTool.id)}
                      </p>
                    </>
                  )}
                  <div className={styles.panelButtons}>
                    <button
                      type="button"
                      className={styles.gameButtonPrimary}
                      onClick={advance}
                    >
                      <Translate id="game.continue">
                        Continue [Space]
                      </Translate>
                    </button>
                  </div>
                </div>
              )}

              {status === 'paused' && (
                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>
                    <Translate id="game.paused">Paused</Translate>
                  </h2>
                  <div className={styles.panelButtons}>
                    <button
                      type="button"
                      className={styles.gameButtonPrimary}
                      onClick={() => engine.togglePause()}
                    >
                      <Translate id="game.resume">Resume [P]</Translate>
                    </button>
                  </div>
                </div>
              )}

              {status === 'gameover' && (
                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>
                    <Translate id="game.over">
                      Incident in production
                    </Translate>
                  </h2>
                  <p className={styles.panelBody}>
                    <Translate id="game.final" values={{ score: hud.score }}>
                      {'Final score: {score}'}
                    </Translate>
                    {isNewHighscore && (
                      <strong className={styles.panelHighscore}>
                        {' '}
                        <Translate id="game.newBest">
                          New best run!
                        </Translate>
                      </strong>
                    )}
                  </p>
                  <div className={styles.panelButtons}>
                    <button
                      type="button"
                      className={styles.gameButtonPrimary}
                      onClick={advance}
                    >
                      <Translate id="game.again">
                        Play again [Space]
                      </Translate>
                    </button>
                    <button
                      type="button"
                      className={styles.gameButton}
                      onClick={() => setView('manual')}
                    >
                      <Translate id="game.manualOpen">Field manual</Translate>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.toolbar}>
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className={styles.toolChip}
                  style={{ borderColor: `var(${tool.colorToken})` }}
                  aria-pressed={hud.activeTool === tool.id}
                  data-active={hud.activeTool === tool.id || undefined}
                  onClick={() => engine.setTool(tool.id)}
                >
                  <kbd className={styles.hudKey}>{tool.key}</kbd> {tool.name}
                </button>
              ))}
              {coarsePointer && (
                <button
                  type="button"
                  className={styles.fireButton}
                  onClick={advance}
                >
                  <Translate id="game.fire">Fire</Translate>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
