"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _urijs = _interopRequireDefault(require("urijs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function pluginDocsEditor(context, options) {
  const {
    siteConfig: {
      baseUrl,
      organizationName,
      projectName
    }
  } = context;
  const defaultOptions = {
    authorizationMethod: 'GET',
    contentOwner: organizationName,
    contentRepo: projectName,
    contentDocsPath: 'docs',
    contentStaticPath: 'static',
    editorPath: 'edit'
  };
  const normalizedOptions = Object.assign({}, defaultOptions, options);

  const editorBasePath = _urijs.default.joinPaths(baseUrl, normalizedOptions.editorPath).toString();

  return {
    name: 'docusaurus-plugin-docs-editor',

    getThemePath() {
      return _path.default.resolve(__dirname, './theme');
    },

    async contentLoaded({
      actions
    }) {
      const {
        createData,
        setGlobalData,
        addRoute
      } = actions;
      const optionsPath = await createData('editor.json', JSON.stringify(normalizedOptions));
      addRoute({
        path: editorBasePath,
        exact: false,
        component: '@theme/Editor',
        modules: {
          options: optionsPath
        }
      });
      setGlobalData({
        editorBasePath
      });
    }

  };
}

var _default = pluginDocsEditor;
exports.default = _default;