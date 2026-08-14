/**
 * The learning half of Pipeline Defender: every tool, the threat artifacts
 * it catches, a few honest sentences on what it does in a real pipeline,
 * and a link into this site's own writing on the subject.
 */
import React from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import { THREATS, TOOLS, type ToolDef } from './content';
import styles from './GameOverlay.module.css';

function manualBody(tool: ToolDef): React.ReactNode {
  switch (tool.id) {
    case 'gitleaks':
      return (
        <Translate id="game.manual.gitleaks">
          Scans commits and git history for secrets: cloud keys, tokens,
          passwords. Runs pre-commit and in CI, because a secret that ever
          reached the history must be rotated, not just deleted.
        </Translate>
      );
    case 'osv':
      return (
        <Translate id="game.manual.osv">
          Matches your dependency manifests against known-vulnerability
          databases and flags packages that look almost like the one you
          meant. Most supply-chain incidents start with one careless install.
        </Translate>
      );
    case 'semgrep':
      return (
        <Translate id="game.manual.semgrep">
          Static analysis with readable rules: finds injection flaws, unsafe
          calls and missing checks in your own code before a reviewer ever
          sees the diff. Fast enough to gate every pull request.
        </Translate>
      );
    case 'guardrail':
      return (
        <Translate id="game.manual.guardrail">
          Input and output filtering around LLM features. Prompt injection
          cannot be patched inside the model, so the boundary has to be
          enforced outside it, plus a human approval step for anything
          irreversible.
        </Translate>
      );
    default:
      return null;
  }
}

export default function FieldManual({ onBack }: { onBack: () => void }) {
  return (
    <div className={styles.manual}>
      <h2 className={styles.panelTitle}>
        <Translate id="game.manual.title">Field manual</Translate>
      </h2>
      <ul className={styles.manualList}>
        {TOOLS.map((tool) => (
          <li
            key={tool.id}
            className={styles.manualEntry}
            style={{ borderLeftColor: `var(${tool.colorToken})` }}
          >
            <div className={styles.manualHead}>
              <kbd className={styles.hudKey}>{tool.key}</kbd>
              <span className={styles.manualTool}>{tool.name}</span>
              <span className={styles.manualThreats}>
                {THREATS.filter((t) => t.toolId === tool.id)
                  .map((t) => t.glyph)
                  .join('  ·  ')}
              </span>
            </div>
            <p className={styles.manualBody}>{manualBody(tool)}</p>
            {tool.readMore && (
              <Link to={tool.readMore} className={styles.manualLink}>
                <Translate id="game.manual.readMore">
                  Read the write-up
                </Translate>
              </Link>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className={styles.gameButton} onClick={onBack}>
        <Translate id="game.manual.back">Back</Translate>
      </button>
    </div>
  );
}
