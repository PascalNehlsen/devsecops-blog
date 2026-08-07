# Contributing

This repo powers [pascal-nehlsen.de](https://pascal-nehlsen.de/). It is a
personal portfolio, but the workflow is documented here so contributions (and future
me) stay consistent.

## Local workflow

```bash
npm install
npm start          # dev server with hot reload at http://localhost:3000
```

Before opening a PR:

```bash
npm run build      # MUST pass. onBrokenLinks is "throw"
npm run typecheck  # tsc
```

A green `npm run build` is the hard gate: it fails on any broken internal link.

## Branching & commits

- Branch off `main` (e.g. `feature/…`, `fix/…`, `content/…`).
- Commit style: [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`).
- Open a PR into `main`; the GitHub Actions workflow builds and deploys on merge.

## Adding a project

Edit **`src/data/projects.js`**. Do not hand-edit the homepage layout.

```js
{
  title: 'My New Project',
  category: 'product',        // 'work' | 'product' | 'recent'
  featured: true,             // show in the top "Featured Work" grid
  description: 'One or two crisp sentences.',
  impact: 'Live in production',   // optional pill, keep it short
  tags: ['Next.js', 'GCP'],
  liveUrl: 'https://…',       // optional
  githubUrl: 'https://…',     // OMIT for private repos
  docsUrl: '/docs/projects/…' // optional; must resolve or the build fails
},
```

For a full write-up, also add a page under `docs/projects/` (or
`docs/projects/recent/`) and point `docsUrl` at it.

## Adding a blog post

Create `blog/YYYY-MM-DD-my-slug.md`:

```md
---
title: "My Post Title"
date: "2026-01-15"
authors: pascal
description: "One-sentence summary used in previews and meta tags."
tags: ["DevSecOps", "Security"]
---

Post body…
```

The URL becomes `/blog/my-slug`. To surface it on the homepage, add an entry to
`latestPosts` in `src/data/homepage.js`.

## Adding a knowledge-base article

Add Markdown under `docs/knowledge-base/<topic>/`. Use `_category_.yaml` to control
the sidebar label/position for a new topic folder.

## Styling conventions

- Global theme + CSS variables: `src/css/custom.css`.
- Homepage section styles: `src/components/homepage/styles.module.css`.
- Stick to the existing CSS custom properties (`--ifm-color-primary`, emphasis
  scale, etc.) so light/dark modes stay consistent.
- Honour `prefers-reduced-motion` for any new animation.

## Checklist before merge

- [ ] `npm run build` passes (no broken links)
- [ ] `npm run typecheck` passes
- [ ] Light **and** dark mode look correct
- [ ] New links resolve; external links open the right target
- [ ] Content proofread
