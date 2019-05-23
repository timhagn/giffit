"use strict";

var _require = require("./index"),
    setActions = _require.setActions;

var _require2 = require("./plugin-options"),
    setPluginOptions = _require2.setPluginOptions;

exports.onPreBootstrap = function (_ref, pluginOptions) {
  var actions = _ref.actions;
  setActions(actions);
  setPluginOptions(pluginOptions);
};