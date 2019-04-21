const supportedExtensions = {
  gif: true,
  // webp: true,
}

async function onCreateNode({ node, actions, createNodeId }) {
  const { createNode, createParentChildLink } = actions

  if (!supportedExtensions[node.extension]) {
    return
  }

  const imageNode = {
    id: createNodeId(`${node.id} >> ImageWebpConv`),
    children: [],
    parent: node.id,
    internal: {
      contentDigest: `${node.internal.contentDigest}`,
      type: `ImageWebpConv`,
    },
  }

  createNode(imageNode)
  createParentChildLink({ parent: node, child: imageNode })
}

exports.onCreateNode = onCreateNode