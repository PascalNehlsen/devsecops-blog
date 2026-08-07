import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const blogEnabled = true;

// The canonical origin. This must stay in sync with three other things:
//   - the CNAME file in this repo (what GitHub Pages actually serves)
//   - the DEPLOYMENT_URL repository secret, which overrides this default in CI
//   - the DNS records for the domain
// Getting it wrong is not cosmetic: every canonical URL and the whole sitemap
// are generated from it.
const CANONICAL_URL = 'https://pascal-nehlsen.de';

let DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || CANONICAL_URL;
let BASE_URL = process.env.BASE_URL || '/';

// Ensure URL has protocol
if (!/^https?:\/\//i.test(DEPLOYMENT_URL)) {
  DEPLOYMENT_URL = CANONICAL_URL;
}
// Normalize baseUrl shape
if (!BASE_URL.startsWith('/')) {
  BASE_URL = `/${BASE_URL}`;
}
if (!BASE_URL.endsWith('/')) {
  BASE_URL = `${BASE_URL}/`;
}
// If using a custom domain (not *.github.io), force baseUrl to '/'
try {
  const u = new URL(DEPLOYMENT_URL);
  const isGithubPages = /github\.io$/i.test(
    u.hostname
  );
  if (!isGithubPages) {
    BASE_URL = '/';
  }
} catch {}

const GITHUB_ORG =
  process.env.GITHUB_ORG ||
  process.env.ORG ||
  'PascalNehlsen';
const GITHUB_PROJECT =
  process.env.GITHUB_PROJECT ||
  process.env.PROJECT ||
  'devsecops-blog';
const DEPLOYMENT_BRANCH =
  process.env.DEPLOYMENT_BRANCH || 'main';

const moreColumn = {
  title: 'Elsewhere',
  items: [
    {
      label: 'GitHub',
      href: `https://github.com/${GITHUB_ORG}/`,
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/pascal-nehlsen',
    },
  ],
};
if (blogEnabled) {
  moreColumn.items.push({
    label: 'RSS',
    // pathname:// — the feed is a generated asset, not a route, so the
    // broken-link checker must not try to resolve it.
    href: 'pathname:///blog/rss.xml',
  });
}

const config: Config = {
  title: 'Pascal Nehlsen',
  tagline: 'Platform & Security Engineering',
  favicon: 'img/favicon.svg',

  url: DEPLOYMENT_URL,
  baseUrl: BASE_URL,
  trailingSlash: false,

  organizationName: GITHUB_ORG,
  projectName: GITHUB_PROJECT,

  deploymentBranch: DEPLOYMENT_BRANCH,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  clientModules: ['./src/clientModules/console-notice.js'],

  // Only the two faces that block first paint: Plex 400 is every paragraph,
  // JetBrains Mono 700 is every h1/h2 above the fold. Preloading more would
  // delay these. crossorigin is required on font preloads even same-origin,
  // otherwise the browser fetches twice.
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: '/fonts/ibm-plex-sans-latin-400-normal.woff2',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: '/fonts/jetbrains-mono-latin-700-normal.woff2',
        crossorigin: 'anonymous',
      },
    },
  ],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    // Feeds the homepage's "Latest Writing" section from real blog data
    // instead of a hand-maintained copy in src/data/homepage.js.
    [require.resolve('./plugins/latest-posts'), { count: 3 }],

    [
      '@docusaurus/plugin-client-redirects',
      {
        // Every `to` below is validated at build time, so this table cannot
        // silently rot. Two groups:
        //
        //  1. Slug flattening. Half the corpus already used flat slugs; the
        //     newer half used dated permalinks, which visibly age a post in
        //     search results. Now all flat.
        //  2. Removed posts. Seven were deleted because they were thin or
        //     content-free — see the commit that removed them. Their URLs
        //     were live and indexed, so they redirect rather than 404.
        redirects: [
          {
            from: '/blog/2026/01/20/terraform-golden-paths-gcp',
            to: '/blog/terraform-golden-paths-gcp',
          },
          {
            from: '/blog/2026/02/18/agentic-runbooks-mcp-human-approval',
            to: '/blog/agentic-runbooks-mcp-human-approval',
          },
          {
            from: '/blog/2026/03/24/slo-driven-automated-rollback',
            to: '/blog/slo-driven-automated-rollback',
          },
          {
            from: '/blog/2026/04/28/ephemeral-aws-sandboxes-cost',
            to: '/blog/ephemeral-aws-sandboxes-cost',
          },

          // Removed posts.
          { from: '/blog/starting-devsecops-journey', to: '/blog' },
          {
            from: '/blog/implementing-sast-pipeline',
            to: '/docs/knowledge-base/Container/first-image',
          },
          {
            from: '/blog/docker-security-best-practices',
            to: '/docs/knowledge-base/Container/first-image',
          },
          {
            from: '/blog/2025/09/15/integrating-ai-chatbots',
            to: '/docs/projects/chatbot',
          },
          {
            from: '/blog/2025/10/01/security-chatbot-platforms',
            to: '/docs/projects/chatbot',
          },
          {
            from: '/blog/2025/11/01/scalable-appointment-booking',
            to: '/docs/projects/chatbot',
          },
          {
            from: '/blog/2025/10/15/healthcare-saas-devsecops',
            to: '/docs/projects/hepa-assist',
          },
        ],
      },
    ],
  ],

  // A theme, not a plugin — the usual mistake with this package.
  //
  // Chosen over Algolia DocSearch: DocSearch needs an application, an
  // approval, and an externally scheduled crawler that breaks when the crawl
  // config drifts. For six posts and ~25 docs the lunr index is tiny, works
  // offline, and — the reason that matters here — makes no third-party
  // request, which is what keeps the CSP at script-src 'self'.
  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        docsRouteBasePath: '/docs',
        blogRouteBasePath: '/blog',
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 60,
        explicitSearchResultPath: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: blogEnabled
          ? {
              showReadingTime: true,
              postsPerPage: 10,
              blogSidebarCount: 'ALL',
              blogSidebarTitle: 'All Posts',
              onUntruncatedBlogPosts: 'throw',
              // A typo can no longer mint a new tag page — see blog/tags.yml.
              onInlineTags: 'throw',
              tags: 'tags.yml',
              feedOptions: {
                type: ['rss', 'atom'],
                xslt: true,
                title: 'Pascal Nehlsen — Writing',
                description:
                  'Build notes on platform and security engineering.',
                language: 'en',
                copyright: `© ${new Date().getFullYear()} Pascal Nehlsen`,
                limit: false,
              },
              authorsMapPath: 'authors.yml',
            }
          : false,
        theme: {
          // An array, not @import: injection order is deterministic, the
          // diffs stay separate, and @font-face is guaranteed to be parsed
          // before anything references a font-family.
          customCss: [
            './src/css/fonts.css',
            './src/css/tokens.css',
            './src/css/custom.css',
          ],
        },
        sitemap: {
          lastmod: 'date',
          // Google ignores changefreq, and a uniform priority conveys nothing.
          changefreq: null,
          priority: null,
          ignorePatterns: [
            '/blog/tags/**',
            '/blog/archive',
            '/blog/authors/**',
            '/blog/page/**',
            '/search',
            '/docs/category/**',
          ],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    image: 'img/og/default.png',
    metadata: [
      { name: 'author', content: 'Pascal Nehlsen' },
      {
        name: 'keywords',
        content:
          'platform engineering, devsecops, terraform, gcp, aws, ci/cd, observability, site reliability',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    navbar: {
      logo: {
        alt: 'Pascal Nehlsen',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: 'blog',
          label: 'Blog',
          position: 'left',
        },
        {
          href: 'https://github.com/PascalNehlsen/',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      // 'light' lets the footer follow the theme tokens. 'dark' makes Infima
      // hardcode its own dark palette and ignore --ifm-footer-*.
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Projects',
              to: '/docs/projects/intro',
            },
            {
              label: 'Knowledge Base',
              to: '/docs/knowledge-base/intro',
            },
          ],
        },
        moreColumn,
        {
          title: 'Legal',
          items: [
            { label: 'Impressum', to: '/impressum' },
            { label: 'Datenschutz', to: '/datenschutz' },
            {
              label: 'security.txt',
              href: 'pathname:///.well-known/security.txt',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Pascal Nehlsen`,
    },
    prism: {
      // dracula (#282A36, purple/pink) clashes hard with the slate palette —
      // it was the main reason code blocks looked like a different site.
      // nightOwl's #011627 sits two luminance steps from --c-bg and its
      // accents are green/teal. nightOwlLight shares the same token→role map,
      // so both themes highlight the same things the same way.
      // Failing tokens in both are repaired in custom.css.
      theme: prismThemes.nightOwlLight,
      darkTheme: prismThemes.nightOwl,
      additionalLanguages: [
        'powershell',
        'hcl',
        'bash',
        'yaml',
        'docker',
        'json',
        'ini',
        'nginx',
        'diff',
      ],
      magicComments: [
        // Remember to extend the default highlight class name as well!
        {
          className:
            'theme-code-block-highlighted-line',
          line: 'highlight-next-line',
          block: {
            start: 'highlight-start',
            end: 'highlight-end',
          },
        },
        {
          className: 'code-block-error-line',
          line: 'This will error',
        },
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
