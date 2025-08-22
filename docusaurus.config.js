// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
const path = require("path");
/**
 * directory where to find the md files
 */
const docsDir = "docs";

/**
 * Method to get the corresponding md file name for a given wikilink
 *
 * @param {string} wikilink The text between [[]] in an md file
 * Returns the file name corresponding to [[wiki link]]
 */
function sluggifyWikilink(wikilink) {
  /**
   * [[Some Fancy Title]] gets converted to 'some-fancy-title'
   * so there should be some-fancy-title.md file in docs
   */
  const slug = wikilink.replace(/ /g, "-").toLowerCase();
  return slug;

  // /**
  // * [[Some Fancy Title]] gets converted to 'Some Fancy Title'
  // * so there should be 'Some Fancy Title.md' file in docs
  //   */
  // return wikilink;
}

/**
 * Wiki might be under a subdirectory and the file name might be sluggified
 * Enable remark-wiki-link plugin to find such md files
 *
 * @param {string} wikilink The text between [[]] in an md file
 * Returns list of paths to help resolve a [[wiki link]]
 */
function wikilinkToUrl(wikilink) {
  const slug = sluggifyWikilink(wikilink);
  const walkSync = require("walk-sync");
  let paths = walkSync(docsDir, {
    globs: ["**/" + slug + ".md*"],
    directories: false,
  });
  if (paths == null || paths.length == 0) {
    paths = walkSync(docsDir, {
      globs: ["**/" + wikilink + ".md*"],
      directories: false,
    });
  }
  paths = paths.map((path) => path.replace(".mdx", "").replace(".md", "").replace(/[0-9]\./g, ""));
  return paths;
}

/**
 * Returns the url to the wiki
 *
 * @param {string} permalink url to the md file
 * Return the path to the wiki
 */
function toDocsUrl(permalink) {
  let path = `/${docsDir}/${permalink}`;
  return path;
  // return `/${docsDir}/${permalink}`.replaceAll("[0-9]\.", "");
}

/**
 * Plugin declarations
 *
 */
const lunrSearch = require.resolve("docusaurus-lunr-search");
// const backlinks = require.resolve('docusaurus-plugin-backlinks');
const wikiGraph = [
  path.resolve(__dirname, "plugins", "docusaurus-plugin-wikigraph"),
  { slugMethod: sluggifyWikilink },
];

const wikilink = [
  require("remark-wiki-link"),
  {
    pageResolver: wikilinkToUrl,
    hrefTemplate: toDocsUrl,
  },
];

const onlinePlantUML = [
  require("@akebifiky/remark-simple-plantuml"),
  { baseUrl: "https://www.plantuml.com/plantuml/png" },
  /**
   * Ensure to start plantuml local server or replace baseUrl with plantuml online server
   * java -jar plantuml.jar -picoweb:8000:127.0.0.1
   */
];

const localPlantUML = require("remark-sync-plantuml");

const githubAlerts = require("remark-github-blockquote-alert");

import rehypeRaw from "rehype-raw";
const rehyperaw = [
  rehypeRaw,
  {
    passThrough: [
      "mdxFlowExpression",
      "mdxJsxFlowElement",
      "mdxJsxTextElement",
      "mdxTextExpression",
      "mdxjsEsm",
    ],
  },
];


function extractHashtags(md) {

  // Remove fenced code blocks ``` ... ``` Regex: /```[\s\S]*?```/g
  // Remove inline code `...` Regex: /`[^`]*`/g
  // Remove markdown links [text](url) Regex: /\[([^\]]+)\]\(([^)]+)\)/g
  md = md.replace(/```[\s\S]*?```|`[^`]*`|\[([^\]]+)\]\(([^)]+)\)/g, "");

  // Extract hashtags from remaining text
  const hashtagRegex = /(^|\s)#([a-zA-Z0-9_]+)/g;
  const hashtags = [];
  let match;
  while ((match = hashtagRegex.exec(md)) !== null) {
    hashtags.push(match[2]);
  }

  return hashtags;
}

/* Extend default frontmatter parser 
 * https://docusaurus.io/docs/markdown-features#front-matter
 */
const parseFrontMatterCustom = async (params) => {
  // Reuse the default parser
  const result = await params.defaultParseFrontMatter(params);

  // Extract hash tags from content and add to frontmatter
  const tags = extractHashtags(result.content);
  if (tags.length == 0) return result;

  if (Array.isArray(result.frontMatter.tags)) {
    result.frontMatter.tags.push(tags);
  } else {
    result.frontMatter.tags = tags;
  }

  return result;
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "My Wiki",
  tagline: "Dinosaurs are cool",
  favicon: "img/favicon.png",

  // Set the production url of your site here
  url: "http://localhost:3000",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "Docs", // Usually your GitHub org/user name.
  projectName: "docusaurus", // Usually your repo name.

  onBrokenLinks: "log",
  onBrokenMarkdownLinks: "log",
  markdown: { format: "md", mermaid: true, parseFrontMatter: async (params) => parseFrontMatterCustom(params) },
  themes: ["@docusaurus/theme-mermaid"],
  future: {
    // This is only useful in PC broswer where file:// is allowed
    // file:// protocol is not allowed in mobiles
    // experimental_router: "hash", // breaks search plugin
    experimental_faster: true,
    v4: {
      removeLegacyPostBuildHeadAttribute: true, // required
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          remarkPlugins: [wikilink, localPlantUML],
          rehypePlugins: [rehyperaw],
          sidebarPath: "./sidebars.js",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: ({ docPath }) => {
          //   let stripedPath = docPath.replace("docs/", "").replace(".md", "").replace(".mdx", "")
          //   return `http://localhost:3000/admin/index.html#/collections/edit/doc/${stripedPath}`
          // }
          editUrl: ({ docPath }) => {
            return `http://localhost:3030/${docPath}`;
          },
          exclude: [
            "Library",
            "silverbullet",
            "_plug",
            "Journal",
            "PLUGS.md",
            "CONFIG",
            "SETTINGS.md",
            "Update",
            //"6.Archive"
          ],
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],
  plugins: [wikiGraph, lunrSearch],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "My Wiki",
        logo: {
          alt: "My Site Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "wikiSidebar",
            position: "left",
            label: "Wiki",
          },
          {
            href: "/graph",
            label: "Graph",
            position: "left",
          },
          {
            href: "/docs/tags",
            label: "Tags",
            position: "left",
          },
        ],
      },

      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      footer: {},
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.oneDark,
      },
      mermaid: {
        theme: { light: "light", dark: "neutral" },
      },
    }),
};

export default config;
