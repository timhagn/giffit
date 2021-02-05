"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _GifToWebp = _interopRequireDefault(require("./GifToWebp"));

var _reportError = require("./report-error");

var fs = require("fs-extra");

var debug = require("debug")("gatsby:gatsby-plugin-sharp");

var _ = require("lodash");

var crypto = require("crypto");
/**
 * List of arguments used by `processFile` function.
 * This is used to generate args hash using only
 * arguments that affect output of that function.
 */


var argsWhitelist = ["height", "width", "cropFocus", "toFormat", "pngCompressionLevel", "quality", "jpegProgressive", "grayscale", "rotate", "duotone", "fit", "background"];
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

exports.processFile = function (file, transforms, options) {
  if (options === void 0) {
    options = {};
  }

  var processGif = new _GifToWebp["default"](file); // Keep Metadata

  if (!options.stripMetadata) {
    processGif.withMetadata();
  }

  return transforms.map(function _callee(transform) {
    var outputPath, args, roundedHeight, roundedWidth;
    return _regenerator["default"].async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            outputPath = transform.outputPath, args = transform.args;
            debug("Start processing " + outputPath); // gifsicle only allows ints as height/width. Since both aren't always
            // set, check first before trying to round them.

            roundedHeight = args.height;

            if (roundedHeight) {
              roundedHeight = Math.round(roundedHeight);
            }

            roundedWidth = args.width;

            if (roundedWidth) {
              roundedWidth = Math.round(roundedWidth);
            }

            processGif.resize(roundedWidth, roundedHeight); // // grayscale
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

            _context.prev = 7;

            if (!(args.toFormat === "gif")) {
              _context.next = 11;
              break;
            }

            _context.next = 11;
            return _regenerator["default"].awrap(processGif.toGif(outputPath));

          case 11:
            if (!(args.toFormat === "webp")) {
              _context.next = 14;
              break;
            }

            _context.next = 14;
            return _regenerator["default"].awrap(processGif.toWebp(outputPath));

          case 14:
            _context.next = 19;
            break;

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](7);
            (0, _reportError.reportError)("Failed to process image " + file.absolutePath, _context.t0);

          case 19:
            return _context.abrupt("return", transform);

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[7, 16]]);
  });
};

exports.createArgsDigest = function (args) {
  var filtered = _.pickBy(args, function (value, key) {
    // remove falsy
    if (!value) return false; // if (args.toFormat.match(/^jp*/) && _.includes(key, `png`)) {
    //   return false
    // } else if (args.toFormat.match(/^png/) && key.match(/^jp*/)) {
    //   return false
    // }
    // after initial processing - get rid of unknown/unneeded fields

    return argsWhitelist.includes(key);
  });

  var argsDigest = crypto.createHash("md5").update(JSON.stringify(filtered, Object.keys(filtered).sort())).digest("hex");
  return argsDigest.substr(argsDigest.length - 5);
};