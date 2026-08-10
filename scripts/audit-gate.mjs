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
 * A note on scope: for a static site generator the dependency versus
 * devDependency split does not mean what it usually means. Nothing here
 * reaches a visitor's browser or a server; the output is HTML. Every advisory
 * is build-time by nature, so the question is not "is this a dev dependency"
 * but "can untrusted input reach it during our build".
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const EXCEPTIONS = [
  {
    package: 'serialize-javascript',
    // GitHub's dependency-review action needs the same exception expressed as
    // an advisory id. Two gates disagreeing about one accepted risk is worse
    // than either gate alone, so the id is recorded here and the check below
    // verifies the workflow still carries it.
    ghsa: 'GHSA-5c6j-r48x-rmvq',
    expires: '2026-11-07',
    reason:
      'Reached only through copy-webpack-plugin and css-minimizer-webpack-plugin inside @docusaurus/bundler, i.e. at build time, serialising our own build output rather than untrusted input. The only remediation npm offers is downgrading @docusaurus/core to 3.5.2, which is a downgrade, not a fix. Revisit when Docusaurus ships a bundler release that bumps it.',
  },
  // image-size has two open high advisories and one package, so it takes two
  // entries: the block below matches on package name, but the drift check
  // pairs one GHSA per exception with allow-ghsas in security.yml.
  {
    package: 'image-size',
    ghsa: 'GHSA-w3rx-r6r6-pgpr',
    expires: '2026-11-07',
    reason:
      'Pulled by @docusaurus/mdx-loader to read image dimensions at build time, from the repo\'s own committed images, not from anything an attacker supplies. The ICNS parser DoS therefore has no reachable path. image-size 2.0.2 is the latest release and no version fixes it yet, so there is nothing to bump to. Revisit when image-size ships a patched release.',
  },
  {
    package: 'image-size',
    ghsa: 'GHSA-5p2g-fcmc-qvqq',
    expires: '2026-11-07',
    reason:
      'Same package, same build-time-only reachability from our own images: the JXL/HEIF parser DoS has no untrusted-input path either, and no fixed release exists yet.',
  },
];

function audit() {
  try {
    return JSON.parse(
      execFileSync('pnpm', ['audit', '--json'], {
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
      })
    );
  } catch (error) {
    // pnpm exits non-zero when it finds anything; the report is still on stdout.
    if (error.stdout) return JSON.parse(error.stdout);
    throw error;
  }
}

const today = new Date().toISOString().slice(0, 10);
const report = audit();

const RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const worst = new Map();
for (const advisory of Object.values(report.advisories ?? {})) {
  const name = advisory.module_name;
  const previous = worst.get(name);
  if (!previous || RANK[advisory.severity] > RANK[previous.severity]) {
    worst.set(name, advisory);
  }
}

const blocking = [...worst.entries()].filter(
  ([, a]) => a.severity === 'high' || a.severity === 'critical'
);

const problems = [];
const used = new Set();

for (const [name, advisory] of blocking) {
  const exception = EXCEPTIONS.find((e) => e.package === name);
  if (!exception) {
    problems.push(
      `  ${advisory.severity.toUpperCase()}  ${name}\n      ${advisory.title ?? ''}`
    );
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

// Keep the two gates in step. dependency-review takes advisory ids in the
// workflow file; this list takes package names. If they drift, one gate blocks
// a risk the other has accepted, and whichever runs first decides.
const workflow = readFileSync(
  join(ROOT, '.github/workflows/security.yml'),
  'utf8'
);
for (const e of EXCEPTIONS) {
  if (e.ghsa && !workflow.includes(e.ghsa)) {
    problems.push(
      `  DRIFT    ${e.package}\n      ${e.ghsa} is accepted here but missing from allow-ghsas in security.yml.`
    );
  }
}
const declared = [...workflow.matchAll(/GHSA-[a-z0-9-]+/g)].map((m) => m[0]);
for (const ghsa of new Set(declared)) {
  if (!EXCEPTIONS.some((e) => e.ghsa === ghsa)) {
    problems.push(
      `  DRIFT    ${ghsa}\n      Allowed in security.yml with no matching exception here, so it has no reason and no expiry.`
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
