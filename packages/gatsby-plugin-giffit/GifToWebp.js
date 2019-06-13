"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var fs = require("fs");

var path = require("path");

var util = require("util");

var execFile = util.promisify(require("child_process").execFile);

var temp = require("temp");

var chokidar = require("chokidar");

var ProgressBar = require("progress");

var gifFrames = require("gif-frames");

var gifsicle = require("gifsicle");

var gif2webp = require("webp-converter/gwebp");

var GREEN = "\x1B[42m=\x1B[0m";
var RED = "\x1B[41m+\x1B[0m";
/**
 * Encapsulates processing of gif to webp images.
 */

var GifToWebp =
/*#__PURE__*/
function () {
  function GifToWebp(file, barDescription) {
    if (barDescription === void 0) {
      barDescription = "";
    }

    (0, _defineProperty2["default"])(this, "file", void 0);
    (0, _defineProperty2["default"])(this, "bar", void 0);
    (0, _defineProperty2["default"])(this, "gifsicleArgs", []);
    (0, _defineProperty2["default"])(this, "gif2webpArgs", []);
    (0, _defineProperty2["default"])(this, "uniqueArgs", function (arr) {
      return arr.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      });
    });

    if (typeof file === "object") {
      this.file = file.absolutePath;
    } else {
      this.file = file;
    }

    var description = barDescription || "Processing " + path.basename(this.file) + " :add [:bar] :current KB/:total KB :elapsed secs :percent";
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


  var _proto = GifToWebp.prototype;

  _proto.withMetadata = function withMetadata(metadata) {
    if (metadata === void 0) {
      metadata = true;
    }

    var METADATA_ALL = "-metadata all";
    var METADATA_NONE = "-metadata none"; // Don't add duplicate options.

    if (metadata && !this.gif2webpArgs.includes(METADATA_ALL)) {
      // Filter options for the opposite.
      if (this.gif2webpArgs.includes(METADATA_NONE)) {
        this.gif2webpArgs = this.gif2webpArgs.filter(function (elem) {
          return elem !== METADATA_NONE;
        });
      } // Add option.


      this.gif2webpArgs.push(METADATA_ALL);
    } else if (!metadata && !this.gif2webpArgs.includes(METADATA_NONE)) {
      // Filter options for the opposite.
      if (this.gif2webpArgs.includes(METADATA_ALL)) {
        this.gif2webpArgs = this.gif2webpArgs.filter(function (elem) {
          return elem !== METADATA_ALL;
        });
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
  ;

  _proto.resize = function resize(width, height) {
    if (!width && !height) return false; // First remove options possibly set previously.

    this.gifsicleArgs = this.gifsicleArgs.filter(function (elem) {
      return Array.isArray(elem) && !elem[0].startsWith("--resize");
    });

    if (width && !height) {
      // Add option to resize width respecting aspect ratio.
      this.gifsicleArgs.push(["--resize-width", width]);
    } else if (!width && height) {
      // Add option to resize height respecting aspect ratio.
      this.gifsicleArgs.push(["--resize-height", height]);
    } else {
      // Add option to resize to set width & height.
      this.gifsicleArgs.push(["--resize", width + "x" + height]);
    }
  }
  /**
   * Returns a base64 encoded string with the first gif frame.
   * @return {Promise<null|*>}
   * TODO: add variables for outputType & frames choice to gifFrameOptions
   */
  ;

  _proto.toBase64 =
  /*#__PURE__*/
  function () {
    var _toBase = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee() {
      var fileToProcess, gifFrameOptions;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              fileToProcess = this.file;

              if (!(this.gifsicleArgs.length !== 0)) {
                _context.next = 5;
                break;
              }

              fileToProcess = temp.path({
                suffix: '.gif'
              });
              _context.next = 5;
              return this.toGif(fileToProcess);

            case 5:
              gifFrameOptions = {
                url: fileToProcess,
                frames: 0,
                cumulative: true
              };
              return _context.abrupt("return", gifFrames(gifFrameOptions));

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function toBase64() {
      return _toBase.apply(this, arguments);
    }

    return toBase64;
  }()
  /**
   * Processes a gif with the given options.
   * @param outputPath    string    Path to save the processed gif to.
   * @return {Promise<void>}
   */
  ;

  _proto.toGif =
  /*#__PURE__*/
  function () {
    var _toGif = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee2(outputPath) {
      var currentGifsicleArgs;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              currentGifsicleArgs = ["--no-warnings", "--output", outputPath].concat(this.uniqueArgs(this.gifsicleArgs), [this.file]);
              this.createProgressWatcher(this.file, outputPath, "to GIF");
              return _context2.abrupt("return", execFile(gifsicle, currentGifsicleArgs.flat(), {}));

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function toGif(_x) {
      return _toGif.apply(this, arguments);
    }

    return toGif;
  }()
  /**
   * Converts a gif to webp with the given options, processes gif if need be.
   * @param outputPath  string    Path to save the final webp to.
   * @return {Promise<void>}
   */
  ;

  _proto.toWebp =
  /*#__PURE__*/
  function () {
    var _toWebp = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee3(outputPath) {
      var tempFileName, currentGif2webpArgs;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              tempFileName = "";

              if (!(this.gifsicleArgs.length !== 0)) {
                _context3.next = 5;
                break;
              }

              tempFileName = temp.path({
                suffix: '.gif'
              });
              _context3.next = 5;
              return this.toGif(tempFileName);

            case 5:
              currentGif2webpArgs = [].concat(this.uniqueArgs(this.gif2webpArgs), ["-mt", "-quiet", tempFileName || this.file, "-o", outputPath]);
              this.createProgressWatcher(tempFileName || this.file, outputPath, "to WebP");
              return _context3.abrupt("return", execFile(gif2webp(), currentGif2webpArgs.flat(), {}));

            case 8:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function toWebp(_x2) {
      return _toWebp.apply(this, arguments);
    }

    return toWebp;
  }()
  /**
   * Returns a new array with unique values.
   * @param arr   Array   Array to be processed.
   * @return {*}
   */
  ;

  /**
   * Creates a file watcher to update the progress bar.
   * @param originalFile  String  Original file to compare to.
   * @param outputPath    String  File to watch.
   * @param addText       String  Optional string to add to progress bar.
   * TODO: return watch handler and stop watching after processing...
   */
  _proto.createProgressWatcher = function createProgressWatcher(originalFile, outputPath, addText) {
    var _this = this;

    if (addText === void 0) {
      addText = "";
    }

    try {
      var originalFileStatus = fs.statSync(originalFile);
      this.bar.total = Math.floor(originalFileStatus.size / 1024);
      fs.closeSync(fs.openSync(outputPath, 'a'));
      fs.watch(outputPath, {
        persistent: true
      }, function (event, filename) {
        var currStats = fs.statSync(outputPath);
        var updateSize = currStats.size / originalFileStatus.size;

        _this.bar.update(updateSize, {
          add: addText
        });
      });
    } catch (error) {
      throw error;
    }
  };

  return GifToWebp;
}();

exports["default"] = GifToWebp;