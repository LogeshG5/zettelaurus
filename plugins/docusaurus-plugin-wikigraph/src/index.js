const walkSync = require("walk-sync");
const fs = require("fs");
const path = require("path");
const cytoscape = require("cytoscape");
const titleCapitalize = require('title')

const DEFAULT_OPTIONS = {
  // Some defaults.
};

var slugMethod = function sluggify(filepath) {
  const slug = filepath.replace(/ /g, '-').toLowerCase();
  return slug;
}

function initCy() {
  var cy = cytoscape({});
  return cy;
}

function fileNameWithoutExtension(filePath) {
  let fileName = path.parse(path.basename(filePath)).name;
  return fileName;
}

function getTitle(pathNoExt) {
  var title = titleCapitalize(pathNoExt.replace(/-/g, ' '));
  const length = 30;
  title = title.length > length ? title.substring(0, length - 3) + "..." : title;
  return title;
}


function getWikiLinks(filePath) {
  var fileContents = fs.readFileSync(filePath, "utf-8");
  const regexp = /\[\[([A-Za-z0-9 -]*)\]\]/g;
  const wikilinks = [...fileContents.matchAll(regexp)];
  return wikilinks;
}

function createGraph(docsDir, docsUrl, cyJsonFile) {
  let mdFiles = walkSync(docsDir, { globs: ["**/*.md*"], directories: false });
  let cy = initCy();
  let wikis = {};

  // Collect all wikis data
  mdFiles.forEach(function(filePath, i) {
    const fileName = fileNameWithoutExtension(filePath)
    const title = getTitle(fileName);
    const slug = slugMethod(fileName);
    // Docusaurus removes the numbers from file and dir names in links as it uses it to sort for sidebar
    const url = docsUrl + filePath.replace(".md", "").replace(/[0-9]\./g, "");

    wikis[slug] = { id: i, path: filePath, title: title, slug: slug, url: url };
  });

  // Add Nodes to Graph
  for (const [_, wiki] of Object.entries(wikis)) {
    cy.add({ data: { id: wiki.id, name: wiki.title, href: wiki.url } });
  }

  // Add Edges to Graph
  // Get all [[wikilinks]] in an md file and create edges from that md file to wikilink file
  for (const [_, sourceWiki] of Object.entries(wikis)) {
    const wikilinks = getWikiLinks(docsDir + sourceWiki.path);
    wikilinks.forEach(function(wikilink) {
      const slug = slugMethod(wikilink[1]);
      const linkedWiki = wikis[slug];
      try {
        cy.add({ data: { id: 'e-' + sourceWiki.id + "-" + linkedWiki.id, source: sourceWiki.id, target: linkedWiki.id } });
      }
      catch (error) {
        // console.log("Broken Link: " + error);
      }
    });
  }
  // Write the graph contents into cy.json
  let graphContents = JSON.stringify(cy.json());
  fs.writeFile(cyJsonFile, graphContents, function(err) {
    if (err) throw err;
  });
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
    name: 'docusaurus-plugin-wikigraph',

    getThemePath() {
      return path.resolve(__dirname, './theme');
    },

    async loadContent() {
      // The loadContent hook is executed after siteConfig and env has been loaded.
      // This is also executed after every file changes during hot reload
      // You can return a JavaScript object that will be passed to contentLoaded hook.

      if (typeof (opts.slugMethod) === typeof (Function)) {
        slugMethod = opts.slugMethod;
      }

      let docsDir = context.siteDir + "/docs/";
      const docsUrl = context.siteConfig.url + "/docs/";

      // Create dir if not exists
      if (!fs.existsSync(context.generatedFilesDir)) {
        fs.mkdirSync(context.generatedFilesDir);
      }
      const cyJsonFile = context.generatedFilesDir + '/cy.json';

      createGraph(docsDir, docsUrl, cyJsonFile);

      return cyJsonFile;
    },

    async contentLoaded({ content, actions }) {
      // The contentLoaded hook is done after loadContent hook is done.
      // `actions` are set of functional API provided by Docusaurus (e.g. addRoute)
      const { addRoute } = actions;

      addRoute(
        {
          path: '/graph',
          component: '@theme/GraphVisualization',
          modules: { graph: content, },
          exact: false,
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
