/**
 * Global wrapper (Docusaurus picks up src/theme/Root automatically; this is
 * a wrapper, not an ejected theme component). Hosts the site-wide keyboard
 * shortcuts and the state they share with the homepage hint buttons:
 *
 *   D  cycles the design (data-design on <html>, persisted in localStorage)
 *   G  opens Pipeline Defender, lazy-loaded on first use so the game chunk
 *      never touches the critical path
 *
 * The design state initialises to 'default' and syncs from the DOM in an
 * effect: design-init.js has already set the attribute by then, and reading
 * localStorage during the first render would risk a hydration mismatch.
 */
import React, {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  DESIGN_STORAGE_KEY,
  isDesignId,
  nextDesign,
  type DesignId,
} from '@site/src/components/design/designs';
import DesignToast from '@site/src/components/design/DesignToast';

/* React.lazy + "render only when open" = the whole game (engine, canvas
   renderer, synth audio, field manual) lives in one same-origin async
   chunk that is only fetched on the first G press or hint tap. */
const GameOverlay = lazy(
  () => import('@site/src/components/game/GameOverlay')
);

interface ShortcutContextValue {
  design: DesignId;
  cycleDesign: () => void;
  openGame: () => void;
}

const ShortcutContext = createContext<ShortcutContextValue>({
  design: 'paper',
  cycleDesign: () => {},
  openGame: () => {},
});

export function useShortcuts(): ShortcutContextValue {
  return useContext(ShortcutContext);
}

/* The shortcut must never steal keystrokes from anything that accepts text,
   most importantly the always-present local-search input. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

const TOAST_MS = 2200;

export default function Root({ children }: { children: ReactNode }) {
  const [design, setDesign] = useState<DesignId>('paper');
  const [toastDesign, setToastDesign] = useState<DesignId | null>(null);
  const [gameOpen, setGameOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Adopt whatever design-init.js applied before hydration.
  useEffect(() => {
    const applied = document.documentElement.dataset.design;
    if (isDesignId(applied)) {
      setDesign(applied);
    }
  }, []);

  const cycleDesign = useCallback(() => {
    setDesign((current) => {
      const next = nextDesign(current);
      /* Paper is the attribute-free default; the others are opt-in. */
      if (next === 'paper') {
        delete document.documentElement.dataset.design;
      } else {
        document.documentElement.dataset.design = next;
      }
      try {
        window.localStorage.setItem(DESIGN_STORAGE_KEY, next);
      } catch {
        // Private mode: the design still applies for this page view.
      }
      setToastDesign(next);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToastDesign(null), TOAST_MS);
      return next;
    });
  }, []);

  const openGame = useCallback(() => setGameOpen(true), []);
  const closeGame = useCallback(() => setGameOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.repeat ||
        event.isComposing ||
        isTypingTarget(event.target)
      ) {
        return;
      }
      /* While the game is open it owns the keyboard: D is in-game movement,
         G must not re-toggle, Escape closes via the overlay's handler. */
      if (gameOpen) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === 'd') {
        cycleDesign();
      } else if (key === 'g') {
        setGameOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cycleDesign, gameOpen]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  return (
    <ShortcutContext.Provider value={{ design, cycleDesign, openGame }}>
      {children}
      {toastDesign !== null && <DesignToast design={toastDesign} />}
      {gameOpen && (
        /* fallback null: the chunk loads in well under a second and the
           overlay animates in on its own; a spinner would just flash. */
        <Suspense fallback={null}>
          <GameOverlay onClose={closeGame} />
        </Suspense>
      )}
    </ShortcutContext.Provider>
  );
}
