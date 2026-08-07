/**
 * Fails the build if any page loads a resource from another origin.
 *
 * The site claims, in its README and on its own project page, that it makes
 * no third-party requests: fonts are self-hosted, search runs from a local
 * index, there is no analytics and no embedded widget. That claim is the
 * reason the CSP can be `script-src 'self'` with no exceptions.
 *
 * A claim nobody checks decays. This turns it into a build failure.
 *
 * Only resource-loading attributes count. Outbound <a href> links to GitHub
 * or LinkedIn are navigation, not a request the visitor's browser makes on
 * page load, so they are ignored.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BUILD = join(dirname(fileURLToPath(import.meta.url)), '..', 'build');

// Attributes that cause the browser to fetch something during page load.
const PATTERNS = [
  { what: 'script src', re: /<script\b[^>]*\ssrc=["'](https?:)?\/\/([^"'/]+)/gi },
  { what: 'link href', re: /<link\b[^>]*\shref=["'](https?:)?\/\/([^"'/]+)/gi },
  { what: 'img src', re: /<img\b[^>]*\ssrc=["'](https?:)?\/\/([^"'/]+)/gi },
  { what: 'iframe src', re: /<iframe\b[^>]*\ssrc=["'](https?:)?\/\/([^"'/]+)/gi },
  { what: 'source src', re: /<source\b[^>]*\ssrc(?:set)?=["'](https?:)?\/\/([^"'/]+)/gi },
  { what: 'video/audio', re: /<(?:video|audio)\b[^>]*\ssrc=["'](https?:)?\/\/([^"'/]+)/gi },
  { what: 'css url()', re: /url\(\s*["']?(https?:)?\/\/([^"')/]+)/gi },
];

// og:image and friends are metadata for a crawler, not a fetch the visitor
// makes. They legitimately carry the absolute site URL.
const OWN_HOSTS = new Set(['pascal-nehlsen.de', 'www.pascal-nehlsen.de']);

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (entry.endsWith('.html') || entry.endsWith('.css')) yield p;
  }
}

const findings = [];
for (const file of htmlFiles(BUILD)) {
  const content = readFileSync(file, 'utf8');
  for (const { what, re } of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const host = m[2];
      if (!OWN_HOSTS.has(host)) {
        findings.push({ file: file.replace(BUILD, ''), what, host });
      }
    }
  }
}

if (findings.length > 0) {
  console.error('Third-party resources found in the build:\n');
  const byHost = new Map();
  for (const f of findings) {
    if (!byHost.has(f.host)) byHost.set(f.host, []);
    byHost.get(f.host).push(f);
  }
  for (const [host, list] of byHost) {
    console.error(`  ${host}  (${list.length} reference${list.length > 1 ? 's' : ''})`);
    for (const f of list.slice(0, 3)) {
      console.error(`      ${f.what} in ${f.file}`);
    }
    if (list.length > 3) console.error(`      ... and ${list.length - 3} more`);
  }
  console.error(
    '\nThe site documents itself as making no third-party requests.\n' +
      'Either remove the resource or update that claim; do not leave both standing.'
  );
  process.exit(1);
}

console.log('No third-party resources in the build.');
