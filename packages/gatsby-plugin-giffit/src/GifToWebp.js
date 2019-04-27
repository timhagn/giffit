const execFileSync = require('child_process').execFileSync
const fs = require('fs')
const temp = require('temp')
const gifsicle = require('gifsicle')
const gif2webp = require('webp-converter/gwebp')

/**
 * Encapsulates processing of gif to webp images.
 */
export default class GifToWebp {
  file
  gifsicleArgs = []
  gif2webpArgs = []

  constructor(file) {
    this.file = file
  }

  /**
   * Selects if metadata should be stripped.
   * @param metadata  boolean   Truthy keeps metadata, falsy drops it.
   */
  withMetadata(metadata = true) {
    const METADATA_ALL = `-metadata all`
    const METADATA_NONE = `-metadata none`
    // Don't add duplicate options.
    if (metadata && !this.gif2webpArgs.includes(METADATA_ALL)) {
      // Filter options for the opposite.
      if (this.gif2webpArgs.includes(METADATA_NONE)) {
        this.gif2webpArgs = this.gif2webpArgs.filter(
          elem => elem !== METADATA_NONE
        )
      }
      // Add option.
      this.gif2webpArgs.push(METADATA_ALL)
    } else if (!metadata && !this.gif2webpArgs.includes(METADATA_NONE)) {
      // Filter options for the opposite.
      if (this.gif2webpArgs.includes(METADATA_ALL)) {
        this.gif2webpArgs = this.gif2webpArgs.filter(
          elem => elem !== METADATA_ALL
        )
      }
      // Add option.
      this.gif2webpArgs.push(METADATA_NONE)
    }
  }

  /**
   * Adds resize options according to given width and height.
   * @param width   int   Width to resize to.
   * @param height  int   Height to resize to.
   * @return {boolean}    Returns false if neither width nor height are given.
   */
  resize(width, height) {
    if (!width && !height) return false
    // First remove options possibly set previously.
    this.gifsicleArgs = this.gifsicleArgs.filter(
      elem => Array.isArray(elem) && !elem[0].startsWith(`--resize`)
    )
    if (width && !height) {
      // Add option to resize width respecting aspect ratio.
      this.gifsicleArgs.push([`--resize-width`, width])
    } else if (!width && height) {
      // Add option to resize height respecting aspect ratio.
      this.gifsicleArgs.push([`--resize-height`, height])
    } else {
      // Add option to resize to set width & height.
      this.gifsicleArgs.push(`--resize ${width}x${height}`)
    }
  }

  /**
   * Processes a gif with the given options.
   * @param outputPath    string    Path to save the processed gif to.
   * @return {Promise<void>}
   */
  async toGif(outputPath) {
    const currentGifsicleArgs = [
      `--no-warnings`,
      `--output`,
      outputPath,
      ...this.uniqueArgs(this.gifsicleArgs),
      this.file,
    ]
    try {
      await execFileSync(gifsicle, currentGifsicleArgs.flat(), {})
    } catch (error) {
      throw error
    }
  }

  /**
   * Converts a gif to webp with the given options, processes gif if need be.
   * @param outputPath  string    Path to save the final webp to.
   * @return {Promise<void>}
   */
  async toWebp(outputPath) {
    try {
      let tempFileName = ``
      if (this.gifsicleArgs.length !== 0) {
        tempFileName = temp.path({ suffix: '.gif' })
        await this.toGif(tempFileName)
      }
      const currentGif2webpArgs = [
        ...this.uniqueArgs(this.gif2webpArgs),
        `-mt`,
        `-quiet`,
        tempFileName || this.file,
        `-o`,
        outputPath,
      ]
      await execFileSync(gif2webp(), currentGif2webpArgs.flat(), {})
      if (tempFileName !== ``) {
        await fs.unlinkSync(tempFileName)
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Returns a new array with unique values.
   * @param arr   Array   Array to be processed.
   * @return {*}
   */
  uniqueArgs = arr =>
    arr.filter((elem, index, self) => index === self.indexOf(elem))
}
