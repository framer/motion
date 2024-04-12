const webpackPreprocessor = require("@cypress/webpack-preprocessor")
const webpackConfig = require("../../../../dev/webpack/config")

module.exports = (on) => {
    on(
        "file:preprocessor",
        webpackPreprocessor({
            webpackOptions: webpackConfig,
        })
    )
}
