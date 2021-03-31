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
        "size-webpack-dom-animation": path.join(
            __dirname,
            "./src/render/dom/features-animation.ts"
        ),
        "size-webpack-dom-max": path.join(
            __dirname,
            "./src/render/dom/features-max.ts"
        ),
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
    },
    devtool: false,
    optimization: {
        usedExports: true,
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
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
