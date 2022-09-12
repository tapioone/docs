const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
darkCodeTheme.plain.backgroundColor = "#333333";

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'tapio Developer Documentation',
  tagline: 'digital. wood. works.',
  url: 'https://developer.tapio.one',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'tapioone', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.
  themeConfig: {
    colorMode: {
      defaultMode: 'dark'
    },
    navbar: {
      title: 'DevPortal',
      logo: {
        alt: 'tapio Logo',
        src: 'img/logo_light.svg',
        srcDark: 'img/logo_dark.svg'
      },
      items: [
        {
          type: 'doc',
          docId: 'index',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://www.tapio.one/en/blog',
          label: 'Blog',
          position: 'right'
        },
        {
          href: 'https://www.tapio.one',
          label: 'Homepage',
          position: 'right'
        },
        {
          href: 'https://github.com/tapioone',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Links',
          items: [
            {
              label: 'Docs',
              to: '/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Facebook',
              href: 'https://www.facebook.com/tapio.Deutschland',
            },
            {
              label: 'YouTube',
              href: 'https://www.youtube.com/channel/UCuWvcOhs358LxhUSeRipZtg',
            },
            {
              label: 'Instagram',
              href: 'https://www.instagram.com/woodisdigital/',
            },
            {
              label: 'LinkedIn',
              href: 'https://de.linkedin.com/company/tapio-gmbh',
            },
          ],
        },
        {
          title: 'Legal',
          items: [
            {
              label: 'Terms of Use',
              href: 'https://www.tapio.one/en/tapio-terms-of-use'
            },
            {
              label: 'Data Privacy Agreement',
              href: 'https://www.tapio.one/en/tapio-data-privacy-agreement'
            },
            {
              label: 'Privacy Policy',
              href: 'https://www.tapio.one/en/policy'
            },
            {
              label: 'Legal Notice',
              href: 'https://www.tapio.one/en/imprint'
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} tapio GmbH.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ['csharp', 'xml-doc']
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/tapioone/docs/edit/master/',
          showLastUpdateTime: true,
          routeBasePath: '/',
          docLayoutComponent: "@theme/DocPage",
          docItemComponent: "@theme/ApiItem"
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["en"],
        indexBlog: false,
        docsRouteBasePath: '/',
      },
    ],
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: "apiDocsGds",
        docsPluginId: "classic",
        config: {
          gds: {
            specPath: "openapi/gds.json",
            outputDir: "docs/api/gds",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag"
            }
          },
        },
      }
    ],
  ],
  themes: ["docusaurus-theme-openapi-docs"]
};
