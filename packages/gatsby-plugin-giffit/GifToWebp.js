"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

const fs = require('fs');

const util = require('util');

const execFile = util.promisify(require('child_process').execFile);

const temp = require('temp');

const chokidar = require('chokidar');

const ProgressBar = require(`progress`);

const gifFrames = require('gif-frames');

const gifsicle = require('gifsicle');

const gif2webp = require('webp-converter/gwebp');

const GREEN = `\u001b[42m=\u001b[0m`;
const RED = `\u001b[41m+\u001b[0m`;
/**
 * Encapsulates processing of gif to webp images.
 */

class GifToWebp {
  constructor(file) {
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

    this.bar = new ProgressBar(`Processing ${this.file} [:bar] :current/:total :elapsed secs :percent`, {
      // complete: RED,
      // incomplete: GREEN,
      // stream: process.stdout,
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

    if (width && !height) {
      // Add option to resize width respecting aspect ratio.
      this.gifsicleArgs.push([`--resize-width`, width]);
    } else if (!width && height) {
      // Add option to resize height respecting aspect ratio.
      this.gifsicleArgs.push([`--resize-height`, height]);
    } else {
      // Add option to resize to set width & height.
      this.gifsicleArgs.push(`--resize ${width}x${height}`);
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

    try {
      return await gifFrames(gifFrameOptions);
    } catch (error) {
      throw error;
    }
  }
  /**
   * Processes a gif with the given options.
   * @param outputPath    string    Path to save the processed gif to.
   * @return {Promise<void>}
   */


  async toGif(outputPath) {
    const currentGifsicleArgs = [`--no-warnings`, `--output`, outputPath, ...this.uniqueArgs(this.gifsicleArgs), this.file];

    try {
      // const streamWatcher = this.createProgressStreamWatcher(outputPath)
      // this.bar.render(undefined, true)
      const originalFileStatus = fs.statSync(this.file);
      this.bar.total = originalFileStatus.size;
      fs.watchFile(outputPath, {
        interval: 100
      }, (curr, prev) => {
        const updateSize = curr.size - prev.size;
        this.bar.tick(updateSize);
      });
      return execFile(gifsicle, currentGifsicleArgs.flat(), {}); // streamWatcher.close()
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
      await execFile(gif2webp(), currentGif2webpArgs.flat(), {});

      if (tempFileName !== ``) {
        await fs.unlinkSync(tempFileName);
      }
    } catch (error) {
      throw error;
    }
  }
  /**
   * Returns a new array with unique values.
   * @param arr   Array   Array to be processed.
   * @return {*}
   */


  createProgressStreamWatcher(fileToWatch) {
    try {
      // TODO: Create Watcher for file progress bar compared to original file.
      // TODO: see https://www.npmjs.com/package/progress-stream
      const originalFileStatus = fs.statSync(this.file);
      fs.closeSync(fs.openSync(fileToWatch, 'a'));
      this.bar.total = originalFileStatus.size;
      return chokidar.watch(fileToWatch, {
        alwaysStat: true,
        ignorePermissionErrors: true,
        persistent: true
      }).on('change', (event, path, stats) => {
        console.log(event, path, stats);

        if (stats) {
          console.log('Our stats: ', stats);
          const updateSize = stats.size / originalFileStatus.size * 100;
          this.bar.update(updateSize);
        }
      }).on('ready', (path, stats) => console.info('ready ', stats));
    } catch (error) {
      throw error;
    }
  }

}

exports.default = GifToWebp;