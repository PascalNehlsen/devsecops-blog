/**
 * Global wrapper (Docusaurus picks up src/theme/Root automatically; this is
 * a wrapper, not an ejected theme component). Hosts the site-wide keyboard
 * shortcuts and the state they share with the homepage hint buttons:
 *
 *   D  cycles the design (data-design on <html>, persisted in localStorage)
 *
 * The design state initialises to 'default' and syncs from the DOM in an
 * effect: design-init.js has already set the attribute by then, and reading
 * localStorage during the first render would risk a hydration mismatch.
 */
import React, {
  createContext,
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

interface ShortcutContextValue {
  design: DesignId;
  cycleDesign: () => void;
}

const ShortcutContext = createContext<ShortcutContextValue>({
  design: 'default',
  cycleDesign: () => {},
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
  const [design, setDesign] = useState<DesignId>('default');
  const [toastDesign, setToastDesign] = useState<DesignId | null>(null);
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
      if (next === 'default') {
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
      if (event.key.toLowerCase() === 'd') {
        cycleDesign();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cycleDesign]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  return (
    <ShortcutContext.Provider value={{ design, cycleDesign }}>
      {children}
      {toastDesign !== null && <DesignToast design={toastDesign} />}
    </ShortcutContext.Provider>
  );
}
