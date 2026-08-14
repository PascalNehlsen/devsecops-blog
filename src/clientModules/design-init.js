/**
 * Applies the persisted design choice as early as the CSP allows.
 *
 * Docusaurus avoids the dark-mode flash with an inline <script> before first
 * paint; this site's `script-src 'self'` rules that out, so the earliest
 * same-origin moment is bundle evaluation: after first paint, before React
 * hydration. The default (paper) needs no attribute at all and therefore
 * never flashes; users who picked terminal or classic see paper for the
 * first ~100-500ms of a cold load. Accepted trade-off: only people who have
 * pressed D at least once are affected.
 *
 * Root.tsx reads the attribute this module sets; it never reads
 * localStorage itself, so this is the single writer on load.
 */
import {
  DESIGN_STORAGE_KEY,
  isDesignId,
  migrateStoredDesign,
} from '../components/design/designs';

export function onRouteDidUpdate() {
  // No-op: the attribute lives on <html> and survives client-side routing.
}

if (typeof window !== 'undefined') {
  try {
    const stored = migrateStoredDesign(
      window.localStorage.getItem(DESIGN_STORAGE_KEY)
    );
    if (isDesignId(stored) && stored !== 'paper') {
      document.documentElement.dataset.design = stored;
    }
  } catch {
    // Private mode / blocked storage: stay on the default design.
  }
}
