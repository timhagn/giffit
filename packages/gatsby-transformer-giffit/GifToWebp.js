"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _require = require('child_process'),
    execFile = _require.execFile;

var gifsicle = require('gifsicle');

var GifToWebp =
/*#__PURE__*/
function () {
  function GifToWebp(file) {
    (0, _defineProperty2.default)(this, "file", void 0);
    (0, _defineProperty2.default)(this, "gifsicleOptions", []);
    (0, _defineProperty2.default)(this, "gif2webpOptions", []);
    (0, _defineProperty2.default)(this, "uniqueOptions", function (arr) {
      return arr.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      });
    });

    var gifsicle = require('gifsicle');

    this.file = file;
  }

  var _proto = GifToWebp.prototype;

  _proto.withMetadata = function withMetadata(metadata) {
    if (metadata === void 0) {
      metadata = true;
    }

    var METADATA_ALL = "-metadata all";
    var METADATA_NONE = "-metadata none"; // Don't add duplicate options.

    if (metadata && !this.gif2webpOptions.includes(METADATA_ALL)) {
      // Filter options for the opposite.
      if (this.gif2webpOptions.includes(METADATA_NONE)) {
        this.gif2webpOptions = this.gif2webpOptions.filter(function (elem) {
          return elem !== METADATA_NONE;
        });
      } // Add option.


      this.gif2webpOptions.push(METADATA_ALL);
    } else if (!metadata && !this.gif2webpOptions.includes(METADATA_NONE)) {
      // Filter options for the opposite.
      if (this.gif2webpOptions.includes(METADATA_ALL)) {
        this.gif2webpOptions = this.gif2webpOptions.filter(function (elem) {
          return elem !== METADATA_ALL;
        });
      } // Add option.


      this.gif2webpOptions.push(METADATA_NONE);
    }
  };

  _proto.resize = function resize(width, height) {
    if (!width && !height) return false; // First remove

    this.gifsicleOptions = this.gifsicleOptions.filter(function (elem) {
      return !elem.startsWith("--resize");
    });

    if (width && !height) {
      this.gifsicleOptions.push("--resize-width " + width);
    } else if (!width && height) {
      this.gifsicleOptions.push("--resize-height " + height);
    } else {
      this.gifsicleOptions.push("--resize " + width + "x" + height);
    }
  };

  _proto.toGif = function toGif(outputPath) {
    var gifsicleOptions = [].concat(this.uniqueOptions(this.gifsicleOptions), ['-o', outputPath, this.file]);
    execFile(gifsicle, gifsicleOptions, function (err) {
      return !err;
    });
  };

  return GifToWebp;
}();

exports.default = GifToWebp;