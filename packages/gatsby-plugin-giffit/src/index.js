try {
  const webp = require(`webp-converter`)
} catch (error) {
  // Bail early if sharp isn't available
  console.error(
    `
      The dependency "webp-converter" does not seem to have been built or installed correctly.

      - Try to reinstall packages and look for errors during installation
      - Consult "webp-converter" README and / or issue page at https://github.com/scionoftech/webp-converter
      
      If neither of the above work, please open an issue in https://github.com/timhagn/gatsby-plugin-webpconv/issues
    `
  )
  console.log()
  console.error(error)
  process.exit(1)
}

const imageSize = require(`probe-image-size`)

const _ = require(`lodash`)
const fs = require(`fs-extra`)
const path = require(`path`)

const { reportError } = require(`./report-error`)

const imageSizeCache = new Map()
const getImageSize = file => {
  if (
    process.env.NODE_ENV !== `test` &&
    imageSizeCache.has(file.internal.contentDigest)
  ) {
    return imageSizeCache.get(file.internal.contentDigest)
  } else {
    const dimensions = imageSize.sync(
      toArray(fs.readFileSync(file.absolutePath))
    )
    imageSizeCache.set(file.internal.contentDigest, dimensions)
    return dimensions
  }
}

