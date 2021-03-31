const path = require("path")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const convertPathsToAliases = require("convert-tsconfig-paths-to-webpack-aliases")
    .default
const chalk = require("chalk")
const tsconfig = require("../../tsconfig.json")
const webpack = require("webpack")
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")

const tsLoader = {
    loader: "ts-loader",
    options: { transpileOnly: true },
}

const DEV_SERVER_PORT = 9990

console.log(
    chalk.bold.green(`\nRunning at: http://0.0.0.0:${DEV_SERVER_PORT}/\n`)
)

module.exports = {
    mode: "development",
    target: "web",
    entry: {
        framer: [
            path.join(__dirname, "..", "..", "src", "index"),
            path.join(__dirname, "index"),
        ],
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "[name].debug.js",
        library: "Framer",
        libraryTarget: "umd",
    },
    devtool: "eval-cheap-source-map",
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                exclude: [/__tests__/, /node_modules/],
                use: [
                    "cache-loader",
                    {
                        loader: require.resolve("babel-loader"),
                        options: {
                            plugins: [
                                require.resolve("react-refresh/babel"),
                            ].filter(Boolean),
                        },
                    },
                    tsLoader,
                ],
            },
        ],
    },
    resolve: {
        modules: ["node_modules"],
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: convertPathsToAliases(tsconfig),
        fallback: {
            path: require.resolve("path-browserify"),
        },
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
    devServer: {
        contentBase: path.join(__dirname),
        hot: true,
        inline: false,
        stats: "errors-only",
        port: DEV_SERVER_PORT,
    },
    plugins: [
        new ReactRefreshWebpackPlugin(),
        new ForkTsCheckerWebpackPlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ],
}
