"use strict";

const _require = require(`./index`),
      setActions = _require.setActions;

const _require2 = require(`./plugin-options`),
      setPluginOptions = _require2.setPluginOptions;

exports.onPreBootstrap = ({
  actions
}, pluginOptions) => {
  setActions(actions);
  setPluginOptions(pluginOptions);
};