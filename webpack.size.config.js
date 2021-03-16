const tsconfig = require("./tsconfig.json")
const path = require("path")
const convertPathsToAliases = require("convert-tsconfig-paths-to-webpack-aliases")
    .default
const TerserPlugin = require("terser-webpack-plugin")

const tsLoader = {
    loader: "ts-loader",
    options: { transpileOnly: true },
}

module.exports = {
    mode: "production",
    entry: path.join(__dirname, "./src/render/dom/motion-minimal.ts"),
    output: {
        path: path.join(__dirname, "dist"),
        filename: "m-component-size-test.js",
    },
    devtool: false,
    optimization: {
        usedExports: true,
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: { output: { comments: false } },
            }),
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
        "@emotion/is-prop-valid": {
            root: "@emotion/is-prop-valid",
            commonjs2: "@emotion/is-prop-valid",
            commonjs: "@emotion/is-prop-valid",
            amd: "@emotion/is-prop-valid",
        },
    },
    resolve: {
        modules: ["node_modules"],
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: convertPathsToAliases(tsconfig),
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: [/__tests__/, /node_modules/],
                use: [tsLoader],
            },
        ],
    },
}

// const path = require("path")
// const execSync = require("child_process").execSync
// const webpack = require("webpack")
// const TerserPlugin = require("terser-webpack-plugin")
// const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
// const convertPathsToAliases = require("convert-tsconfig-paths-to-webpack-aliases")
//     .default
// const tsconfig = require("./tsconfig.json")

// const BUILD_TYPE = process.env.BUILD_TYPE || "debug"
// const GIT_DESCRIBE = execSync("git describe --always --dirty").toString().trim()
// const isProduction = BUILD_TYPE === "production"

// const tsLoader = {
//     loader: "ts-loader",
//     options: { transpileOnly: true },
// }

// const config = {
//     mode: isProduction ? "production" : "development",
//     target: "web",
//     entry: {
//         framer: [path.join(__dirname, "./src/index")],
//     },
//     output: {
//         path: path.join(__dirname, "build"),
//         filename: isProduction ? "[name].js" : "[name].debug.js",
//         library: "Framer",
//         libraryTarget: "umd",
//     },
//     devtool: isProduction ? "source-map" : "#cheap-module-source-map",
//     module: {
//         rules: [
//             {
//                 test: /\.ts(x?)$/,
//                 exclude: [/__tests__/, /node_modules/],
//                 use: isProduction ? [tsLoader] : ["cache-loader", tsLoader],
//             },
//         ],
//     },
//     resolve: {
//         modules: ["node_modules"],
//         extensions: [".ts", ".tsx", ".js", ".json"],
//         alias: convertPathsToAliases(tsconfig),
//     },
//     performance: {
//         hints: false,
//     },
//     plugins: [
//         new webpack.DefinePlugin({
//             "process.env.BUILD_NAME": JSON.stringify("framer"),
//             "process.env.BUILD_HASH": JSON.stringify(GIT_DESCRIBE),
//             "process.env.BUILD_TYPE": JSON.stringify(BUILD_TYPE),
//             "process.env.BUILD_DATE": JSON.stringify(new Date().toISOString()),
//             "process.env.NODE_ENV": JSON.stringify(BUILD_TYPE),
//         }),
//     ],
// }

// if (!isProduction) {
//     config.plugins.push(new ForkTsCheckerWebpackPlugin())
// }

// if (isProduction) {
//     config.devtool = "source-map"
//     config.optimization = {
//         minimize: true,
//         minimizer: [new TerserPlugin()],
//     }
// }

// module.exports = config
