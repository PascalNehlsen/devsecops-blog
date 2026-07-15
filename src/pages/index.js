// src/pages/index.js
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
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

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const StackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l9 5-9 5-9-5 9-5z" strokeLinejoin="round" />
    <path d="M3 12l9 5 9-5M3 16l9 5 9-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PipelineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="5" cy="6" r="2" />
    <circle cx="5" cy="18" r="2" />
    <circle cx="19" cy="12" r="2" />
    <path d="M7 6h6a4 4 0 0 1 4 4M7 18h6a4 4 0 0 0 4-4" strokeLinecap="round" />
  </svg>
);

const FeatureList = [
  {
    title: 'Security First',
    Icon: ShieldIcon,
    description:
      'Building secure applications from the ground up. DevSecOps practices, security audits, and robust protection against vulnerabilities baked into every stage.',
  },
  {
    title: 'Full-Stack Development',
    Icon: StackIcon,
    description:
      'Scalable full-stack applications with Python, Django, Go and modern frontend frameworks. Clean code, best practices, and cutting-edge technologies.',
  },
  {
    title: 'CI/CD & Automation',
    Icon: PipelineIcon,
    description:
      'Streamlining deployment pipelines with containers and automated testing. Infrastructure as code for reliable, reproducible deployments.',
  },
];

function Feature({ Icon, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={sections.featureIconWrap}>
          <Icon />
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const terminalLines = [
    { type: 'command', text: 'whoami' },
    { type: 'output', text: siteConfig.title },
    { type: 'command', text: 'cat role.txt' },
    { type: 'output', text: siteConfig.tagline },
    { type: 'command', text: 'ls skills/' },
    { type: 'output', text: 'GCP  AWS  Terraform  Ansible  Docker  Go  Python' },
    { type: 'output', text: 'GitHub-Actions  Argo-CD  Prometheus  Grafana  SAST/DAST  MCP' },
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
    const typingSpeed = currentLine.type === 'output' ? 20 : 50;
    const pauseAfterLine = currentLine.type === 'output' ? 200 : 100;

    if (currentText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayedLines([...displayedLines, { ...currentLine, text: currentText }]);
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
              <span className={styles.terminalTitle}>~/portfolio</span>
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
        </div>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/projects/intro">
            Explore Projects
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/knowledge-base/intro">
            Knowledge Base
          </Link>
          <Link className="button button--secondary button--lg" href="https://github.com/PascalNehlsen">
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  return (
    <section className={sections.section}>
      <div className="container">
        <SectionHeader
          eyebrow="What I Do"
          title="Development, Security & Operations"
          subtitle="Bridging the gap between building fast and shipping safely."
        />
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProjects() {
  const featured = projects.filter((p) => p.featured);
  return (
    <section className={clsx(sections.section, sections.sectionAlt)}>
      <div className="container">
        <SectionHeader
          eyebrow="Portfolio"
          title="Featured Work"
          subtitle="Selected projects from my work as a DevSecOps Engineer and my own products."
        />
        <div className={sections.cardGrid}>
          {featured.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className={sections.section}>
      <div className="container">
        <SectionHeader
          eyebrow="Toolbox"
          title="Tech Stack"
          subtitle="The tools I reach for across the software delivery lifecycle."
        />
        <Skills />
      </div>
    </section>
  );
}

function RecentProjects() {
  const recent = projects.filter((p) => !p.featured);
  return (
    <section className={clsx(sections.section, sections.sectionAlt)}>
      <div className="container">
        <SectionHeader
          eyebrow="More Projects"
          title="Also on the Bench"
          subtitle="Products, containers, automation and security playgrounds."
        />
        <div className={sections.cardGrid}>
          {recent.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>
        <div className={sections.centerMore}>
          <Link className="button button--secondary button--lg" to="/docs/projects/intro">
            All Projects & Docs
          </Link>
        </div>
      </div>
    </section>
  );
}

function LatestBlog() {
  return (
    <section className={sections.section}>
      <div className="container">
        <SectionHeader
          eyebrow="Writing"
          title="Latest from the Blog"
          subtitle="Notes on DevSecOps, security and full-stack engineering."
        />
        <BlogPreview />
        <div className={sections.centerMore}>
          <Link className="button button--secondary button--lg" to="/blog">
            Read the Blog
          </Link>
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className={clsx(sections.section, sections.sectionAlt)}>
      <div className="container">
        <div className={sections.cta}>
          <Heading as="h2">Let's build something secure</Heading>
          <p>
            Interested in a project or collaboration? Reach out — or just type "Termin" in the AI
            chatbot in the bottom-right corner to book a slot.
          </p>
          <div className={sections.ctaButtons}>
            <Link className="button button--primary button--lg" href="https://www.linkedin.com/in/pascal-nehlsen">
              LinkedIn
            </Link>
            <Link className="button button--secondary button--lg" href="mailto:mail@pascal-nehlsen.de">
              Email Me
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Home"
      description="DevSecOps Engineer & Full-Stack Developer - Securing the software development lifecycle">
      <HomepageHeader />
      <main>
        <StatsBar />
        <HomepageFeatures />
        <FeaturedProjects />
        <TechStack />
        <RecentProjects />
        <LatestBlog />
        <CallToAction />
      </main>
    </Layout>
  );
}
