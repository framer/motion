path = require("path")
execSync = require("child_process").execSync
webpack = require("webpack")
UglifyJSPlugin = require("uglifyjs-webpack-plugin")
ProgressBarPlugin = require("progress-bar-webpack-plugin")
ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
convertPathsToAliases = require("convert-tsconfig-paths-to-webpack-aliases").default
tsconfig = require("./tsconfig.json")

const BUILD_TYPE = process.env.BUILD_TYPE || "debug"
const GIT_DESCRIBE = execSync("git describe --always --dirty")
    .toString()
    .trim()
const isProduction = BUILD_TYPE === "production"

const tsLoader = {
    loader: "ts-loader",
    options: { transpileOnly: true },
}

const config = {
    mode: isProduction ? "production" : "development",
    target: "web",
    entry: {
        framer: [path.join(__dirname, "./src/loader"), path.join(__dirname, "./src/index")],
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: isProduction ? "[name].js" : "[name].debug.js",
        library: "Framer",
        libraryTarget: "umd",
    },
    devtool: isProduction ? "source-map" : "#cheap-module-source-map",
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: [/__tests__/, /node_modules/],
                use: isProduction ? [tsLoader] : ["cache-loader", tsLoader],
            },
        ],
    },
    externals: {
        react: {
            root: "React",
            commonjs2: "react",
            commonjs: "react",
            amd: "react",
        },
        "react-dom": {
            root: "ReactDOM",
            commonjs2: "ReactDOM",
            commonjs: "ReactDOM",
            amd: "ReactDOM",
        },
    },
    resolve: {
        modules: ["node_modules"],
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: convertPathsToAliases(tsconfig),
    },
    performance: {
        hints: false,
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.BUILD_NAME": JSON.stringify("framer"),
            "process.env.BUILD_HASH": JSON.stringify(GIT_DESCRIBE),
            "process.env.BUILD_TYPE": JSON.stringify(BUILD_TYPE),
            "process.env.BUILD_DATE": JSON.stringify(new Date().toISOString()),
            "process.env.NODE_ENV": JSON.stringify(BUILD_TYPE),
        }),
    ],
}

if (!isProduction) {
    config.plugins.push(new ForkTsCheckerWebpackPlugin())
}

if (isProduction) {
    config.devtool = "source-map"
    config.optimization = {
        minimizer: [
            new UglifyJSPlugin({
                parallel: true,
                sourceMap: true,
                uglifyOptions: {
                    ecma: 6,
                    mangle: {
                        safari10: true,
                        keep_classnames: true,
                    },
                    compress: {
                        warnings: false,
                        conditionals: true,
                        unused: true,
                        comparisons: true,
                        dead_code: true,
                        evaluate: true,
                        if_return: true,
                        join_vars: true,
                        keep_classnames: true,
                    },
                    output: {
                        safari10: true,
                        beautify: false,
                        comments: false,
                    },
                },
            }),
        ],
    }
}

module.exports = config
