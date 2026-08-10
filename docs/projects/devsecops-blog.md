---
id: devsecops-blog
title: "This Site"
sidebar_label: "This Site"
sidebar_position: 5
description: "How this site is built and what it enforces: zero third-party requests, a build that fails on a broken link, and a dependency gate whose exceptions expire."
keywords: [docusaurus, github pages, csp, self-hosted fonts, ci security, detect-secrets]
---

# This Site

:::info[Live]
[pascal-nehlsen.de](https://pascal-nehlsen.de). You are reading it.
:::

A Docusaurus site on GitHub Pages. That part is unremarkable, and most of what
a page like this usually contains (how to run the dev server, what a static site
generator is) belongs in the [README](https://github.com/PascalNehlsen/devsecops-blog),
not here.

What is worth writing down is the set of things the build refuses to let me
get wrong, and how they got that way.

## Three constraints

Each of these is checked rather than asserted, which is the only reason they
are worth stating.

**No third-party requests.** No font CDN, no analytics, no hosted search, no
embedded widget, no hotlinked avatar. Open the network tab: every request goes
to this origin. `scripts/check-no-third-party.mjs` scans the built HTML and CSS
for resource-loading attributes and fails the build if any of them points
somewhere else. Outbound `<a href>` links are ignored, because a link is
navigation, not a fetch your browser performs on page load.

The check earned its place on the first run by finding three shields.io badges
on a project page that had been loading from an external host on every visit.

This constraint is also what allows the Content-Security-Policy to be
`script-src 'self'` with no exceptions.

**Nothing on the page that isn't true.** Metrics link to the write-up that
documents them. Security exercises are labelled as exercises. The knowledge
base says which topics it does not cover. Where a project has a limitation
worth knowing, the page says so.

**Every check that can block, blocks.** `onBrokenLinks`, `onBrokenAnchors`,
`onBrokenMarkdownLinks`, `onInlineTags` and `onUntruncatedBlogPosts` are all
set to `throw`. A broken internal link fails the build rather than reaching
production. A blog post tagged with a word that is not in the vocabulary fails
the build rather than minting a duplicate tag page.

## The pipeline

Four workflows, all actions pinned to commit SHAs rather than tags, because a
tag can be moved to point at different code.

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `test.yaml` | PRs and `main` | Typecheck, build (which is also the link check), third-party verification |
| `security.yml` | PRs, `main`, weekly | Dependency gate, secret scan, dependency review |
| `main.yml` | push to `main` | Calls the deploy workflow |
| `deploy.yaml` | called or manual | Build, verify, upload artifact, deploy to Pages |

The weekly schedule on the security workflow exists because a vulnerability
disclosed on a Tuesday should not wait for the next commit to be noticed, and
this repository can go weeks without one.

### The dependency gate

`pnpm audit --audit-level=high` would be the obvious answer, and it is not
quite enough. When I added it, four high advisories existed. Three were fixed
by an audit fix. The fourth, `serialize-javascript`, is reached only through
webpack plugins inside `@docusaurus/bundler` at build time, where it
serialises this site's own output rather than untrusted input, and the only
proposed remedy is downgrading `@docusaurus/core` by five minor versions.
That is a downgrade, not a fix.

So the gate is a script, and an exception needs three things:

1. **A written reason.** "Known issue" is not a reason.
2. **An expiry date.** Once past it the build fails again, so the decision
   gets made a second time instead of outliving the person who made it.
3. **To still be necessary.** An exception that no longer matches any advisory
   also fails the build. Otherwise the list only grows, and a long allowlist
   is indistinguishable from having no gate.

The third rule is the one I would keep if I could only keep one. Allowlists
rot quietly.

### Why pnpm

The package manager is part of the supply chain, so it gets a decision rather
than a default.

npm hoists every transitive dependency into one flat `node_modules`, which
means code can import packages the manifest never declared. This repository
had exactly that: a component used `@types/react` without depending on it, and
nothing noticed until pnpm's strict tree refused to resolve it. An undeclared
dependency is one nobody audits, because nobody knows it is there.

pnpm also blocks `postinstall` scripts unless each is approved. A postinstall
hook runs arbitrary code on every machine that installs, CI included, and npm
runs them all without asking.

A side effect worth recording: npm reported 26 advisories against this tree
and pnpm reports 3. The difference is not that one is more lenient. npm was
counting the same advisory once per hoisted path.

### Secrets

`detect-secrets` runs against a committed baseline over the full history,
because a credential that was committed and then removed is still a leaked
credential. Only new findings fail. The baseline currently holds six values,
all of them example strings in documentation about secrets management, and
each was read before being accepted rather than batch-approved.

## Fonts, search, and the CSP

Two decisions carry the no-third-party constraint.

**Fonts are self-hosted.** Eight `woff2` files, latin subset, about 212 KB
total, vendored into `static/fonts/` with their OFL licences rather than
resolved at build time, so what ships is what was reviewed. A
`fonts.gstatic.com` request would leak every visitor's IP to a third party and
would force `font-src` to allow an external host.

**Search runs in the browser.** `@easyops-cn/docusaurus-search-local` builds a
lunr index at compile time. Algolia DocSearch would mean an application, an
approval, an externally scheduled crawler, and a request to someone else's
server on every query. For five posts and thirty-two documents the index is
about 1.1 MB per language, lazy-loaded on first use, and a visitor only ever
loads the one for the language they are reading.

Both indexes are built with a single stemmer each rather than a combined one.
The plugin switches to `lunr.multiLanguage` as soon as more than one language
is listed, which would hand the English index a German stemmer it has no
content for, at a cost in precision. The German stemmer and its stop words come
from `lunr-languages`, a dependency of the search plugin: German search
therefore costs zero third-party requests, which is what keeps the constraint
above true in both languages.

## Two languages

The site is built in English and German: `docusaurus build` runs once per
locale, English at the root and German under `/de/`. English stays the default,
so no URL that was ever indexed moved.

Three things were worth the effort of writing down, because in all three cases
a green build proves nothing:

- **The sitemap exclusions are per locale.** Route paths carry `baseUrl`, which
  is `/de/` in the German build, so a pattern like `/blog/tags/**` silently
  misses `/de/blog/tags/terraform`. Without the locale prefix every page this
  site deliberately keeps out of the sitemap would reappear for half the
  corpus. There is one sitemap per locale, and `robots.txt` names both.
- **The feed links are per locale.** They use `pathname://`, which bypasses
  `baseUrl` along with everything else, so the German footer would have
  advertised the English feed while `/de/blog/rss.xml` sat in the build
  unlinked.
- **Cross-locale links have to use `pathname://` too.** A build only knows the
  routes of the locale it is building, so a plain link from the English legal
  notice to `/de/impressum` fails `onBrokenLinks: 'throw'`.

The legal pages are the one place where the German version is the original: § 5
DDG and Art. 13 GDPR address a German audience, and the binding version of a
legal notice is the German one. The English `/impressum` and `/datenschutz` are
translations carrying a precedence clause and a link to the German text.

## Theming

Colours, type, spacing and motion live in `src/css/tokens.css` as two layers:
theme-independent primitives, then semantic colours per theme, bridged onto
the `--ifm-*` variables Infima actually reads. No component stylesheet
contains a colour literal.

Two things worth recording from building it.

**Contrast ratios are computed, not eyeballed.** They sit in comments next to
the values. The light-mode accent is `#15803D` because it is the lightest
green clearing 4.5:1 on all three light surfaces; the dark-mode `#22C55E` is
2.28:1 on white and unusable there. One token, `--c-text-dim`, fails AA for
body text in both themes and is documented as decorative-only rather than
silently used.

**Infima's variables are declared under `html[data-theme='dark']`.** Selector
specificity `(0,1,1)`. A token layer written as `[data-theme='dark']` is
`(0,1,0)` and loses every single variable to it. The symptom was a background
seam exactly one viewport down the page, and it was found by reading the
computed styles of the built site rather than by trusting the stylesheet.

## What this site does not do

No analytics, so I do not know how many people read anything here. That is a
deliberate trade and not a claim to virtue: the traffic numbers would be
useful, and I decided the third-party request was not worth them.

No tests. For a static site whose build fails on a broken link, a broken
anchor, a broken markdown link, an unknown tag and an external resource, the
build is the test suite. That reasoning would not survive contact with an
application that has behaviour.

No response headers. GitHub Pages cannot set them, so HSTS, a real CSP and
`frame-ancestors` require a proxy in front. Until that is in place the CSP
described above is a `<meta http-equiv>`, which is weaker: it cannot express
`frame-ancestors` and it arrives after the first bytes of the document.

## Resources

- Live: [pascal-nehlsen.de](https://pascal-nehlsen.de)
- Repository: [github.com/PascalNehlsen/devsecops-blog](https://github.com/PascalNehlsen/devsecops-blog)
- Feeds: `/blog/rss.xml`, `/blog/atom.xml`, and the German ones under
  `/de/blog/`
- Security contact: [`/.well-known/security.txt`](pathname:///.well-known/security.txt)
