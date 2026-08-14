/**
 * Transient confirmation after a design switch. `role="status"` +
 * `aria-live="polite"` so screen readers announce the change without the
 * toast stealing focus.
 */
import React from 'react';
import Translate from '@docusaurus/Translate';
import { designLabel, type DesignId } from './designs';
import styles from './DesignToast.module.css';

export default function DesignToast({ design }: { design: DesignId }) {
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <Translate id="design.toast" values={{ name: designLabel(design) }}>
        {'Design: {name} · press D to cycle'}
      </Translate>
    </div>
  );
}
