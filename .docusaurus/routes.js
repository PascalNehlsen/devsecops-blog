import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/devsecops-blog/markdown-page',
    component: ComponentCreator('/devsecops-blog/markdown-page', 'ac9'),
    exact: true
  },
  {
    path: '/devsecops-blog/docs',
    component: ComponentCreator('/devsecops-blog/docs', '525'),
    routes: [
      {
        path: '/devsecops-blog/docs',
        component: ComponentCreator('/devsecops-blog/docs', 'dfe'),
        routes: [
          {
            path: '/devsecops-blog/docs',
            component: ComponentCreator('/devsecops-blog/docs', 'f9f'),
            routes: [
              {
                path: '/devsecops-blog/docs/category/docusaurus---basics',
                component: ComponentCreator('/devsecops-blog/docs/category/docusaurus---basics', '9e1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/category/docusaurus---extras',
                component: ComponentCreator('/devsecops-blog/docs/category/docusaurus---extras', 'ac2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/category/git',
                component: ComponentCreator('/devsecops-blog/docs/category/git', 'df1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/docusaurus/docusaurus-basics/congratulations',
                component: ComponentCreator('/devsecops-blog/docs/docusaurus/docusaurus-basics/congratulations', 'daf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/docusaurus/docusaurus-basics/create-a-blog-post',
                component: ComponentCreator('/devsecops-blog/docs/docusaurus/docusaurus-basics/create-a-blog-post', '599'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/docusaurus/docusaurus-basics/create-a-document',
                component: ComponentCreator('/devsecops-blog/docs/docusaurus/docusaurus-basics/create-a-document', '318'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/docusaurus/docusaurus-basics/create-a-page',
                component: ComponentCreator('/devsecops-blog/docs/docusaurus/docusaurus-basics/create-a-page', '31a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/docusaurus/docusaurus-basics/deploy-your-site',
                component: ComponentCreator('/devsecops-blog/docs/docusaurus/docusaurus-basics/deploy-your-site', '453'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/docusaurus/docusaurus-basics/markdown-features',
                component: ComponentCreator('/devsecops-blog/docs/docusaurus/docusaurus-basics/markdown-features', '434'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/docusaurus/intro',
                component: ComponentCreator('/devsecops-blog/docs/docusaurus/intro', '6bd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/docusaurus/tutorial-extras/manage-docs-versions',
                component: ComponentCreator('/devsecops-blog/docs/docusaurus/tutorial-extras/manage-docs-versions', 'ecc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/docusaurus/tutorial-extras/translate-your-site',
                component: ComponentCreator('/devsecops-blog/docs/docusaurus/tutorial-extras/translate-your-site', '176'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/knowledge-base/Container/overview',
                component: ComponentCreator('/devsecops-blog/docs/knowledge-base/Container/overview', '5c8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/knowledge-base/DevOps/overview',
                component: ComponentCreator('/devsecops-blog/docs/knowledge-base/DevOps/overview', '26c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/knowledge-base/git/branches',
                component: ComponentCreator('/devsecops-blog/docs/knowledge-base/git/branches', '921'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/knowledge-base/git/lifecycle-in-git',
                component: ComponentCreator('/devsecops-blog/docs/knowledge-base/git/lifecycle-in-git', 'c43'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/knowledge-base/git/pr',
                component: ComponentCreator('/devsecops-blog/docs/knowledge-base/git/pr', '298'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/knowledge-base/intro',
                component: ComponentCreator('/devsecops-blog/docs/knowledge-base/intro', '237'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/knowledge-base/linux/overview',
                component: ComponentCreator('/devsecops-blog/docs/knowledge-base/linux/overview', '3b5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/projects/baby-tools-shop/overview',
                component: ComponentCreator('/devsecops-blog/docs/projects/baby-tools-shop/overview', 'b55'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/projects/intro',
                component: ComponentCreator('/devsecops-blog/docs/projects/intro', 'e99'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/projects/python-tools/hashcat/overview',
                component: ComponentCreator('/devsecops-blog/docs/projects/python-tools/hashcat/overview', '093'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/projects/python-tools/hydra/overview',
                component: ComponentCreator('/devsecops-blog/docs/projects/python-tools/hydra/overview', 'fc1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/projects/python-tools/overview',
                component: ComponentCreator('/devsecops-blog/docs/projects/python-tools/overview', 'fcc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/devsecops-blog/docs/projects/vm-setup/overview',
                component: ComponentCreator('/devsecops-blog/docs/projects/vm-setup/overview', '96c'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/devsecops-blog/',
    component: ComponentCreator('/devsecops-blog/', '441'),
    exact: true
  },
  {
    path: '/devsecops-blog/',
    component: ComponentCreator('/devsecops-blog/', 'e6e'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
