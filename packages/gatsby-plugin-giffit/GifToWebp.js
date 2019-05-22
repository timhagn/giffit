"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

const fs = require(`fs`);

const path = require(`path`);

const util = require(`util`);

const execFile = util.promisify(require(`child_process`).execFile);

const temp = require(`temp`);

const chokidar = require(`chokidar`);

const ProgressBar = require(`progress`);

const gifFrames = require(`gif-frames`);

const gifsicle = require(`gifsicle`);

const gif2webp = require(`webp-converter/gwebp`);

const GREEN = `\u001b[42m=\u001b[0m`;
const RED = `\u001b[41m+\u001b[0m`;
/**
 * Encapsulates processing of gif to webp images.
 */

class GifToWebp {
  constructor(file, barDescription = ``) {
    (0, _defineProperty2.default)(this, "file", void 0);
    (0, _defineProperty2.default)(this, "bar", void 0);
    (0, _defineProperty2.default)(this, "gifsicleArgs", []);
    (0, _defineProperty2.default)(this, "gif2webpArgs", []);
    (0, _defineProperty2.default)(this, "uniqueArgs", arr => arr.filter((elem, index, self) => index === self.indexOf(elem)));

    if (typeof file === `object`) {
      this.file = file.absolutePath;
    } else {
      this.file = file;
    }

    const description = barDescription || `Processing ${path.basename(this.file)} :add [:bar] :current KB/:total KB :elapsed secs :percent`;
    this.bar = new ProgressBar(description, {
      // complete: RED,
      // incomplete: GREEN,
      // stream: process.stderr,
      total: 0,
      width: 30
    });
  }
  /**
   * Selects if metadata should be stripped.
   * @param metadata  boolean   Truthy keeps metadata, falsy drops it.
   */


  withMetadata(metadata = true) {
    const METADATA_ALL = `-metadata all`;
    const METADATA_NONE = `-metadata none`; // Don't add duplicate options.

    if (metadata && !this.gif2webpArgs.includes(METADATA_ALL)) {
      // Filter options for the opposite.
      if (this.gif2webpArgs.includes(METADATA_NONE)) {
        this.gif2webpArgs = this.gif2webpArgs.filter(elem => elem !== METADATA_NONE);
      } // Add option.


      this.gif2webpArgs.push(METADATA_ALL);
    } else if (!metadata && !this.gif2webpArgs.includes(METADATA_NONE)) {
      // Filter options for the opposite.
      if (this.gif2webpArgs.includes(METADATA_ALL)) {
        this.gif2webpArgs = this.gif2webpArgs.filter(elem => elem !== METADATA_ALL);
      } // Add option.


      this.gif2webpArgs.push(METADATA_NONE);
    }
  }
  /**
   * Adds resize options according to given width and height.
   * @param width   int   Width to resize to.
   * @param height  int   Height to resize to.
   * @return {boolean}    Returns false if neither width nor height are given.
   */


  resize(width, height) {
    if (!width && !height) return false; // First remove options possibly set previously.

    this.gifsicleArgs = this.gifsicleArgs.filter(elem => Array.isArray(elem) && !elem[0].startsWith(`--resize`));

    if (width && height) {
      // Add option to resize to set width & height.
      this.gifsicleArgs.push(`--resize ${width}x${height}`);
    } else if (width && !height) {
      // Add option to resize width respecting aspect ratio.
      this.gifsicleArgs.push([`--resize-width`, width]);
    } else if (!width && height) {
      // Add option to resize height respecting aspect ratio.
      this.gifsicleArgs.push([`--resize-height`, height]);
    }
  }
  /**
   * Returns a base64 encoded string with the first gif frame.
   * @return {Promise<null|*>}
   */


  async toBase64() {
    let fileToProcess = this.file;

    if (this.gifsicleArgs.length !== 0) {
      fileToProcess = temp.path({
        suffix: '.gif'
      });
      await this.toGif(fileToProcess);
    }

    const gifFrameOptions = {
      url: fileToProcess,
      frames: 0,
      cumulative: true
    };
    return gifFrames(gifFrameOptions);
  }
  /**
   * Processes a gif with the given options.
   * @param outputPath    string    Path to save the processed gif to.
   * @return {Promise<void>}
   */


  async toGif(outputPath) {
    const currentGifsicleArgs = [`--no-warnings`, `--output`, outputPath, ...this.uniqueArgs(this.gifsicleArgs), this.file];

    try {
      this.createProgressWatcher(this.file, outputPath, `to GIF`);
      return execFile(gifsicle, currentGifsicleArgs.flat(), {});
    } catch (error) {
      throw error;
    }
  }
  /**
   * Converts a gif to webp with the given options, processes gif if need be.
   * @param outputPath  string    Path to save the final webp to.
   * @return {Promise<void>}
   */


  async toWebp(outputPath) {
    try {
      let tempFileName = ``;

      if (this.gifsicleArgs.length !== 0) {
        tempFileName = temp.path({
          suffix: '.gif'
        });
        await this.toGif(tempFileName);
      }

      const currentGif2webpArgs = [...this.uniqueArgs(this.gif2webpArgs), `-mt`, `-quiet`, tempFileName || this.file, `-o`, outputPath];
      this.createProgressWatcher(tempFileName || this.file, outputPath, `to WebP`);
      return execFile(gif2webp(), currentGif2webpArgs.flat(), {});
    } catch (error) {
      throw error;
    }
  }
  /**
   * Returns a new array with unique values.
   * @param arr   Array   Array to be processed.
   * @return {*}
   */


  /**
   * Creates a file watcher to update the progress bar.
   * @param originalFile  String  Original file to compare to.
   * @param fileToWatch   String  File to watch.
   * @param addText       String  Optional string to add to progress bar.
   */
  createProgressWatcher(originalFile, fileToWatch, addText = ``) {
    try {
      const originalFileStatus = fs.statSync(originalFile);
      this.bar.total = Math.floor(originalFileStatus.size / 1024);
      fs.closeSync(fs.openSync(fileToWatch, 'a'));
      fs.watch(fileToWatch, {
        persistent: true
      }, () => {
        fs.stat(fileToWatch, (err, stats) => {
          const updateSize = stats.size / originalFileStatus.size;
          this.bar.update(updateSize, {
            add: addText
          });
        });
      });
    } catch (error) {
      throw error;
    }
  }

}

exports.default = GifToWebp;