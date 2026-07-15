import React from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className={styles.header}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <Heading as="h2">{title}</Heading>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
