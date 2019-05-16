"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

const fs = require(`fs-extra`);

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`);

exports.onPreExtractQueries =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(function* ({
    store,
    getNodesByType
  }) {
    const program = store.getState().program; // Check if there are any ImageGifFit nodes. If so add fragments for ImageGifFit.
    // The fragment will cause an error if there are no ImageGifFit nodes.

    if (getNodesByType(`ImageGifFit`).length === 0) {
      console.error('No ImageGifFit nodes...');
      return;
    }

    yield fs.copy(require.resolve(`gatsby-transformer-giffit/src/fragments.js`), `${program.directory}/.cache/fragments/image-giffit-fragments.js`);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

const supportedExtensions = {
  gif: true // webp: true,

  /**
   *
   {
    allSitePlugin(filter: { name: { regex: "/giffit|sharp/" } }) {
      edges {
        node {
          id
          name
          resolve
          nodeAPIs
        }
      }
    }
  }
   */
  // TODO: look further into schema.buildObjectType() / sourceNodes at
  // TODO: [New Schema Customization API](https://www.gatsbyjs.org/blog/2019-03-18-releasing-new-schema-customization/)

};

const onCreateNode =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2.default)(function* (_ref3) {
    let node = _ref3.node,
        actions = _ref3.actions,
        helpers = (0, _objectWithoutPropertiesLoose2.default)(_ref3, ["node", "actions"]);
    const createNode = actions.createNode,
          createParentChildLink = actions.createParentChildLink;
    const createNodeId = helpers.createNodeId,
          createContentDigest = helpers.createContentDigest;

    if (!supportedExtensions[node.extension]) {
      return;
    }

    const imageNode = {
      id: createNodeId(`${node.id} >>> ImageGifFit`),
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(node),
        type: `ImageGifFit`
      }
    };
    createNode(imageNode);
    createParentChildLink({
      parent: node,
      child: imageNode
    });
  });

  return function onCreateNode(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

const sourceNodes =
/*#__PURE__*/
function () {
  var _ref4 = (0, _asyncToGenerator2.default)(function* ({
    actions
  }) {
    const createTypes = actions.createTypes;
    const typeDefs = `
    type imageGifFitFixed {
      base64: String
      aspectRatio: Float
      width: Int
      height: Int
      src: String
      srcSet: String
      srcWebp: String
      srcSetWebp: String
      originalName: String
    }

    type imageGifFitOriginal {
      width: Int
      height: Int
      src: String
    }

    type imageGifFitResize {
      src: String
      width: Int
      height: Int
      aspectRatio: Float
      originalName: String
    }
  `;
    createTypes(typeDefs);
  });

  return function sourceNodes(_x3) {
    return _ref4.apply(this, arguments);
  };
}();

exports.sourceNodes = sourceNodes;
exports.onCreateNode = onCreateNode;