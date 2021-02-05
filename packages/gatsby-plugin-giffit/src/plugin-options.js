const _ = require(`lodash`)

/// Plugin options are loaded onPreBootstrap in gatsby-node
const pluginDefaults = {
  forceBase64Format: false,
  // useMozJpeg: process.env.GATSBY_JPEG_ENCODER === `MOZJPEG`,
  stripMetadata: true,
  lazyImageGeneration: true,
  defaultQuality: 75,
}

const generalArgs = {
  quality: 75,
  lossy: 'mixed',
  base64: true,
  tryMinimize: false,
  compressionLevel: 4,
  loopCompatibility: true,
  pathPrefix: ``,
  toFormat: ``,
  toFormatBase64: ``,
  sizeByPixelDensity: false,
}

let pluginOptions = Object.assign({}, pluginDefaults)
exports.setPluginOptions = (opts) => {
  pluginOptions = Object.assign({}, pluginOptions, opts)
  generalArgs.quality = pluginOptions.defaultQuality

  return pluginOptions
}

exports.getPluginOptions = () => pluginOptions

const healOptions = (
  { defaultQuality: quality },
  args,
  fileExtension,
  defaultArgs = {}
) => {
  let options = _.defaults({}, args, { quality }, defaultArgs, generalArgs)
  options.quality = parseInt(options.quality, 10)
  options.toFormat = options.toFormat.toLowerCase()
  options.toFormatBase64 = options.toFormatBase64.toLowerCase()

  // Check to see if have another value than default.
  if (typeof options.lossy !== `boolean` && options.lossy !== `mixed`) {
    options.lossy = true
  }

  // When toFormat is not set we set it based on fileExtension.
  if (options.toFormat === ``) {
    options.toFormat = fileExtension.toLowerCase()
  }

  // Only set width to 400 if neither width nor height is passed.
  if (options.width === undefined && options.height === undefined) {
    options.width = 400
  } else if (options.width !== undefined) {
    options.width = parseInt(options.width, 10)
  } else if (options.height !== undefined) {
    options.height = parseInt(options.height, 10)
  }

  // Only set maxWidth to 800 if neither maxWidth nor maxHeight is passed.
  if (options.maxWidth === undefined && options.maxHeight === undefined) {
    options.maxWidth = 800
  } else if (options.maxWidth !== undefined) {
    options.maxWidth = parseInt(options.maxWidth, 10)
  } else if (options.maxHeight !== undefined) {
    options.maxHeight = parseInt(options.maxHeight, 10)
  }

  return options
}

exports.healOptions = healOptions
