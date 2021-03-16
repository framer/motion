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
    entry: {
        "size-webpack-m": path.join(
            __dirname,
            "./src/render/dom/motion-minimal.ts"
        ),
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
    },
    devtool: false,
    optimization: {
        usedExports: true,
        minimize: false,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    extractComments: false,
                    output: { comments: false },
                },
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
