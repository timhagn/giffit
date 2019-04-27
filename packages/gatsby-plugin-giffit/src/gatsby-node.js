const {
  setActions,
  // queue: jobQueue,
  // reportError,
} = require(`./index`)

const { setPluginOptions } = require(`./plugin-options`)

exports.onPreBootstrap = ({ actions }, pluginOptions) => {
  setActions(actions)
  setPluginOptions(pluginOptions)
}
