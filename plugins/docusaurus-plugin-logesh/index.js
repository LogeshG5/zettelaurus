const walkSync = require("walk-sync");
const fs = require("fs");
const path = require("path");
const cytoscape = require("cytoscape");
const titleCapitalize = require('title')

const DEFAULT_OPTIONS = {
  // Some defaults.
};

function initCy() {
  var cy = cytoscape({});
  return cy;
}

function fileNameWithoutExtension(filePath) {
  let fileName = path.basename(filePath);
  let pathNoExt = fileName.replace(".mdx", "");
  pathNoExt = pathNoExt.replace(".md", "");
  return pathNoExt;
}

function getTitle(pathNoExt) {
  var title = titleCapitalize(pathNoExt.replace(/-/g, ' '));
  const length = 30;
  title = title.length > length ? title.substring(0, length - 3) + "..." : title;
  return title;
}

function sluggify(filePath) {
  var slug = filePath.replace(/ /g, '-').toLowerCase();
  return slug;
}

function getWikiLinks(filePath) {
  var fileContents = fs.readFileSync(filePath, "utf-8");
  const regexp = /\[\[([A-Za-z0-9 -]*)\]\]/g;
  const wikilinks = [...fileContents.matchAll(regexp)];
  return wikilinks;
}

// A JavaScript function that returns an object.
// `context` is provided by Docusaurus. Example: siteConfig can be accessed from context.
// `opts` is the user-defined options.
module.exports = function(context, opts) {
  // Merge defaults with user-defined options.

  return {
    // A compulsory field used as the namespace for directories to cache
    // the intermediate data for each plugin.
    // If you're writing your own local plugin, you will want it to
    // be unique in order not to potentially conflict with imported plugins.
    // A good way will be to add your own project name within.
    name: 'docusaurus-plugin-logesh',

    async loadContent() {
      // The loadContent hook is executed after siteConfig and env has been loaded.
      // You can return a JavaScript object that will be passed to contentLoaded hook.

      let docsDir = context.siteDir + "/docs/";

      let mdFiles = walkSync(docsDir, { globs: ["**/*.md*"] });
      let cy = initCy();
      // wikis = [];
      let wikis = {};

      // Collect all wikis data
      mdFiles.forEach(function(filePath, i) {
        let fileName = fileNameWithoutExtension(filePath)
        const title = getTitle(fileName);
        const slug = sluggify(fileName);
        const url = context.siteConfig.url + "docs/" + filePath.replace(".md", "");

        // wikis.push({ path: filePath, title: title, slug: slug, url: url });
        wikis[slug] = { id: i, path: filePath, title: title, slug: slug, url: url };
      });

      // Add Nodes to Graph
      // wikis.forEach(function (wiki) {
      for (const [slug, wiki] of Object.entries(wikis)) {
        cy.add({ data: { id: wiki.id, name: wiki.title, href: wiki.url } });
      }
      // });

      // Add Edges to Graph
      // wikis.forEach(function (wiki) {
      for (const [slug, sourceWiki] of Object.entries(wikis)) {
        const wikilinks = getWikiLinks(docsDir + sourceWiki.path);
        wikilinks.forEach(function(wikilink) {
          const slug = sluggify(wikilink[1]);
          const linkedWiki = wikis[slug];
          try {
            cy.add({ data: { id: 'e-' + sourceWiki.id + "-" + linkedWiki.id, source: sourceWiki.id, target: linkedWiki.id } });
          }
          catch (error) {
            // console.log("Broken Link: " + error);
          }
        });
      }
      // });
      if (!fs.existsSync(context.generatedFilesDir)) {
        fs.mkdirSync(context.generatedFilesDir);
      }
      let graphContents = JSON.stringify(cy.json());
      const cyjsonFile = context.generatedFilesDir + '/cy.json';
      fs.writeFile(cyjsonFile, graphContents, function(err) {
        if (err) throw err;
      });
      return cyjsonFile;
    },

    async contentLoaded({ content, actions }) {
      // The contentLoaded hook is done after loadContent hook is done.
      // `actions` are set of functional API provided by Docusaurus (e.g. addRoute)
      const { addRoute } = actions;

      addRoute(
        {
          path: '/graph',
          component: '@site/src/components/GraphVisualization.js',
          modules: { graph: content, },
          exact: true,
        });
    },

    async postBuild(props) {
      // After docusaurus <build> finish.
    },

    injectHtmlTags({ content }) {
      // Inject head and/or body HTML tags.
    },
  };
};
