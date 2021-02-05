"use strict";

const fs = require(`fs-extra`);

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`);

exports.onPreExtractQueries = async ({
  store,
  getNodesByType
}) => {
  const program = store.getState().program; // Check if there are any ImageGifFit nodes. If so add fragments for ImageGifFit.
  // The fragment will cause an error if there are no ImageGifFit nodes.

  if (getNodesByType(`ImageGifFit`).length === 0) {
    console.error('No ImageGifFit nodes...');
    return;
  }

  await fs.copy(require.resolve(`gatsby-transformer-giffit/src/fragments.js`), `${program.directory}/.cache/fragments/image-giffit-fragments.js`);
};

exports.onPreExtractQueries = async ({
  store
}) => {
  const program = store.getState().program; // Add fragments for ImageSharp to .cache/fragments.

  await fs.copy(require.resolve(`gatsby-transformer-sharp/src/fragments.js`), `${program.directory}/.cache/fragments/image-sharp-fragments.js`);
};

const supportedExtensions = {
  gif: true // webp: true,

};
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

const onCreateNode = async ({
  node,
  actions,
  ...helpers
}) => {
  const {
    createNode,
    createParentChildLink
  } = actions;
  const {
    createNodeId,
    createContentDigest
  } = helpers;

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
};

const sourceNodes = async ({
  actions
}) => {
  const {
    createTypes
  } = actions;
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
};

exports.sourceNodes = sourceNodes;
exports.onCreateNode = onCreateNode;