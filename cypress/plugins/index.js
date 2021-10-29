const webpackPreprocessor = require("@cypress/webpack-preprocessor")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const webpackConfig = require("../../dev/webpack/config")

// don't need extra TS checker as part of Cypress
webpackConfig.plugins = webpackConfig.plugins.filter(
    (plugin) => !(plugin instanceof ForkTsCheckerWebpackPlugin)
)

module.exports = (on) => {
    on(
        "file:preprocessor",
        webpackPreprocessor({
            webpackOptions: webpackConfig,
        })
    )
}
