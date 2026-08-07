import React, { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import { stats } from '@site/src/data/homepage';

function useCountUp(target, active) {
  // Starts at the target, not at zero. The server-rendered HTML therefore
  // contains the real number, so a reader with JavaScript disabled, a slow
  // hydration, or an IntersectionObserver that never fires still sees "80%"
  // rather than "0%", which would be the three most important numbers on
  // the page silently reading as nothing.
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!active) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(target);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return value;
}

function Stat({ value, suffix, label, href, active }) {
  const current = useCountUp(value, active);
  const body = (
    <>
      <div className={styles.statValue}>
        {current}
        {suffix}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </>
  );

  // A number that links to the post documenting it is a claim a reader can
  // check. One that doesn't is a claim they have to trust.
  return href ? (
    <Link to={href} className={styles.statLink}>
      {body}
    </Link>
  ) : (
    <div>{body}</div>
  );
}

export default function StatsBar() {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={styles.statsSection}>
      <div className="container">
        <div className={styles.statsGrid}>
          {stats.map((s, i) => (
            <Stat key={i} {...s} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
