const path = require("path")
const chalk = require("chalk")

const tsLoader = {
    loader: "ts-loader",
    options: { transpileOnly: true },
}

const DEV_SERVER_PORT = 9990

console.log(
    chalk.bold.green(`\nRunning at: http://localhost:${DEV_SERVER_PORT}/\n`)
)

module.exports = {
    mode: "development",
    target: "web",
    entry: {
        framer: [path.join(__dirname, "index")],
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
                test: /\.ts(x?)$/,
                exclude: [/__tests__/, /node_modules/],
                use: [
                    "cache-loader",
                    {
                        loader: require.resolve("babel-loader"),
                    },
                    tsLoader,
                ],
            },
        ],
    },
    resolve: {
        modules: ["node_modules"],
        extensions: [".ts", ".tsx", ".js", ".json"],
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
}
