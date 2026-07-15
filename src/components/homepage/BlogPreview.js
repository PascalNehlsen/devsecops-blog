import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import { latestPosts } from '@site/src/data/homepage';

export default function BlogPreview() {
  return (
    <div className={styles.blogGrid}>
      {latestPosts.map((post) => (
        <Link key={post.to} to={post.to} className={styles.blogCard}>
          <span className={styles.blogDate}>{post.date}</span>
          <h3 className={styles.blogTitle}>{post.title}</h3>
          <p className={styles.blogDesc}>{post.description}</p>
          <div className={styles.tagRow}>
            {post.tags.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
