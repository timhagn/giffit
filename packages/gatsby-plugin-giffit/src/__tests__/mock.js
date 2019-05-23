export function getFileObject(absolutePath, name = `test`) {
  return {
    id: `${absolutePath} absPath of file`,
    name: name,
    absolutePath,
    extension: `gif`,
    internal: {
      contentDigest: `1234`,
    },
  }
}
