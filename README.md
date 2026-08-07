# Pascal Nehlsen — Portfolio, Blog & Knowledge Base

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
   production.

## Tech Stack

- **Framework:** Docusaurus 3 (React 18, MDX)
- **Language:** TypeScript (config) + JavaScript (pages/components)
- **Styling:** Infima, driven entirely from a token layer
  (`src/css/tokens.css`) — slate + signal green, dark default, both themes
  designed rather than inverted
- **Fonts:** JetBrains Mono + IBM Plex Sans, self-hosted from `static/fonts/`
- **Search:** `@easyops-cn/docusaurus-search-local` — offline lunr index, no
  third-party request
- **Hosting:** GitHub Pages (custom domain via `CNAME`)
- **CI/CD:** GitHub Actions (`.github/`)

> This is a **static site**. There is no database, backend server or auth layer —
> earlier README versions describing `DATABASE_URL` / `JWT_SECRET` were inaccurate.

## Prerequisites

- Node.js **24+** (see `engines` in `package.json`; CI uses 24)
- npm — `package-lock.json` is the only lockfile, and CI runs `npm ci`
- Git

## Quickstart

```bash
# Clone
git clone git@github.com:PascalNehlsen/devsecops-blog.git
cd devsecops-blog

# Install
npm install

# Start dev server (http://localhost:3000)
npm start
```

Other scripts:

```bash
npm run build       # Production build into build/
npm run serve       # Serve the production build locally
npm run typecheck   # tsc — type-check the config
npm run clear       # Clear the Docusaurus cache
npm run og          # Regenerate Open Graph cards into static/img/og/
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

The homepage is **data-driven** — you rarely touch layout code:

- **`src/data/projects.js`** — every project card. Fields: `title`, `description`,
  `category` (`work` \| `product` \| `recent`), `featured`, `impact`, `tags[]`,
  `liveUrl`, `githubUrl`, `docsUrl`. Omit `githubUrl` for private repos.
- **`src/data/homepage.js`** — `stats`, `skillGroups`, `latestPosts`.

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

- `DEPLOYMENT_URL` — full site URL (defaults to the GitHub Pages URL)
- `BASE_URL` — base path (`/` for the custom domain, `/devsecops-blog/` on `*.github.io`)
- `GITHUB_ORG`, `GITHUB_PROJECT`, `DEPLOYMENT_BRANCH`

## Deployment

Deployed to **GitHub Pages** via GitHub Actions on push to `main`. Manual deploy:

```bash
GIT_USER=PascalNehlsen npm run deploy
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the local workflow, content conventions
and the pre-merge checklist (`npm run build` must pass — `onBrokenLinks` is set to
`throw`).
