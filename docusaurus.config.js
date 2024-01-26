import { themes as prismThemes } from 'prism-react-renderer';
const path = require("path");
const docusaurusData = require("./config/docusaurus/index.json");

/**
* directory where to find the md files
*/
// oo
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
  const slug = wikilink.replace(/ /g, '-').toLowerCase();
  return slug;

  /**
  * [[Some Fancy Title]] gets converted to 'Some Fancy Title'
  * so there should be 'Some Fancy Title.md' file in docs
    */
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


/**
* Plugin declarations
*
*/
const lunrSearch = require.resolve("docusaurus-lunr-search");
const wikiGraph = [
  path.resolve(__dirname, "plugins", "docusaurus-plugin-wikigraph"),
  { slugMethod: sluggifyWikilink }
];
/*const docsEditor = [
  path.resolve(__dirname, "plugins", "docusaurus-plugin-docs-editor"),
  {
    route: 'edit',
    contentServer: "http://localhost:8888",
  }
];
const mindmap = [
  path.resolve(__dirname, "plugins", "docusaurus-plugin-mindmap"),
  {
    route: 'mindmap',
    contentServer: "http://localhost:8888",
  }
];
*/
const wikilink = [
  require("remark-wiki-link"),
  {
    pageResolver: wikilinkToUrl,
    hrefTemplate: toDocsUrl,
  },
];
const plantuml = [
  require("@akebifiky/remark-simple-plantuml"),
  { baseUrl: "http://127.0.0.1:8000/plantuml/svg" }
  /**
  * Ensure to start plantuml local server or replace baseUrl with plantuml online server
  * java -jar plantuml.jar -picoweb:8000:127.0.0.1
    */
];

/**
* Tinasaurus Config
*/

const getDocId = (doc) => {
  return doc
    .replace(/\.mdx?$/, "")
    .split("/")
    .slice(1)
    .join("/");
};

const getPageRoute = (page) => {
  return page
    .replace(/\.mdx?$/, "")
    .split("/")
    .slice(2)
    .join("/");
};

const getPath = (page) => {
  return page.replace(/\.mdx?$/, "");
};

const formatFooterItem = (item) => {
  if (item.title) {
    return {
      title: item.title,
      items: item.items.map((subItem) => {
        return formatFooterItem(subItem);
      }),
    };
  } else {
    let linkObject = {
      label: item.label,
    };

    if (item.to) {
      linkObject.to = getPath(item.to);
    } else if (item.href) {
      linkObject.href = item.href;
    } else {
      linkObject.to = "/blog";
    }

    return linkObject;
  }
};

const formatNavbarItem = (item, subnav = false) => {
  let navItem = {
    label: item.label,
  };

  if (!subnav) {
    navItem.position = item.position;
  }

  if (item.link === "external" && item.externalLink) {
    navItem.href = item.externalLink;
  }

  if (item.link === "blog") {
    navItem.to = "/blog";
  }

  if (item.link === "page" && item.pageLink) {
    navItem.to = getPageRoute(item.pageLink);
  }

  if (item.link === "doc" && item.docLink) {
    navItem.type = "doc";
    navItem.docId = getDocId(item.docLink);
  }

  if (item.items) {
    navItem.type = "dropdown";
    navItem.items = item.items.map((subItem) => {
      return formatNavbarItem(subItem, true);
    });
  }

  return navItem;
};
/**
* Tinasaurus Config Ends
*/



/** @type {import('@docusaurus/types').Config} */
export default {
  title: 'Wiki',

  tagline: "",
  url: "http://localhost:8585/",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  markdown: { format: 'md' },
  favicon: "img/favicon.ico",
  organizationName: "Logeshg5", // Usually your GitHub org/user name.
  projectName: "docusaurus", // Usually your repo name.
  //plugins: [lunrSearch, wikiGraph, docsEditor, mindmap],
  plugins: [lunrSearch, wikiGraph],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          remarkPlugins: [wikilink, plantuml],
          sidebarPath: './sidebars.js',
          editUrl: docusaurusData.url + "/admin/#/collections/doc",
        },
        blog: {
          showReadingTime: true,
          editUrl: docusaurusData.url + "/admin/#/collections/post",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],
  customFields: {
    contentServer: "http://localhost:8888",
  },
  stylesheets: [
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
            docId: "Intro",
            position: "left",
            label: "Wiki",
          },
          {
            href: "/graph",
            label: "Graph",
            position: "left",
          }/*,
          {
            href: '/create-new-doc',
            label: 'Create',
            position: 'right',
          },
          {
            href: 'http://localhost:8887/',
            label: 'File Manager',
            position: 'right',
          },*/
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

//module.exports = config;
