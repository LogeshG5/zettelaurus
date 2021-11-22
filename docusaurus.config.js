const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const path = require("path");

/**
 * directory where to find the md files
 */
const docsDir = "docs";

/**
 * Wiki might be under a subdirectory and the file name might be sluggified
 * Enable remark-wiki-link plugin to find such md files
 * 
 * @param {string} wikilink The text between [[]] in an md file
 * Returns list of paths to help resolve a [[wiki link]]
 */
function wikilinkToUrl(wikilink) {
  const slug = wikilink.replace(/ /g, "-").toLowerCase();
  const walkSync = require("walk-sync");
  let paths = walkSync(docsDir, {
    globs: ["**/" + slug + ".md*"],
    directories: false,
  });
  paths = paths.map((path) => path.replace(".mdx", "").replace(".md", ""));
  return paths;
}

/**
 * Returns the url to the wiki
 * 
 * @param {string} permalink url to the md file
 * Return the path to the wiki
 */
function toDocsUrl(permalink) {
  return `/${docsDir}/${permalink}`;
}

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(
  module.exports = {
    title: "Wiki",
    tagline: "Dinosaurs are cool",
    url: "http://localhost:3000/",
    baseUrl: "/",
    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",
    favicon: "img/favicon.ico",
    organizationName: "facebook", // Usually your GitHub org/user name.
    projectName: "docusaurus", // Usually your repo name.
    customFields: { graph: path.resolve(__dirname, ".docusaurus/cy.json") },
    plugins: [
      require.resolve("docusaurus-lunr-search"),
      path.resolve(__dirname, "plugins", "docusaurus-plugin-wikigraph"),
      'plugin-image-zoom'
    ],
    presets: [
      [
        "@docusaurus/preset-classic",
        /** @type {import('@docusaurus/preset-classic').Options} */
        ({
          docs: {
            remarkPlugins: [
              require("remark-capitalize"),
              require("mdx-mermaid"),
              [
                require("remark-wiki-link"),
                {
                  pageResolver: wikilinkToUrl,
                  hrefTemplate: toDocsUrl,
                },
              ],
              [
                require("@akebifiky/remark-simple-plantuml"),
                { baseUrl: "http://127.0.0.1:8000/plantuml/svg" }
                /* Ensure to start plantuml local server or replace baseUrl with plantuml online server
                   java -jar plantuml.jar -picoweb:8000:127.0.0.1
                */
              ],
            ],
            sidebarPath: require.resolve("./sidebars.js"),
            // Please change this to your repo.
            // editUrl: '"https://github.com/facebook/docusaurus/edit/main/website/docs/',
          },
          blog: {
            showReadingTime: true,
            // Please change this to your repo.
            editUrl:
              "https://github.com/facebook/docusaurus/edit/main/website/blog/",
          },
          theme: {
            customCss: require.resolve("./src/css/custom.css"),
          },
        }),
      ],
    ],

    themeConfig:
      /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
      ({
        navbar: {
          title: "Wiki",
          logo: {
            alt: "My Site Logo",
            src: "img/logo.svg",
          },
          items: [
            {
              type: "doc",
              docId: "intro",
              position: "left",
              label: "Tutorial",
            },
            {
              href: "/graph",
              label: "Graph",
              position: "left",
            },
            { to: "/blog", label: "Blog", position: "left" },
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
  }
);
