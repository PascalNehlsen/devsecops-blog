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

// Docusaurus builds one locale per pass and exports the locale it is currently
// building. Anything that must differ per language but is not a translatable
// string, such as the feed language or an asset path, is derived from these
// two constants rather than duplicated across two config files.
const LOCALE = process.env.DOCUSAURUS_CURRENT_LOCALE || 'en';
// Route paths carry baseUrl, and in a non-default locale baseUrl is '/de/'.
// Any config option matched against a route path therefore needs this prefix;
// see the sitemap ignorePatterns below for the case where forgetting it is
// silent.
const ROUTE_PREFIX = LOCALE === 'en' ? '' : `/${LOCALE}`;

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
    // pathname:// is required here: the feed is a generated asset, not a
    // route, and the broken-link checker cannot resolve it. It also bypasses
    // baseUrl, which is why the locale prefix has to be added by hand:
    // otherwise the German footer advertises the English feed while
    // /de/blog/rss.xml sits in the build unlinked.
    href: `pathname://${ROUTE_PREFIX}/blog/rss.xml`,
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

  clientModules: [
    './src/clientModules/console-notice.js',
    // Applies the persisted data-design before hydration; see the module's
    // header for why this cannot be an inline script (script-src 'self').
    './src/clientModules/design-init.js',
  ],

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

  // English stays the default locale, so every URL that was ever indexed keeps
  // working and no redirect table is needed for the switch. German lives under
  // /de/. Untranslated files fall back to the English original silently, which
  // is what makes it possible to ship the translation in stages.
  //
  // The German pages are not a nicety: § 5 DDG and Art. 13 GDPR address a
  // German audience, and the binding version of a legal notice is the German
  // one. See src/pages/impressum.md.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    localeConfigs: {
      en: { label: 'English', htmlLang: 'en' },
      de: { label: 'Deutsch', htmlLang: 'de-DE' },
    },
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
        //     content-free; see the commit that removed them. Their URLs
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
          {
            from: '/blog/secrets-management-done-right',
            to: '/docs/knowledge-base/env-vars/',
          },
        ],
      },
    ],
  ],

  // A theme, not a plugin. That is the usual mistake with this package.
  //
  // Chosen over Algolia DocSearch: DocSearch needs an application, an
  // approval, and an externally scheduled crawler that breaks when the crawl
  // config drifts. For six posts and ~25 docs the lunr index is tiny, works
  // offline and, which is the reason that matters here, makes no third-party
  // request, which is what keeps the CSP at script-src 'self'.
  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        // These two are matched against the route with baseUrl already
        // stripped (processDocInfos.js), so unlike the sitemap patterns below
        // they need no locale prefix.
        docsRouteBasePath: '/docs',
        blogRouteBasePath: '/blog',
        // One stemmer per build, not both. Each locale build indexes only its
        // own content, so listing two languages would make the plugin load
        // lunr.multiLanguage and hand the English index a German stemmer and
        // German stop words it never needs. Multi-language stemming is
        // measurably less precise than a single one.
        language: [LOCALE],
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
              // A typo can no longer mint a new tag page; see blog/tags.yml.
              onInlineTags: 'throw',
              tags: 'tags.yml',
              // Feed metadata is not translatable through the i18n JSON
              // files, so it comes from the locale being built. A German
              // subscriber gets the German posts with <language>de</language>,
              // not an English feed under a German URL.
              feedOptions: {
                type: ['rss', 'atom'],
                xslt: true,
                title:
                  LOCALE === 'de'
                    ? 'Pascal Nehlsen, Beiträge'
                    : 'Pascal Nehlsen, Writing',
                description:
                  LOCALE === 'de'
                    ? 'Notizen aus der Arbeit an Platform- und Security-Engineering.'
                    : 'Build notes on platform and security engineering.',
                language: LOCALE,
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
            // Last on purpose: the design variants (D shortcut) must win
            // ties against the base token blocks on source order.
            './src/css/designs.css',
          ],
        },
        sitemap: {
          lastmod: 'date',
          // Google ignores changefreq, and a uniform priority conveys nothing.
          changefreq: null,
          priority: null,
          // Matched against the full route path, which carries baseUrl. In the
          // German build that is '/de/', so a bare '/blog/tags/**' silently
          // misses '/de/blog/tags/terraform' and every excluded page would
          // reappear in the sitemap for half the site. Hence ROUTE_PREFIX.
          ignorePatterns: [
            `${ROUTE_PREFIX}/blog/tags/**`,
            `${ROUTE_PREFIX}/blog/archive`,
            `${ROUTE_PREFIX}/blog/authors/**`,
            `${ROUTE_PREFIX}/blog/page/**`,
            `${ROUTE_PREFIX}/search`,
            `${ROUTE_PREFIX}/docs/category/**`,
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
    // Docs carry no per-page `image`, so this default card is what most pages
    // share. The German one exists because the card renders the title.
    image: LOCALE === 'de' ? 'img/og/de/default.png' : 'img/og/default.png',
    metadata: [
      { name: 'author', content: 'Pascal Nehlsen' },
      {
        name: 'keywords',
        content:
          LOCALE === 'de'
            ? 'platform engineering, devsecops, terraform, gcp, aws, ci/cd, observability, plattform-engineering, cloud-sicherheit, automatisierung'
            : 'platform engineering, devsecops, terraform, gcp, aws, ci/cd, observability, site reliability',
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
        // Left of GitHub, so the outbound link stays the rightmost item.
        {
          type: 'localeDropdown',
          position: 'right',
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
            // The routes keep their German names because they were already
            // linked and indexed under them. The labels follow the locale:
            // these strings are translated back in i18n/de/.../footer.json.
            { label: 'Legal Notice', to: '/impressum' },
            { label: 'Privacy', to: '/datenschutz' },
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
      // dracula (#282A36, purple/pink) clashes hard with the slate palette:
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
