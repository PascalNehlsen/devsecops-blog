import React from 'react';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './styles.module.css';

export default function BlogPreview() {
  // Sourced from the blog plugin at build time, see plugins/latest-posts.
  // Permalinks come from the plugin, so these links cannot go stale.
  const { posts } = usePluginData('latest-posts');

  if (!posts?.length) {
    return null;
  }

  return (
    <div className={styles.blogGrid}>
      {posts.map((post) => (
        <Link
          key={post.permalink}
          to={post.permalink}
          className={styles.blogCard}
        >
          <span className={styles.blogDate}>
            {post.date}
            {post.readingTime
              ? ` · ${Math.ceil(post.readingTime)} min read`
              : null}
          </span>
          <h3 className={styles.blogTitle}>{post.title}</h3>
          <p className={styles.blogDesc}>{post.description}</p>
          <div className={styles.tagRow}>
            {post.tags.map((tag) => (
              <span key={tag.permalink} className={styles.tag}>
                {tag.label}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
