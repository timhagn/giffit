"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _extends3 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _GifToWebp = _interopRequireDefault(require("./GifToWebp"));

try {
  var webp = require("webp-converter");
} catch (error) {
  // Bail early if webp isn't available
  console.error("\n      The dependency \"webp-converter\" does not seem to have been built or installed correctly.\n\n      - Try to reinstall packages and look for errors during installation\n      - Consult \"webp-converter\" README and / or issue page at https://github.com/scionoftech/webp-converter\n      \n      If neither of the above work, please open an issue in https://github.com/timhagn/gatsby-plugin-giffit/issues\n    ");
  console.log();
  console.error(error);
  process.exit(1);
}

try {
  var gifsicle = require("gifsicle");
} catch (error) {
  // Bail early if webp isn't available
  console.error("\n      The dependency \"gifsicle\" does not seem to have been built or installed correctly.\n\n      - Try to reinstall packages and look for errors during installation\n      - Consult \"gifsicle\" README and / or issue page at https://github.com/imagemin/gifsicle-bin\n      \n      If neither of the above work, please open an issue in https://github.com/timhagn/gatsby-plugin-giffit/issues\n    ");
  console.log();
  console.error(error);
  process.exit(1);
}

var imageSize = require("probe-image-size");

var _ = require("lodash");

var fs = require("fs-extra");

var path = require("path");

var _require = require('./scheduler'),
    scheduleJob = _require.scheduleJob;

var _require2 = require('./process-file'),
    createArgsDigest = _require2.createArgsDigest;

var _require3 = require("./report-error"),
    reportError = _require3.reportError;

var _require4 = require("./plugin-options"),
    getPluginOptions = _require4.getPluginOptions,
    healOptions = _require4.healOptions;

var imageSizeCache = new Map();

var getImageSize = function getImageSize(file) {
  if (process.env.NODE_ENV !== "test" && imageSizeCache.has(file.internal.contentDigest)) {
    return imageSizeCache.get(file.internal.contentDigest);
  } else {
    var dimensions = imageSize.sync(toArray(fs.readFileSync(file.absolutePath)));
    imageSizeCache.set(file.internal.contentDigest, dimensions);
    return dimensions;
  }
}; // Bound action creators should be set when passed to onPreInit in gatsby-node.
// ** It is NOT safe to just directly require the gatsby module **.
// There is no guarantee that the module resolved is the module executing!
// This can occur in mono repos depending on how dependencies have been hoisted.
// The direct require has been left only to avoid breaking changes.


var _require5 = require("gatsby/dist/redux/actions"),
    actions = _require5.actions;

exports.setActions = function (act) {
  actions = act;
}; // We set the queue to a Map instead of an array to easily search in onCreateDevServer Api hook


var queue = new Map();
exports.queue = queue;

function queueImageResizing(_ref) {
  var file = _ref.file,
      _ref$args = _ref.args,
      args = _ref$args === void 0 ? {} : _ref$args,
      reporter = _ref.reporter;
  var pluginOptions = getPluginOptions();
  var options = healOptions(pluginOptions, args, file.extension);

  if (!options.toFormat) {
    options.toFormat = file.extension;
  }

  var argsDigestShort = createArgsDigest(options);
  var imgSrc = "/" + file.name + "." + options.toFormat;
  var dirPath = path.join(process.cwd(), "public", "static", file.internal.contentDigest, argsDigestShort);
  var filePath = path.join(dirPath, imgSrc);
  fs.ensureDirSync(dirPath);
  var width;
  var height; // Calculate the eventual width/height of the image.

  var dimensions = getImageSize(file);
  var aspectRatio = dimensions.width / dimensions.height;
  var originalName = file.base; // If the width/height are both set, we're cropping so just return
  // that.

  if (options.width && options.height) {
    width = options.width;
    height = options.height; // Recalculate the aspectRatio for the cropped photo

    aspectRatio = width / height;
  } else if (options.width) {
    // Use the aspect ratio of the image to calculate what will be the resulting
    // height.
    width = options.width;
    height = Math.round(options.width / aspectRatio);
  } else {
    // Use the aspect ratio of the image to calculate what will be the resulting
    // width.
    height = options.height;
    width = Math.round(options.height * aspectRatio);
  } // encode the file name for URL


  var encodedImgSrc = "/" + encodeURIComponent(file.name) + "." + options.toFormat; // Prefix the image src.

  var digestDirPrefix = file.internal.contentDigest + "/" + argsDigestShort;
  var prefixedSrc = options.pathPrefix + ("/static/" + digestDirPrefix) + encodedImgSrc; // Create job and add it to the queue, the queue will be processed inside gatsby-node.js

  var job = {
    args: options,
    inputPath: file.absolutePath,
    outputPath: filePath
  };
  queue.set(prefixedSrc, job); // schedule job immediately - this will be changed when image processing on demand is implemented

  var finishedPromise = scheduleJob(job, actions, pluginOptions).then(function () {
    queue["delete"](prefixedSrc);
  });
  return {
    src: prefixedSrc,
    absolutePath: filePath,
    width: width,
    height: height,
    aspectRatio: aspectRatio,
    finishedPromise: finishedPromise,
    // // finishedPromise is needed to not break our API (https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-sqip/src/extend-node-type.js#L115)
    // finishedPromise: {
    //   then: (resolve, reject) => {
    //     scheduleJob(job, actions, pluginOptions).then(() => {
    //       queue.delete(prefixedSrc)
    //       resolve()
    //     }, reject)
    //   },
    // },
    originalName: originalName
  };
} // A value in pixels(Int)


var defaultBase64Width = function defaultBase64Width() {
  return getPluginOptions().base64Width || 20;
};

function generateBase64(_x) {
  return _generateBase.apply(this, arguments);
}

function _generateBase() {
  _generateBase = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(_ref2) {
    var file, args, reporter, pluginOptions, options, processGif, frameData, imageBuffer, base64String;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            file = _ref2.file, args = _ref2.args, reporter = _ref2.reporter;
            pluginOptions = getPluginOptions();
            options = healOptions(pluginOptions, args, file.extension, {
              width: defaultBase64Width()
            });
            processGif = new _GifToWebp["default"](file, "Extracting frames of " + file + " [:bar] :current/:total :elapsed secs :percent");
            processGif.resize(options.width, options.height);
            _context2.prev = 5;
            _context2.next = 8;
            return processGif.toBase64();

          case 8:
            frameData = _context2.sent;
            _context2.next = 15;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2["catch"](5);
            reportError("Failed to process image " + file.absolutePath, _context2.t0, reporter);
            return _context2.abrupt("return", null);

          case 15:
            imageBuffer = frameData[0].getImage();
            base64String = imageBuffer.read().toString("base64");
            return _context2.abrupt("return", {
              src: "data:image/jpg;base64," + base64String,
              width: frameData[0].frameInfo.width,
              height: frameData[0].frameInfo.height,
              aspectRatio: frameData[0].frameInfo.width / frameData[0].frameInfo.height,
              originalName: file.base
            });

          case 18:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[5, 11]]);
  }));
  return _generateBase.apply(this, arguments);
}

var base64CacheKey = function base64CacheKey(_ref3) {
  var file = _ref3.file,
      args = _ref3.args;
  return "" + file.id + JSON.stringify(args);
};

var memoizedBase64 = _.memoize(generateBase64, base64CacheKey);

var cachifiedBase64 =
/*#__PURE__*/
function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(_ref4) {
    var cache, arg, cacheKey, cachedBase64, base64output;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            cache = _ref4.cache, arg = (0, _objectWithoutPropertiesLoose2["default"])(_ref4, ["cache"]);
            cacheKey = base64CacheKey(arg);
            _context.next = 4;
            return cache.get(cacheKey);

          case 4:
            cachedBase64 = _context.sent;

            if (!cachedBase64) {
              _context.next = 7;
              break;
            }

            return _context.abrupt("return", cachedBase64);

          case 7:
            _context.next = 9;
            return generateBase64(arg);

          case 9:
            base64output = _context.sent;
            _context.next = 12;
            return cache.set(cacheKey, base64output);

          case 12:
            return _context.abrupt("return", base64output);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function cachifiedBase64(_x2) {
    return _ref5.apply(this, arguments);
  };
}();

function base64(_x3) {
  return _base.apply(this, arguments);
}

function _base() {
  _base = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee3(arg) {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!arg.cache) {
              _context3.next = 4;
              break;
            }

            _context3.next = 3;
            return cachifiedBase64(arg);

          case 3:
            return _context3.abrupt("return", _context3.sent);

          case 4:
            _context3.next = 6;
            return memoizedBase64(arg);

          case 6:
            return _context3.abrupt("return", _context3.sent);

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _base.apply(this, arguments);
}

function fixed(_x4) {
  return _fixed.apply(this, arguments);
}

function _fixed() {
  _fixed = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee4(_ref6) {
    var file, _ref6$args, args, reporter, cache, options, fixedDimension, sizes, dimensions, filteredSizes, sortedSizes, images, base64Image, base64Args, fallbackSrc, srcSet, originalName;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            file = _ref6.file, _ref6$args = _ref6.args, args = _ref6$args === void 0 ? {} : _ref6$args, reporter = _ref6.reporter, cache = _ref6.cache;
            options = healOptions(getPluginOptions(), args, file.extension); // if no width is passed, we need to resize the image based on the passed height

            fixedDimension = options.width === undefined ? "height" : "width"; // Create sizes for different resolutions — we do 1x, 1.5x, 2x, and 3x.

            sizes = [];
            sizes.push(options[fixedDimension]);
            sizes.push(options[fixedDimension] * 1.5);
            sizes.push(options[fixedDimension] * 2);
            sizes.push(options[fixedDimension] * 3);
            dimensions = getImageSize(file);
            filteredSizes = sizes.filter(function (size) {
              return size <= dimensions[fixedDimension];
            }); // If there's no fluid images after filtering (e.g. image is smaller than what's
            // requested, add back the original so there's at least something)

            if (filteredSizes.length === 0) {
              filteredSizes.push(dimensions[fixedDimension]);
              console.warn("\n                 The requested " + fixedDimension + " \"" + options[fixedDimension] + "px\" for a resolutions field for\n                 the file " + file.absolutePath + "\n                 was larger than the actual image " + fixedDimension + " of " + dimensions[fixedDimension] + "px!\n                 If possible, replace the current image with a larger one.\n                 ");
            } // Sort images for prettiness.


            sortedSizes = _.sortBy(filteredSizes);
            images = sortedSizes.map(function (size) {
              var _extends2;

              var arrrgs = (0, _extends3["default"])({}, options, (_extends2 = {}, _extends2[fixedDimension] = Math.round(size), _extends2)); // Queue images for processing.

              if (options.width !== undefined && options.height !== undefined) {
                arrrgs.height = Math.round(size * (options.height / options.width));
              }

              return queueImageResizing({
                file: file,
                args: arrrgs,
                reporter: reporter
              });
            });

            if (!options.base64) {
              _context4.next = 18;
              break;
            }

            base64Args = {
              // height is adjusted accordingly with respect to the aspect ratio
              width: options.base64Width,
              duotone: options.duotone,
              grayscale: options.grayscale,
              rotate: options.rotate,
              toFormat: options.toFormat,
              toFormatBase64: options.toFormatBase64
            }; // Get base64 version

            _context4.next = 17;
            return base64({
              file: file,
              args: base64Args,
              reporter: reporter,
              cache: cache
            });

          case 17:
            base64Image = _context4.sent;

          case 18:
            // const tracedSVG = await getTracedSVG(options, file)
            fallbackSrc = images[0].src;
            srcSet = images.map(function (image, i) {
              var resolution;

              switch (i) {
                case 0:
                  resolution = "1x";
                  break;

                case 1:
                  resolution = "1.5x";
                  break;

                case 2:
                  resolution = "2x";
                  break;

                case 3:
                  resolution = "3x";
                  break;

                default:
              }

              return image.src + " " + resolution;
            }).join(",\n");
            originalName = file.base;
            return _context4.abrupt("return", {
              base64: base64Image && base64Image.src,
              aspectRatio: images[0].aspectRatio,
              width: images[0].width,
              height: images[0].height,
              src: fallbackSrc,
              srcSet: srcSet,
              originalName: originalName // tracedSVG,

            });

          case 22:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _fixed.apply(this, arguments);
}

function toArray(buf) {
  var arr = new Array(buf.length);

  for (var i = 0; i < buf.length; i++) {
    arr[i] = buf[i];
  }

  return arr;
}

exports.base64 = base64;
exports.resolutions = fixed;
exports.fixed = fixed;
exports.getImageSize = getImageSize;
exports.queueImageResizing = queueImageResizing;