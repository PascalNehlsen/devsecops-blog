import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

/* TODO: change to read configuration from environment */
const blogEnabled = false;

const moreColumn = {
  title: 'More',
  items: [
    {
      label: 'GitHub',
      href: 'https://github.com/PascalNehlsen/',
    },
    {
      label: 'Portfolio',
      href: 'https://pascal-nehlsen.de/',
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
  tagline: 'DevSecOps/ Frontend Developer',
  favicon: '/img/favicon.ico',

  // Set the production url of your site here
  url: 'https://pascalnehlsen.github.io/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/devsecops-blog/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'PascalNehlsen', // Usually your GitHub org/user name.
  projectName: 'devsecops-blog', // Usually your repo name.

  deploymentBranch: 'main',

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
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          //editUrl:
          //  'https://github.com/PascalNehlsen/devsecops-blog',
        },
        blog: blogEnabled
          ? {
              showReadingTime: true,
              feedOptions: {
                type: ['rss', 'atom'],
                xslt: true,
              },
              // Please change this to your repo.
              // Remove this to remove the "edit this page" links.
              // editUrl:
              //  'https://github.com/PascalNehlsen/devsecops-blog',
              // Useful options to enforce blogging best practices
              //onInlineTags: 'warn',
              //onInlineAuthors: 'warn',
              //onUntruncatedBlogPosts: 'warn',
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
          label: 'DevSecOps Docs',
        },
        // {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/PascalNehlsen/',
          label: 'Github',
          position: 'right',
        },
        {
          href: 'https://pascal-nehlsen.de/',
          label: 'Portfolio',
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

        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Docusaurus Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Docusaurus Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        },
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
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
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
