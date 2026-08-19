/**
 * The design registry for the D shortcut.
 *
 * A "design" is a second theming axis next to Docusaurus' light/dark
 * `data-theme`: it is applied as `data-design` on <html> and picked up by
 * src/css/designs.css. 'default' deliberately has no CSS rules at all, so
 * the shipped look can never drift by accident.
 *
 * Adding a design = one entry here, one label case below, one selector
 * block in designs.css, one entry in i18n/de/code.json.
 */
import { translate } from '@docusaurus/Translate';

export const DESIGNS = ['default', 'terminal', 'paper'] as const;
export type DesignId = (typeof DESIGNS)[number];

/* Shares the bare-word style of Docusaurus' own localStorage['theme']. */
export const DESIGN_STORAGE_KEY = 'design';

export function isDesignId(value: unknown): value is DesignId {
  return (DESIGNS as readonly unknown[]).includes(value);
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
    case 'paper':
      return translate({ id: 'design.name.paper', message: 'Paper' });
    default:
      return translate({ id: 'design.name.default', message: 'Classic' });
  }
}
