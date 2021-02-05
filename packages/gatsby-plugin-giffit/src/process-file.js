import GifToWebp from './GifToWebp'
import { reportError } from './report-error'

const fs = require(`fs-extra`)
const debug = require(`debug`)(`gatsby:gatsby-plugin-sharp`)
const _ = require(`lodash`)
const crypto = require(`crypto`)

/**
 * List of arguments used by `processFile` function.
 * This is used to generate args hash using only
 * arguments that affect output of that function.
 */
const argsWhitelist = [
  `height`,
  `width`,
  `cropFocus`,
  `toFormat`,
  `pngCompressionLevel`,
  `quality`,
  `jpegProgressive`,
  `grayscale`,
  `rotate`,
  `duotone`,
  `fit`,
  `background`,
]

/**
 * @typedef {Object} TransformArgs
 * @property {number} height
 * @property {number} width
 * @property {number} cropFocus
 * @property {string} toFormat
 * @property {number} pngCompressionLevel
 * @property {number} quality
 * @property {boolean} jpegProgressive
 * @property {boolean} grayscale
 * @property {number} rotate
 * @property {object} duotone
 */

/**+
 * @typedef {Object} Transform
 * @property {string} outputPath
 * @property {TransformArgs} args
 */

/**
 * @param {String} file
 * @param {Transform[]} transforms
 * @param options
 */
exports.processFile = (file, transforms, options = {}) => {
  const processGif = new GifToWebp(file)

  // Keep Metadata
  if (!options.stripMetadata) {
    processGif.withMetadata()
  }

  return transforms.map(async (transform) => {
    const { outputPath, args } = transform
    debug(`Start processing ${outputPath}`)

    // gifsicle only allows ints as height/width. Since both aren't always
    // set, check first before trying to round them.
    let roundedHeight = args.height
    if (roundedHeight) {
      roundedHeight = Math.round(roundedHeight)
    }

    let roundedWidth = args.width
    if (roundedWidth) {
      roundedWidth = Math.round(roundedWidth)
    }

    processGif.resize(roundedWidth, roundedHeight)

    // // grayscale
    // if (args.grayscale) {
    //   clonedPipeline = clonedPipeline.grayscale()
    // }
    //
    // // rotate
    // if (args.rotate && args.rotate !== 0) {
    //   clonedPipeline = clonedPipeline.rotate(args.rotate)
    // }
    //
    // // duotone
    // if (args.duotone) {
    //   clonedPipeline = await duotone(
    //     args.duotone,
    //     args.toFormat,
    //     clonedPipeline
    //   )
    // }

    // lets decide how we want to save this transform
    // if (args.toFormat === `png`) {
    //   await compressPng(clonedPipeline, outputPath, {
    //     ...args,
    //     stripMetadata: options.stripMetadata,
    //   })
    //   return transform
    // }
    //
    // if (options.useMozJpeg && args.toFormat === `jpg`) {
    //   await compressJpg(clonedPipeline, outputPath, args)
    //   return transform
    // }
    //
    // if (args.toFormat === `webp`) {
    //   await compressWebP(clonedPipeline, outputPath, args)
    //   return transform
    // }

    try {
      if (args.toFormat === `gif`) {
        await processGif.toGif(outputPath)
      }
      if (args.toFormat === `webp`) {
        await processGif.toWebp(outputPath)
      }
    } catch (err) {
      reportError(`Failed to process image ${file.absolutePath}`, err)
    }
    return transform
  })
}

exports.createArgsDigest = (args) => {
  const filtered = _.pickBy(args, (value, key) => {
    // remove falsy
    if (!value) return false
    // if (args.toFormat.match(/^jp*/) && _.includes(key, `png`)) {
    //   return false
    // } else if (args.toFormat.match(/^png/) && key.match(/^jp*/)) {
    //   return false
    // }
    // after initial processing - get rid of unknown/unneeded fields
    return argsWhitelist.includes(key)
  })

  const argsDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(filtered, Object.keys(filtered).sort()))
    .digest(`hex`)

  return argsDigest.substr(argsDigest.length - 5)
}
