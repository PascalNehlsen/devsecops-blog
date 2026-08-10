// src/pages/index.js
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate, { translate } from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';
import sections from '../components/homepage/styles.module.css';
import SectionHeader from '../components/homepage/SectionHeader';
import StatsBar from '../components/homepage/StatsBar';
import ProjectCard from '../components/homepage/ProjectCard';
import Skills from '../components/homepage/Skills';
import BlogPreview from '../components/homepage/BlogPreview';
import projects from '../data/projects';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // The terminal prints three numbers a peer can argue with, phrased as
  // commit subjects. The previous `ls skills/` output was a badge dump that
  // the Stack section already does better, and it said nothing about the
  // work.
  const terminalLines = [
    { type: 'command', text: 'whoami' },
    { type: 'output', text: `${siteConfig.title} · ${siteConfig.tagline}` },
    { type: 'command', text: 'git log --oneline -3' },
    {
      type: 'output',
      text: 'a1c4f20  provisioning 4h -> 45min (terraform golden paths)',
    },
    {
      type: 'output',
      text: '7e9b13d  rollback on SLO breach, deploy errors <2%',
    },
    {
      type: 'output',
      text: 'f02d88e  80+ sandboxes per cohort, compute -50%',
    },
  ];

  // Respect reduced-motion: render the full terminal instantly.
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) {
      setDisplayedLines(terminalLines);
      setIsTypingComplete(true);
      setCurrentLineIndex(terminalLines.length);
      return;
    }
    if (currentLineIndex >= terminalLines.length) {
      setIsTypingComplete(true);
      return;
    }

    const currentLine = terminalLines[currentLineIndex];
    const fullText = currentLine.text;
    const typingSpeed = currentLine.type === 'output' ? 12 : 45;
    const pauseAfterLine = currentLine.type === 'output' ? 120 : 100;

    if (currentText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayedLines([
          ...displayedLines,
          { ...currentLine, text: currentText },
        ]);
        setCurrentText('');
        setCurrentLineIndex(currentLineIndex + 1);
      }, pauseAfterLine);
      return () => clearTimeout(timeout);
    }
  }, [currentText, currentLineIndex, displayedLines, prefersReduced]);

  const renderLine = (line, index) => {
    if (line.type === 'prompt' || line.type === 'command') {
      return (
        <p key={index}>
          <span className={styles.prompt}>$ </span>
          {line.type === 'command' && line.text}
        </p>
      );
    }
    return (
      <p key={index} className={styles.output}>
        {line.text}
      </p>
    );
  };

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.terminalWindow}>
            <div className={styles.terminalHeader}>
              <span className={styles.terminalButton}></span>
              <span className={styles.terminalButton}></span>
              <span className={styles.terminalButton}></span>
              <span className={styles.terminalTitle}>~/platform</span>
            </div>
            <div className={styles.terminalBody}>
              {displayedLines.map((line, index) => renderLine(line, index))}
              {currentText &&
                currentLineIndex < terminalLines.length &&
                (terminalLines[currentLineIndex].type === 'command' ? (
                  <p>
                    <span className={styles.prompt}>$ </span>
                    {currentText}
                    <span className={styles.cursor}>█</span>
                  </p>
                ) : (
                  <p className={styles.output}>
                    {currentText}
                    <span className={styles.cursor}>█</span>
                  </p>
                ))}
              {isTypingComplete && (
                <p>
                  <span className={styles.prompt}>$ </span>
                  <span className={styles.cursor}>█</span>
                </p>
              )}
            </div>
          </div>

          <p className={styles.heroStatement}>
            <Translate id="homepage.hero.statement">
              I build the paved road: self-service infrastructure and the
              guardrails that let teams ship fast without shipping holes.
            </Translate>
          </p>
        </div>

        {/* One primary CTA per view. The other two are secondary. */}
        <div className={styles.buttons}>
          {/* A plain anchor, not <Link>: this is a same-page jump that needs
              no client-side routing, and the broken-anchor checker only
              collects ids from MDX headings, not from JSX sections. */}
          <a className="button button--primary button--lg" href="#work">
            <Translate id="homepage.hero.ctaWork">Selected work</Translate>
          </a>
          <Link className="button button--secondary button--lg" to="/blog">
            <Translate id="homepage.hero.ctaWriting">Writing</Translate>
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://github.com/PascalNehlsen"
          >
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function SelectedWork() {
  const selected = projects.filter((p) => p.featured === 'selected');
  return (
    <section id="work" className={clsx(sections.section, sections.sectionAlt)}>
      <div className="container">
        <SectionHeader
          eyebrow={translate({
            id: 'homepage.work.eyebrow',
            message: 'Work',
          })}
          title={translate({
            id: 'homepage.work.title',
            message: 'Selected Work',
          })}
          subtitle={translate({
            id: 'homepage.work.subtitle',
            message:
              'Three problems I owned end to end: the constraint, what I changed, and the number it moved.',
          })}
        />
        <div className={sections.cardGrid}>
          {selected.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>
        {/* Replaces the eleven-card "Also on the Bench" section. Eleven
            learning projects below three real ones diluted the top. */}
        {/* The link is passed as a value rather than concatenated, so the
            translation can move it to wherever the German sentence needs it. */}
        <p className={sections.alsoLine}>
          <Translate
            id="homepage.work.alsoLine"
            values={{
              docsLink: (
                <Link to="/docs/projects/intro">
                  <Translate id="homepage.work.alsoLine.link">
                    all of it is documented
                  </Translate>
                </Link>
              ),
            }}
          >
            {
              'Also: a security pipeline gating SAST and DAST in GitHub Actions, two SaaS products, and a set of smaller projects. {docsLink}.'
            }
          </Translate>
        </p>
      </div>
    </section>
  );
}

function LatestWriting() {
  return (
    <section className={sections.section}>
      <div className="container">
        <SectionHeader
          eyebrow={translate({
            id: 'homepage.writing.eyebrow',
            message: 'Writing',
          })}
          title={translate({
            id: 'homepage.writing.title',
            message: 'Latest Writing',
          })}
          subtitle={translate({
            id: 'homepage.writing.subtitle',
            message:
              "Build notes from the work above: what broke, what I measured, what I'd do differently.",
          })}
        />
        <BlogPreview />
        <div className={sections.centerMore}>
          <Link className="button button--secondary button--lg" to="/blog">
            <Translate id="homepage.writing.allPosts">All posts</Translate>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className={clsx(sections.section, sections.sectionAlt)}>
      <div className="container">
        <SectionHeader
          eyebrow={translate({
            id: 'homepage.stack.eyebrow',
            message: 'Stack',
          })}
          title={translate({
            id: 'homepage.stack.title',
            message: 'What I run',
          })}
          subtitle={translate({
            id: 'homepage.stack.subtitle',
            message:
              "Grouped by where they sit in the delivery path. Everything here I've run in production, not just evaluated.",
          })}
        />
        <Skills />
      </div>
    </section>
  );
}

function CallToAction() {
  // Same trap as the footer link in docusaurus.config.ts: pathname:// skips
  // baseUrl, so on /de/ this would point at the English feed unless the
  // locale is added by hand.
  const { i18n } = useDocusaurusContext();
  const feedHref =
    i18n.currentLocale === i18n.defaultLocale
      ? 'pathname:///blog/rss.xml'
      : `pathname:///${i18n.currentLocale}/blog/rss.xml`;
  return (
    <section className={sections.section}>
      <div className="container">
        <div className={sections.cta}>
          <Heading as="h2">
            <Translate id="homepage.cta.title">Talk shop</Translate>
          </Heading>
          <p>
            <Translate id="homepage.cta.body">
              I'm up for comparing notes on platform work: golden paths,
              approval gates on agents, what your rollback criteria actually
              are.
            </Translate>
          </p>
          <div className={sections.ctaButtons}>
            <Link
              className="button button--primary button--lg"
              href="https://www.linkedin.com/in/pascal-nehlsen"
            >
              LinkedIn
            </Link>
            <Link
              className="button button--secondary button--lg"
              href="https://github.com/PascalNehlsen"
            >
              GitHub
            </Link>
            <Link className="button button--secondary button--lg" href={feedHref}>
              RSS
            </Link>
          </div>
          {/* Written out, not hidden behind "Email Me". Peers copy
              addresses, they don't click labels. */}
          <p className={sections.ctaMail}>mail@pascal-nehlsen.de</p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      // No title prop: Docusaurus falls back to siteConfig.title, which gives
      // "Pascal Nehlsen" instead of "Home | Pascal Nehlsen".
      description={translate({
        id: 'homepage.meta.description',
        message:
          'Platform and security engineering. Terraform golden paths on GCP, SLO-gated deploys, agentic runbooks with human approval.',
      })}
    >
      <HomepageHeader />
      <main>
        <StatsBar />
        <SelectedWork />
        <LatestWriting />
        <TechStack />
        <CallToAction />
      </main>
    </Layout>
  );
}
