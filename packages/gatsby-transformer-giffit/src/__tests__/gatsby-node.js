const { onCreateNode } = require(`../gatsby-node.js`)

describe(`Process image nodes correctly`, () => {
  it(`correctly creates an ImageGifFit node from a file image node`, async () => {
    const node = {
      extension: `gif`,
      id: `whatever`,
      children: [],
      internal: {
        contentDigest: `whatever`,
      },
    }
    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }

    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    const createContentDigest = jest.fn()

    await onCreateNode({
      node,
      actions,
      createNodeId,
      createContentDigest,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })
})
