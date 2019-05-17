import GifToWebp from './GifToWebp'

try {
  const webp = require(`webp-converter`)
} catch (error) {
  // Bail early if webp isn't available
  console.error(
    `
      The dependency "webp-converter" does not seem to have been built or installed correctly.

      - Try to reinstall packages and look for errors during installation
      - Consult "webp-converter" README and / or issue page at https://github.com/scionoftech/webp-converter
      
      If neither of the above work, please open an issue in https://github.com/timhagn/gatsby-plugin-giffit/issues
    `
  )
  console.log()
  console.error(error)
  process.exit(1)
}

try {
  const gifsicle = require(`gifsicle`)
} catch (error) {
  // Bail early if webp isn't available
  console.error(
    `
      The dependency "gifsicle" does not seem to have been built or installed correctly.

      - Try to reinstall packages and look for errors during installation
      - Consult "gifsicle" README and / or issue page at https://github.com/imagemin/gifsicle-bin
      
      If neither of the above work, please open an issue in https://github.com/timhagn/gatsby-plugin-giffit/issues
    `
  )
  console.log()
  console.error(error)
  process.exit(1)
}

const imageSize = require(`probe-image-size`)
const gifFrames = require('gif-frames')

const _ = require(`lodash`)
const fs = require(`fs-extra`)
const path = require(`path`)
const { scheduleJob } = require('./scheduler')
const { createArgsDigest } = require('./process-file')

const { reportError } = require(`./report-error`)
const { getPluginOptions, healOptions } = require(`./plugin-options`)

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

// Bound action creators should be set when passed to onPreInit in gatsby-node.
// ** It is NOT safe to just directly require the gatsby module **.
// There is no guarantee that the module resolved is the module executing!
// This can occur in mono repos depending on how dependencies have been hoisted.
// The direct require has been left only to avoid breaking changes.
let { actions } = require(`gatsby/dist/redux/actions`)
exports.setActions = act => {
  actions = act
}

// We set the queue to a Map instead of an array to easily search in onCreateDevServer Api hook
const queue = new Map()
exports.queue = queue

function queueImageResizing({ file, args = {}, reporter }) {
  const pluginOptions = getPluginOptions()
  const options = healOptions(pluginOptions, args, file.extension)
  if (!options.toFormat) {
    options.toFormat = file.extension
  }

  const argsDigestShort = createArgsDigest(options)
  const imgSrc = `/${file.name}.${options.toFormat}`
  const dirPath = path.join(
    process.cwd(),
    `public`,
    `static`,
    file.internal.contentDigest,
    argsDigestShort
  )
  const filePath = path.join(dirPath, imgSrc)
  fs.ensureDirSync(dirPath)

  let width
  let height
  // Calculate the eventual width/height of the image.
  const dimensions = getImageSize(file)
  let aspectRatio = dimensions.width / dimensions.height
  const originalName = file.base

  // If the width/height are both set, we're cropping so just return
  // that.
  if (options.width && options.height) {
    width = options.width
    height = options.height
    // Recalculate the aspectRatio for the cropped photo
    aspectRatio = width / height
  } else if (options.width) {
    // Use the aspect ratio of the image to calculate what will be the resulting
    // height.
    width = options.width
    height = Math.round(options.width / aspectRatio)
  } else {
    // Use the aspect ratio of the image to calculate what will be the resulting
    // width.
    height = options.height
    width = Math.round(options.height * aspectRatio)
  }

  // encode the file name for URL
  const encodedImgSrc = `/${encodeURIComponent(file.name)}.${options.toFormat}`

  // Prefix the image src.
  const digestDirPrefix = `${file.internal.contentDigest}/${argsDigestShort}`
  const prefixedSrc =
    options.pathPrefix + `/static/${digestDirPrefix}` + encodedImgSrc

  // Create job and add it to the queue, the queue will be processed inside gatsby-node.js
  const job = {
    args: options,
    inputPath: file.absolutePath,
    outputPath: filePath,
  }

  queue.set(prefixedSrc, job)

  // schedule job immediately - this will be changed when image processing on demand is implemented
  const finishedPromise = scheduleJob(job, actions, pluginOptions).then(() => {
    queue.delete(prefixedSrc)
  })

  return {
    src: prefixedSrc,
    absolutePath: filePath,
    width,
    height,
    aspectRatio,
    finishedPromise,
    // // finishedPromise is needed to not break our API (https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-sqip/src/extend-node-type.js#L115)
    // finishedPromise: {
    //   then: (resolve, reject) => {
    //     scheduleJob(job, actions, pluginOptions).then(() => {
    //       queue.delete(prefixedSrc)
    //       resolve()
    //     }, reject)
    //   },
    // },
    originalName: originalName,
  }
}

// A value in pixels(Int)
const defaultBase64Width = () => getPluginOptions().base64Width || 20
async function generateBase64({ file, args, reporter }) {
  const pluginOptions = getPluginOptions()
  const options = healOptions(pluginOptions, args, file.extension, {
    width: defaultBase64Width(),
  })

  const processGif = new GifToWebp(file)
  processGif.resize(options.width, options.height)

  let frameData
  try {
    frameData = await processGif.toBase64()
  } catch (err) {
    reportError(`Failed to process image ${file.absolutePath}`, err, reporter)
    return null
  }

  // const gifFrameOptions = {
  //   url: file.absolutePath,
  //   frames: 0,
  //   cumulative: true,
  // }
  //
  // let frameData
  // try {
  //   frameData = await gifFrames(gifFrameOptions)
  // } catch (err) {
  //   reportError(`Failed to process image ${file.absolutePath}`, err, reporter)
  //   return null
  // }

  const imageBuffer = frameData[0].getImage()
  const base64String = imageBuffer.read().toString(`base64`)

  return {
    src: `data:image/jpg;base64,${base64String}`,
    width: frameData[0].frameInfo.width,
    height: frameData[0].frameInfo.height,
    aspectRatio: frameData[0].frameInfo.width / frameData[0].frameInfo.height,
    originalName: file.base,
  }
}

const base64CacheKey = ({ file, args }) => `${file.id}${JSON.stringify(args)}`

const memoizedBase64 = _.memoize(generateBase64, base64CacheKey)

const cachifiedBase64 = async ({ cache, ...arg }) => {
  const cacheKey = base64CacheKey(arg)

  const cachedBase64 = await cache.get(cacheKey)
  if (cachedBase64) {
    return cachedBase64
  }

  const base64output = await generateBase64(arg)

  await cache.set(cacheKey, base64output)

  return base64output
}

async function base64(arg) {
  if (arg.cache) {
    // Not all tranformer plugins are going to provide cache
    return await cachifiedBase64(arg)
  }

  return await memoizedBase64(arg)
}

async function fixed({ file, args = {}, reporter, cache }) {
  const options = healOptions(getPluginOptions(), args, file.extension)

  // if no width is passed, we need to resize the image based on the passed height
  const fixedDimension = options.width === undefined ? `height` : `width`

  // Create sizes for different resolutions — we do 1x, 1.5x, 2x, and 3x.
  const sizes = []
  sizes.push(options[fixedDimension])
  sizes.push(options[fixedDimension] * 1.5)
  sizes.push(options[fixedDimension] * 2)
  sizes.push(options[fixedDimension] * 3)
  const dimensions = getImageSize(file)

  const filteredSizes = sizes.filter(size => size <= dimensions[fixedDimension])

  // If there's no fluid images after filtering (e.g. image is smaller than what's
  // requested, add back the original so there's at least something)
  if (filteredSizes.length === 0) {
    filteredSizes.push(dimensions[fixedDimension])
    console.warn(
      `
                 The requested ${fixedDimension} "${
        options[fixedDimension]
      }px" for a resolutions field for
                 the file ${file.absolutePath}
                 was larger than the actual image ${fixedDimension} of ${
        dimensions[fixedDimension]
      }px!
                 If possible, replace the current image with a larger one.
                 `
    )
  }

  // Sort images for prettiness.
  const sortedSizes = _.sortBy(filteredSizes)

  const images = sortedSizes.map(size => {
    const arrrgs = {
      ...options,
      [fixedDimension]: Math.round(size),
    }
    // Queue images for processing.
    if (options.width !== undefined && options.height !== undefined) {
      arrrgs.height = Math.round(size * (options.height / options.width))
    }

    return queueImageResizing({
      file,
      args: arrrgs,
      reporter,
    })
  })

  let base64Image
  if (options.base64) {
    const base64Args = {
      // height is adjusted accordingly with respect to the aspect ratio
      width: options.base64Width,
      duotone: options.duotone,
      grayscale: options.grayscale,
      rotate: options.rotate,
      toFormat: options.toFormat,
      toFormatBase64: options.toFormatBase64,
    }

    // Get base64 version
    base64Image = await base64({
      file,
      args: base64Args,
      reporter,
      cache,
    })
  }

  // const tracedSVG = await getTracedSVG(options, file)

  const fallbackSrc = images[0].src
  const srcSet = images
    .map((image, i) => {
      let resolution
      switch (i) {
        case 0:
          resolution = `1x`
          break
        case 1:
          resolution = `1.5x`
          break
        case 2:
          resolution = `2x`
          break
        case 3:
          resolution = `3x`
          break
        default:
      }
      return `${image.src} ${resolution}`
    })
    .join(`,\n`)

  const originalName = file.base

  return {
    base64: base64Image && base64Image.src,
    aspectRatio: images[0].aspectRatio,
    width: images[0].width,
    height: images[0].height,
    src: fallbackSrc,
    srcSet,
    originalName: originalName,
    // tracedSVG,
  }
}

function toArray(buf) {
  let arr = new Array(buf.length)

  for (let i = 0; i < buf.length; i++) {
    arr[i] = buf[i]
  }

  return arr
}

exports.base64 = base64
exports.resolutions = fixed
exports.fixed = fixed
exports.getImageSize = getImageSize
exports.queueImageResizing = queueImageResizing
