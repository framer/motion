(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Framer"] = factory();
	else
		root["Framer"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./tsconfig.json":
/*!***********************!*\
  !*** ./tsconfig.json ***!
  \***********************/
/*! exports provided: compilerOptions, compileOnSave, buildOnSave, exclude, filesGlob, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"compilerOptions\":{\"target\":\"es5\",\"module\":\"esnext\",\"moduleResolution\":\"node\",\"isolatedModules\":false,\"importHelpers\":true,\"jsx\":\"react\",\"esModuleInterop\":true,\"experimentalDecorators\":true,\"emitDecoratorMetadata\":true,\"declaration\":true,\"declarationDir\":\"types\",\"outDir\":\"lib\",\"noLib\":false,\"preserveConstEnums\":true,\"suppressImplicitAnyIndexErrors\":true,\"rootDir\":\"src\",\"sourceMap\":true,\"baseUrl\":\"src\",\"paths\":{\"@framer\":[\"../src/index\"],\"@framer/*\":[\"../src/*\"]},\"strictNullChecks\":true,\"noImplicitAny\":true,\"noImplicitThis\":true,\"noImplicitUseStrict\":false,\"noUnusedLocals\":true,\"noUnusedParameters\":true,\"removeComments\":false,\"lib\":[\"es2017\",\"dom\"],\"skipLibCheck\":true,\"downlevelIteration\":true},\"compileOnSave\":false,\"buildOnSave\":false,\"exclude\":[\"node_modules\",\"build\",\"**/__tests__/*\",\"jest.setup.tsx\",\"dev\",\"types\",\"dev/examples.framer\",\"test\",\"skins\",\"dist\",\"temp\",\"api\",\"cypress\"],\"filesGlob\":[\"./src/**/*.ts\"]}");

/***/ }),

/***/ "./webpack.config.size.js":
/*!********************************!*\
  !*** ./webpack.config.size.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__dirname) {const tsconfig = __webpack_require__(/*! ./tsconfig.json */ "./tsconfig.json")
// const TerserPlugin = require("terser-webpack-plugin")

const tsLoader = {
    loader: "ts-loader",
    options: { transpileOnly: true },
}

module.exports = {
    mode: "production",
    entry: path.join(__dirname, "./src/render/dom/motion-minimal"),
    output: {
        path: path.join(__dirname, "./dist"),
        filename: "m-component-size-test.js",
    },
    optimization: {
        // minimize: true,
        // minimizer: [new TerserPlugin()],
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

/* WEBPACK VAR INJECTION */}.call(this, "/"))

/***/ }),

/***/ 0:
/*!*************************************************!*\
  !*** multi configtest ./webpack.config.size.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

!(function webpackMissingModule() { var e = new Error("Cannot find module 'configtest'"); e.code = 'MODULE_NOT_FOUND'; throw e; }());
module.exports = __webpack_require__(/*! /Users/mattperry/Sites/motion/webpack.config.size.js */"./webpack.config.size.js");


/***/ })

/******/ });
});
//# sourceMappingURL=main.debug.js.map