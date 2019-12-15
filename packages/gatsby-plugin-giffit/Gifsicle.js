"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/**
 * This streaming adaption of `gifsicle` is based on `gifsicle-stream`, created
 * by Hung Tran <oohnoitz@gmail.com> in 2015. I updated it to newer standards,
 * changed its tests from mocha to jest and am expanding on it for `giffit`.
 *
 * @see https://github.com/oohnoitz/node-gifsicle-stream
 * @see ./LICENSE_GIFSICLE_STREAM
 */
var memoize = require("memoizee");

var Stream = require("stream").Stream;

var spawn = require('child_process').spawn;

var which = require('which');
/**
 * This class wraps the `gifsicle` command line utility in a data stream.
 */


var Gifsicle =
/*#__PURE__*/
function (_Stream) {
  (0, _inheritsLoose2["default"])(Gifsicle, _Stream);

  function Gifsicle(args) {
    var _this;

    _this = _Stream.call(this) || this;
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "findBinary", memoize(function (callback) {
      which("gifsicle", function (err, path) {
        if (err) {
          path = require('gifsicle');
        }

        if (path) {
          callback(null, path);
        } else {
          callback(new Error('Unable to locate the gifsicle binary file.'));
        }
      });
    }));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_error", function (msg) {
      if (!_this.hasEnded) {
        _this.hasEnded = true;

        _this.cleanUp();

        _this.emit('error', msg);
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "write", function (chunk) {
      if (_this.hasEnded) {
        return;
      }

      if (_this.process) {
        _this.process.stdin.write(chunk);
      } else {
        if (!_this.bufferedChunks) {
          _this.bufferedChunks = [];

          _this.findBinary(function (err, binary) {
            if (_this.hasEnded) {
              return;
            }

            if (err) {
              return _this._error(err);
            }

            _this.seenDataOnStdout = false;
            _this.process = spawn(binary, _this.args); // error

            _this.process.on('error', _this._error);

            _this.process.stdin.on('error', function () {}); // exit


            _this.process.on('exit', function (exitCode) {
              if (exitCode > 0 && !_this.hasEnded) {
                _this._error(new Error("The gifsicle process exited with a non-zero exit code: " + exitCode));
              }

              _this.hasEnded = true;
            }); // stdout


            _this.process.stdout.on('data', function (chunk) {
              _this.seenDataOnStdout = true;

              _this.emit('data', chunk);
            }).on('end', function () {
              _this.process = null;

              if (!_this.hasEnded) {
                if (_this.seenDataOnStdout) {
                  _this.emit('end');
                } else {
                  _this._error(new Error('Gifsicle: STDOUT stream ended without emitting any data.'));
                }

                _this.hasEnded = true;
              }
            });

            if (_this.isPaused) {
              _this.process.stdout.pause();
            }

            _this.bufferedChunks.forEach(function (chunk) {
              if (chunk === null) {
                _this.process.stdin.end();
              } else {
                _this.process.stdin.write(chunk);
              }
            });

            _this.bufferedChunks = null;
          });
        }

        _this.bufferedChunks.push(chunk);
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "cleanUp", function () {
      if (this.process) {
        this.process.kill();
        this.process = null;
      }

      this.bufferedChunks = null;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "destroy", function () {
      if (!_this.hasEnded) {
        _this.hasEnded = true;

        _this.cleanUp();
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "end", function (chunk) {
      if (chunk) {
        _this.write(chunk);
      }

      if (_this.process) {
        _this.process.stdin.end();
      } else {
        if (_this.bufferedChunks) {
          _this.bufferedChunks.push(null);
        } else {
          _this.write(new Buffer(0));
        }
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "pause", function () {
      if (_this.process) {
        _this.process.stdout.pause();
      }

      _this.isPaused = true;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "resume", function () {
      if (_this.process) {
        _this.process.stdout.resume();
      }

      _this.isPaused = false;
    });
    _this.args = args;
    _this.writable = true;
    _this.readable = true;
    _this.hasEnded = false;
    return _this;
  }

  return Gifsicle;
}(Stream);

exports["default"] = Gifsicle;