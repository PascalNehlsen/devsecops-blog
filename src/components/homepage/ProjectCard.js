import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProjectCard({ project }) {
  const { title, description, impact, tags = [], liveUrl, githubUrl, docsUrl } = project;
  return (
    <article className={styles.projectCard}>
      <div className={styles.cardTop}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {impact && <span className={styles.impact}>{impact}</span>}
      </div>
      <p className={styles.cardDesc}>{description}</p>
      {tags.length > 0 && (
        <div className={styles.tagRow}>
          {tags.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>
      )}
      <div className={styles.cardLinks}>
        {liveUrl && (
          <Link className={styles.cardLink} href={liveUrl}>
            Live <ArrowIcon />
          </Link>
        )}
        {docsUrl && (
          <Link className={styles.cardLink} to={docsUrl}>
            Docs <ArrowIcon />
          </Link>
        )}
        {githubUrl && (
          <Link className={styles.cardLink} href={githubUrl}>
            GitHub <ArrowIcon />
          </Link>
        )}
      </div>
    </article>
  );
}
