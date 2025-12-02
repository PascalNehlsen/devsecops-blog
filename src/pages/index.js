// src/pages/index.js
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const FeatureList = [
    {
        title: 'Security First',
        icon: '',
        description: (
            <>
                Building secure applications from the ground up. Implementing DevSecOps practices,
                conducting security audits, and ensuring robust protection against vulnerabilities.
            </>
        ),
    },
    {
        title: 'Full-Stack Development',
        icon: '',
        description: (
            <>
                Creating scalable full-stack applications with Python, Django, Flask, and modern frontend frameworks.
                Focused on clean code, best practices, and cutting-edge technologies.
            </>
        ),
    },
    {
        title: 'CI CD and Automation',
        icon: '',
        description: (
            <>
                Streamlining deployment pipelines with Docker, Kubernetes, and automated testing.
                Building infrastructure as code for reliable and reproducible deployments.
            </>
        ),
    },
];

function Feature({ icon, title, description }) {
    return (
        <div className={clsx('col col--4')}>
            <div className={styles.featureCard}>
                <div className={styles.featureIcon}>{icon}</div>
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
        { type: 'output', text: 'DevSecOps  Python  Django  Flask  Docker  Kubernetes' },
        { type: 'output', text: 'Angular  React  TypeScript  CI/CD  Security-Audits' },
    ];

    useEffect(() => {
        if (currentLineIndex >= terminalLines.length) {
            setIsTypingComplete(true);
            return;
        }

        const currentLine = terminalLines[currentLineIndex];
        const fullText = currentLine.text;

        // Typing speed based on line type
        const typingSpeed = currentLine.type === 'output' ? 20 : 50;
        const pauseAfterLine = currentLine.type === 'output' ? 200 : 100;

        if (currentText.length < fullText.length) {
            const timeout = setTimeout(() => {
                setCurrentText(fullText.substring(0, currentText.length + 1));
            }, typingSpeed);
            return () => clearTimeout(timeout);
        } else {
            // Line complete, move to next after pause
            const timeout = setTimeout(() => {
                setDisplayedLines([...displayedLines, { ...currentLine, text: currentText }]);
                setCurrentText('');
                setCurrentLineIndex(currentLineIndex + 1);
            }, pauseAfterLine);
            return () => clearTimeout(timeout);
        }
    }, [currentText, currentLineIndex, displayedLines]);

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
                            {currentText && (
                                currentLineIndex < terminalLines.length && (
                                    terminalLines[currentLineIndex].type === 'command' ? (
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
                                    )
                                )
                            )}
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
                    <Link
                        className="button button--primary button--lg"
                        to="/docs/projects/intro">
                        Explore Projects
                    </Link>
                    <Link
                        className="button button--secondary button--lg"
                        to="/docs/knowledge-base/intro">
                        Knowledge Base
                    </Link>
                    <Link
                        className="button button--secondary button--lg"
                        href="https://github.com/PascalNehlsen">
                        GitHub
                    </Link>
                </div>
            </div>
        </header>
    );
}

function HomepageFeatures() {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className={styles.sectionHeader}>
                    <Heading as="h2">What I Do</Heading>
                    <p className={styles.sectionSubtitle}>
                        Bridging the gap between development, security, and operations
                    </p>
                </div>
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Home() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title="Home"
            description="DevSecOps Engineer & Full-Stack Developer - Securing the software development lifecycle">
            <HomepageHeader />
            <main>
                <HomepageFeatures />
            </main>
        </Layout>
    );
}
