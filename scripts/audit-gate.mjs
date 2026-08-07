/**
 * Dependency audit gate.
 *
 * Fails on high and critical advisories, with a short list of exceptions that
 * each carry a reason and an expiry date.
 *
 * Three rules make this an exception list rather than a mute button:
 *
 *   1. An exception needs a written reason. "Known issue" is not a reason.
 *   2. An exception expires. Once past its date the build fails again, so the
 *      decision gets made a second time instead of outliving the person who
 *      made it.
 *   3. An exception that is no longer needed also fails. Otherwise the list
 *      only ever grows, and a long allowlist is indistinguishable from having
 *      no gate at all.
 *
 * Note on --omit=dev: for a static site generator that distinction does not
 * mean what it usually means. Nothing here reaches a visitor's browser or a
 * server; the output is HTML. Every advisory below is build-time by nature,
 * so the question is not "is it a dev dependency" but "can untrusted input
 * reach it during our build".
 */

import { execFileSync } from 'node:child_process';

const EXCEPTIONS = [
  {
    package: 'serialize-javascript',
    expires: '2026-11-07',
    reason:
      'Reached only through copy-webpack-plugin and css-minimizer-webpack-plugin inside @docusaurus/bundler, i.e. at build time, serialising our own build output rather than untrusted input. The only remediation npm offers is downgrading @docusaurus/core to 3.5.2, which is a downgrade, not a fix. Revisit when Docusaurus ships a bundler release that bumps it.',
  },
];

function audit() {
  try {
    return JSON.parse(
      execFileSync('npm', ['audit', '--json'], {
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
      })
    );
  } catch (error) {
    // npm exits non-zero when it finds anything; the report is still on stdout.
    if (error.stdout) return JSON.parse(error.stdout);
    throw error;
  }
}

const today = new Date().toISOString().slice(0, 10);
const report = audit();
const blocking = Object.entries(report.vulnerabilities ?? {}).filter(
  ([, v]) => v.severity === 'high' || v.severity === 'critical'
);

const problems = [];
const used = new Set();

for (const [name, v] of blocking) {
  const exception = EXCEPTIONS.find((e) => e.package === name);
  if (!exception) {
    const titles = (v.via ?? [])
      .map((x) => (typeof x === 'object' ? x.title : x))
      .slice(0, 1);
    problems.push(`  ${v.severity.toUpperCase()}  ${name}\n      ${titles[0] ?? ''}`);
    continue;
  }
  used.add(name);
  if (exception.expires < today) {
    problems.push(
      `  EXPIRED  ${name}\n      The exception ran out on ${exception.expires}. Re-read it and either fix or renew.`
    );
  } else {
    console.log(`  accepted  ${name}  (until ${exception.expires})`);
  }
}

for (const e of EXCEPTIONS) {
  if (!used.has(e.package)) {
    problems.push(
      `  STALE    ${e.package}\n      No longer flagged. Remove the exception so the list stays short.`
    );
  }
}

if (problems.length > 0) {
  console.error('\nDependency audit gate failed:\n');
  console.error(problems.join('\n'));
  console.error(
    '\nFix it, or add an exception in scripts/audit-gate.mjs with a reason and an expiry date.\n'
  );
  process.exit(1);
}

const counts = report.metadata?.vulnerabilities ?? {};
const summary = Object.entries(counts)
  .filter(([k, n]) => n > 0 && k !== 'total')
  .map(([k, n]) => `${k}: ${n}`)
  .join(', ');
console.log(`No unaccepted high or critical advisories. (${summary || 'none'})`);
