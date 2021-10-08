const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'Wiki',
  tagline: 'Dinosaurs are cool',
  url: 'http://localhost:3000/',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.
  customFields: { graph: path.resolve(__dirname, '.docusaurus/cy.json'), },
  plugins: [require.resolve('docusaurus-lunr-search'), 'docusaurus-plugin-relative-paths', path.resolve(__dirname, 'plugins', 'docusaurus-plugin-logesh')],
  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          remarkPlugins: [
            require('mdx-mermaid'),
            [require('remark-wiki-link'),
            {
              pageResolver: (pageName) => {
                const slug = pageName.replace(/ /g, '-').toLowerCase(); // use this if your files are sluggified
                const walkSync = require("walk-sync");
                let paths = walkSync("docs/", { globs: ["**/" + slug + ".md*"] });
                paths = paths.map(path => path.replace(".mdx", ""));
                paths = paths.map(path => path.replace(".md", ""));
                // paths = paths.map(path => path.replace(" ", "%20")); // taken care automatically
                return paths;
              },
              hrefTemplate: (permalink) => { return `/docs/${permalink}`; },
            }
            ],
            require('remark-capitalize'),
            require('remark-backlinks'),
          ],
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // editUrl: 'file:///C:/Users/gol2cob/Documents/Wiki',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],

  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Wiki',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Tutorial',
          },
          {
            href: 'graph',
            label: 'Graph',
            position: 'left',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          // {
          //   href: 'https://github.com/facebook/docusaurus',
          //   label: 'GitHub',
          //   position: 'right',
          // },
        ],
      },
      // footer: {
      //   style: 'dark',
      //   links: [
      //     {
      //       title: 'Docs',
      //       items: [
      //         {
      //           label: 'Tutorial',
      //           to: '/docs/intro',
      //         },
      //       ],
      //     },
      //     {
      //       title: 'Community',
      //       items: [
      //         {
      //           label: 'Stack Overflow',
      //           href: 'https://stackoverflow.com/questions/tagged/docusaurus',
      //         },
      //         // {
      //         //   label: 'Discord',
      //         //   href: 'https://discordapp.com/invite/docusaurus',
      //         // },
      //         // {
      //         //   label: 'Twitter',
      //         //   href: 'https://twitter.com/docusaurus',
      //         // },
      //       ],
      //     },
      //     {
      //       title: 'More',
      //       items: [
      //         {
      //           label: 'Blog',
      //           to: '/blog',
      //         },
      //         {
      //           label: 'GitHub',
      //           href: 'https://github.com/facebook/docusaurus',
      //         },
      //       ],
      //     },
      //   ],
      //   copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      // },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
});
