const fs = require(`fs-extra`)

exports.onCreateNode = require(`./on-node-create`)
exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`)

exports.onPreExtractQueries = async ({ store, getNodesByType }) => {
  const program = store.getState().program

  // Check if there are any ImageWebpConv nodes. If so add fragments for ImageWebpConv.
  // The fragment will cause an error if there are no ImageSharp nodes.
  if (getNodesByType(`ImageWebpConv`).length === 0) {
    return
  }

  // We have ImageSharp nodes so let's add our fragments to .cache/fragments.
  await fs.copy(
    require.resolve(`gatsby-transformer-webpconv/src/fragments.js`),
    `${program.directory}/.cache/fragments/image-webpconv-fragments.js`
  )
}
