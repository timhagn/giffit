"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _ = require("lodash");

var ProgressBar = require("progress");

var _require = require("fs"),
    existsSync = _require.existsSync;

var queue = require("async/queue");

var _require2 = require("./process-file"),
    processFile = _require2.processFile;

var toProcess = {};
var totalJobs = 0;
var q = queue(function (task, callback) {
  task(callback);
}, 1);
var bar = new ProgressBar("Processing animated GIFs [:bar] :current/:total :elapsed secs :percent", {
  total: 0,
  width: 30
});

exports.scheduleJob =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(job, actions, pluginOptions, reportStatus) {
    var inputFileKey, outputFileKey, jobPath, isQueued, deferred;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (reportStatus === void 0) {
              reportStatus = true;
            }

            inputFileKey = job.inputPath.replace(/\./g, "%2E");
            outputFileKey = job.outputPath.replace(/\./g, "%2E");
            jobPath = inputFileKey + "." + outputFileKey; // Check if the job has already been queued. If it has, there's nothing
            // to do, return.

            if (!_.has(toProcess, jobPath)) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return", _.get(toProcess, jobPath + ".deferred.promise"));

          case 6:
            if (!existsSync(job.outputPath)) {
              _context.next = 8;
              break;
            }

            return _context.abrupt("return", Promise.resolve(job));

          case 8:
            isQueued = false;

            if (toProcess[inputFileKey]) {
              isQueued = true;
            } // deferred naming comes from https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred


            deferred = {};
            deferred.promise = new Promise(function (resolve, reject) {
              deferred.resolve = resolve;
              deferred.reject = reject;
            });
            totalJobs += 1;

            _.set(toProcess, jobPath, {
              job: job,
              deferred: deferred
            });

            if (!isQueued) {
              q.push(function (cb) {
                runJobs(inputFileKey, actions, pluginOptions, reportStatus, cb);
              });
            }

            return _context.abrupt("return", deferred.promise);

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

function runJobs(inputFileKey, actions, pluginOptions, reportStatus, cb) {
  var jobs = _.values(toProcess[inputFileKey]);

  var findDeferred = function findDeferred(job) {
    return jobs.find(function (j) {
      return j.job === job;
    }).deferred;
  };

  var job = jobs[0].job; // Delete the input key from the toProcess list so more jobs can be queued.

  delete toProcess[inputFileKey];
  actions.createJob({
    id: "processing image " + job.inputPath,
    imagesCount: _.values(toProcess[inputFileKey]).length
  }, {
    name: "gatsby-plugin-giffit"
  }); // We're now processing the file's jobs.

  var imagesFinished = 0;
  bar.total = totalJobs;

  try {
    var promises = processFile(job.inputPath, jobs.map(function (job) {
      return job.job;
    }), pluginOptions).map(function (promise) {
      return promise.then(function (job) {
        findDeferred(job).resolve();
      })["catch"](function (err) {
        findDeferred(job).reject({
          err: err,
          message: "Failed to process image " + job.inputPath
        });
      }).then(function () {
        imagesFinished += 1; // only show progress on build
        // if (reportStatus) {

        bar.tick(); // }

        actions.setJob({
          id: "processing image " + job.inputPath,
          imagesFinished: imagesFinished
        }, {
          name: "gatsby-plugin-giffit"
        });
      });
    });
    Promise.all(promises).then(function () {
      actions.endJob({
        id: "processing image " + job.inputPath
      }, {
        name: "gatsby-plugin-giffit"
      });
      cb();
    });
  } catch (err) {
    jobs.forEach(function (_ref2) {
      var deferred = _ref2.deferred;
      deferred.reject({
        err: err,
        message: err.message
      });
    });
  }
}