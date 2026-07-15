import React from 'react';
import styles from './styles.module.css';
import { skillGroups } from '@site/src/data/homepage';

export default function Skills() {
  return (
    <div className={styles.skillsGrid}>
      {skillGroups.map((group) => (
        <div key={group.title} className={styles.skillGroup}>
          <h3 className={styles.skillGroupTitle}>{group.title}</h3>
          <div className={styles.skillBadges}>
            {group.skills.map((s) => (
              <span key={s} className={styles.skillBadge}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
