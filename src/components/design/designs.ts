/**
 * The design registry for the D shortcut.
 *
 * A "design" is a second theming axis next to Docusaurus' light/dark
 * `data-theme`: it is applied as `data-design` on <html> and picked up by
 * src/css/designs.css.
 *
 * 'paper' is the site's default: its CSS also matches a *missing* attribute
 * (html:is([data-design='paper'], :not([data-design]))), so first paint and
 * no-JS visitors get paper without any script running. 'classic' (the
 * pre-paper look) deliberately has no CSS rules at all: setting the
 * attribute to it simply exposes the base tokens.
 *
 * Adding a design = one entry here, one label case below, one selector
 * block in designs.css, one entry in i18n/de/code.json.
 */
import { translate } from '@docusaurus/Translate';

export const DESIGNS = ['paper', 'terminal', 'classic'] as const;
export type DesignId = (typeof DESIGNS)[number];

/* Shares the bare-word style of Docusaurus' own localStorage['theme']. */
export const DESIGN_STORAGE_KEY = 'design';

export function isDesignId(value: unknown): value is DesignId {
  return (DESIGNS as readonly unknown[]).includes(value);
}

/* Visitors from before paper became the default may have 'default' (the
   old name for the classic look) persisted. */
export function migrateStoredDesign(value: string | null): string | null {
  return value === 'default' ? 'classic' : value;
}

export function nextDesign(current: DesignId): DesignId {
  const index = DESIGNS.indexOf(current);
  return DESIGNS[(index + 1) % DESIGNS.length];
}

/* One static translate() call per design: write-translations can only
   extract literal ids, so a dynamic `design.name.${id}` would be invisible
   to the German catalogue. */
export function designLabel(id: DesignId): string {
  switch (id) {
    case 'terminal':
      return translate({ id: 'design.name.terminal', message: 'Terminal' });
    case 'classic':
      return translate({ id: 'design.name.classic', message: 'Classic' });
    default:
      return translate({ id: 'design.name.paper', message: 'Paper' });
  }
}
