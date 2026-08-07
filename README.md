# Pascal Nehlsen · Portfolio, Blog & Knowledge Base

A [Docusaurus](https://docusaurus.io/) site that serves as my portfolio, DevSecOps
knowledge base, and technical blog. It showcases my work as a DevSecOps / Platform
Engineer and my own products, and is deployed to GitHub Pages behind a custom domain.

**Live:** https://pascal-nehlsen.de/

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Project Structure](#project-structure)
- [Content](#content)
- [Homepage Data](#homepage-data)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Ground rules

Three constraints this site is built to hold. They are checkable, which is
the point:

1. **No third-party requests.** No font CDN, no analytics, no hosted search,
   no embedded widgets, no hotlinked avatar. Open the network tab: every
   request goes to this origin. This is what allows a `script-src 'self'` CSP
   with no exceptions.
2. **Nothing on the page that isn't true.** Metrics link to the write-up that
   documents them. Exercises are labelled as exercises. Gaps are stated.
3. **Every check that can block, blocks.** `onBrokenLinks`, `onBrokenAnchors`,
   `onBrokenMarkdownLinks`, `onInlineTags` and `onUntruncatedBlogPosts` are all
   `throw`. A broken internal link fails the build rather than reaching
   production. The dependency gate fails on high and above, and its exceptions
   carry an expiry date so an accepted risk gets re-decided rather than
   inherited.

## Why pnpm

Not for the install speed. Two reasons that matter here:

- **A strict module tree.** npm hoists everything into a flat
  `node_modules`, so code can import packages the manifest never declared.
  This repository had exactly that: it used `@types/react` without depending
  on it, and only noticed when pnpm refused to resolve it. Undeclared
  dependencies are the ones nobody audits.
- **Install scripts are blocked by default.** A `postinstall` hook runs
  arbitrary code on every machine that installs, including CI. pnpm requires
  each one to be approved explicitly; npm runs them all.

## Tech Stack

- **Framework:** Docusaurus 3 (React 18, MDX)
- **Language:** TypeScript (config) + JavaScript (pages/components)
- **Styling:** Infima, driven entirely from a token layer
  (`src/css/tokens.css`): slate + signal green, dark default, both themes
  designed rather than inverted
- **Fonts:** JetBrains Mono + IBM Plex Sans, self-hosted from `static/fonts/`
- **Search:** `@easyops-cn/docusaurus-search-local`, an offline lunr index with no
  third-party request
- **Hosting:** GitHub Pages (custom domain via `CNAME`)
- **CI/CD:** GitHub Actions (`.github/`)

> This is a **static site**. There is no database, backend server or auth layer;
> earlier README versions describing `DATABASE_URL` / `JWT_SECRET` were inaccurate.

## Prerequisites

- Node.js **24+** (see `engines` in `package.json`; CI uses 24)
- pnpm, pinned in `package.json` via `packageManager`. `corepack enable` will
  fetch the right version; CI runs `pnpm install --frozen-lockfile`, which
  fails rather than silently resolving something different from local
- Git

## Quickstart

```bash
# Clone
git clone git@github.com:PascalNehlsen/devsecops-blog.git
cd devsecops-blog

# Install
pnpm install

# Start dev server (http://localhost:3000)
pnpm start
```

Other scripts:

```bash
pnpm run build                # Production build into build/
pnpm run serve                # Serve the production build locally
pnpm run typecheck            # tsc, type-check the config
pnpm run clear                # Clear the Docusaurus cache
pnpm run og                   # Regenerate Open Graph cards into static/img/og/
pnpm run audit                # Dependency gate: high and above, exceptions expire
pnpm run check:no-third-party # Fails if the build references an external host
```

## Project Structure

```
.
├── blog/                     # Blog posts (Markdown, date-prefixed) + authors.yml
├── docs/                     # Docs: projects/ and knowledge-base/
│   ├── projects/             # Portfolio project write-ups
│   └── knowledge-base/       # DevSecOps concepts, Git, Docker, DevOps…
├── src/
│   ├── components/
│   │   ├── homepage/         # Homepage sections (see below)
│   │   ├── GithubLinkAdmonition/
│   │   └── GitHubWorkFlowScripts/
│   ├── data/                 # Homepage content data (edit these, not layout)
│   │   ├── projects.js       # Central project registry
│   │   └── homepage.js       # Stats, skill groups, latest posts
│   ├── css/custom.css        # Global theme
│   └── pages/index.js        # Homepage
├── docusaurus.config.ts      # Site config (URL, navbar, footer, theme)
├── sidebars.ts               # Docs sidebar
└── CNAME                     # Custom domain
```

## Content

| What | Where | How |
|------|-------|-----|
| Blog post | `blog/YYYY-MM-DD-slug.md` | Frontmatter: `title`, `date`, `authors: pascal`, `description`, `tags`. Slug = filename after the date. |
| Project doc | `docs/projects/**` | Markdown; categories via `_category_.yaml`. |
| Knowledge article | `docs/knowledge-base/**` | Markdown; grouped by topic folders. |

## Homepage Data

The homepage is **data-driven**, so you rarely touch layout code:

- **`src/data/projects.js`**: every project card. Fields: `title`, `description`,
  `category` (`work` \| `product` \| `recent`), `featured`, `impact`, `tags[]`,
  `liveUrl`, `githubUrl`, `docsUrl`. Omit `githubUrl` for private repos.
- **`src/data/homepage.js`**: `stats` and `skillGroups`.

Homepage sections live in `src/components/homepage/`:

| Component | Purpose |
|-----------|---------|
| `SectionHeader` | Eyebrow + gradient title + subtitle |
| `StatsBar` | Animated count-up KPI row (respects reduced-motion) |
| `ProjectCard` | Single project card (title, impact pill, tags, links) |
| `Skills` | Grouped tech-stack badge grid |
| `BlogPreview` | Latest blog post cards |

All share `src/components/homepage/styles.module.css`.

## Configuration

Deployment is parameterised via env vars (see `example.env`), consumed in
`docusaurus.config.ts`:

- `DEPLOYMENT_URL`: full site URL (defaults to the GitHub Pages URL)
- `BASE_URL`: base path (`/` for the custom domain, `/devsecops-blog/` on `*.github.io`)
- `GITHUB_ORG`, `GITHUB_PROJECT`, `DEPLOYMENT_BRANCH`

## Deployment

Deployed to **GitHub Pages** via GitHub Actions on push to `main`. Manual deploy:

```bash
GIT_USER=PascalNehlsen pnpm run deploy
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the local workflow, content conventions
and the pre-merge checklist (`pnpm run build` must pass; `onBrokenLinks` is set to
`throw`).
