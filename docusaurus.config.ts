import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const blogEnabled = true;

const DEPLOYMENT_URL =
  process.env.DEPLOYMENT_URL ||
  'https://pascalnehlsen.github.io/';
const BASE_URL = process.env.BASE_URL || '/';
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
  title: 'Social',
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
    label: 'Blog',
    href: '/blog',
  });
}

const config: Config = {
  title: 'Pascal Nehlsen',
  tagline: 'DevSecOps Fullstack Developer',
  favicon: '/img/favicon.ico',

  url: DEPLOYMENT_URL,
  baseUrl: BASE_URL,

  organizationName: GITHUB_ORG,
  projectName: GITHUB_PROJECT,

  deploymentBranch: DEPLOYMENT_BRANCH,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

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
              feedOptions: {
                type: ['rss', 'atom'],
                xslt: true,
              },
              authorsMapPath: 'authors.yml',
            }
          : false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      logo: {
        alt: 'My Site Logo',
        src: 'img/favicon.ico',
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
      style: 'dark',
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
            {
              label: 'Docusaurus Guides',
              to: '/docs/docusaurus/intro',
            },
          ],
        },

        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'Stack Overflow',
        //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
        //     },
        //     {
        //       label: 'Docusaurus Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //     {
        //       label: 'Docusaurus Twitter',
        //       href: 'https://twitter.com/docusaurus',
        //     },
        //   ],
        // },
        moreColumn,
        // {
        //   title: 'More',
        //   items: [
        //     {
        //       label: 'GitHub',
        //       href: 'https://github.com/facebook/docusaurus',
        //     },
        //     blogEnabled && {
        //       label: 'Blog',
        //       to: '/blog',
        //     },
        //   ],
        // },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Pascal Nehlsen, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['powershell', 'hcl'],
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
