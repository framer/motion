import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import replace from "@rollup/plugin-replace"
import dts from "rollup-plugin-dts"
import alias from "@rollup/plugin-alias"
import path from "node:path"
import { fileURLToPath } from 'url'
import pkg from "./package.json" with { type: "json"}
import tsconfig from "./tsconfig.json" with {type: "json"}
import preserveDirectives from "rollup-plugin-preserve-directives";

const config = {
    input: "lib/index.js",
}

export const replaceSettings = (env) => {
    const replaceConfig = env
        ? {
              "process.env.NODE_ENV": JSON.stringify(env),
              preventAssignment: false,
          }
        : {
              preventAssignment: false,
          }

    replaceConfig.__VERSION__ = `${pkg.version}`

    return replace(replaceConfig)
}

const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
    "react/jsx-runtime",
]

const pureClass = {
    transform(code) {
        // Replace TS emitted @class function annotations with PURE so terser
        // can remove them
        return code.replace(/\/\*\* @class \*\//g, "/*@__PURE__*/")
    },
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shimReactJSXRuntimePlugin = alias({
    entries: [
        { find: 'react/jsx-runtime', replacement: path.resolve(__dirname, '../../dev/inc/jsxRuntimeShim.js') }
    ]
});

const umd = Object.assign({}, config, {
    output: {
        file: `dist/${pkg.name}.dev.js`,
        format: "umd",
        name: "Motion",
        exports: "named",
        globals: { react: "React", "react/jsx-runtime": "jsxRuntime" },
    },
    external: ["react", "react-dom"],
    plugins: [resolve(), replaceSettings("development"), shimReactJSXRuntimePlugin],
    onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
        }
        warn(warning)
    }
})

function createUmd(input, file) {
    return Object.assign({}, umd, {
        input,
        output: Object.assign({}, umd.output, {
            file
        }),
        plugins: [
            resolve(),
            replaceSettings("production"),
            pureClass,
            shimReactJSXRuntimePlugin,
            terser({ output: { comments: false } }),
        ],
        onwarn(warning, warn) {
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                return
            }
            warn(warning)
        }
    })
}

const umdProd = Object.assign({}, umd, {
    output: Object.assign({}, umd.output, {
        file: `dist/${pkg.name}.js`,
    }),
    plugins: [
        resolve(),
        replaceSettings("production"),
        pureClass,
        shimReactJSXRuntimePlugin,
        terser({ output: { comments: false } }),
    ],
    onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
        }
        warn(warning)
    }
})

const umdMiniProd = createUmd("lib/mini.js", `dist/mini.js`)
const umdDomProd = createUmd("lib/dom.js", `dist/dom.js`)
const umdDomMiniProd = createUmd("lib/dom-mini.js", `dist/dom-mini.js`)

const cjs = Object.assign({}, config, {
    input: "lib/index.js",
    output: {
        entryFileNames: `[name].js`,
        dir: "dist/cjs",
        format: "cjs",
        exports: "named",
        esModule: true
    },
    plugins: [resolve(), replaceSettings()],
    external,
    onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
        }
        warn(warning)
    }
})

/**
 * Bundle seperately so bundles don't share common modules
 */
const cjsDom = Object.assign({}, cjs, { input : "lib/dom.js" })
const cjsMini = Object.assign({}, cjs, { input : "lib/mini.js" })
const cjsDomMini = Object.assign({}, cjs, { input : "lib/dom-mini.js" })
const cjsClient = Object.assign({}, cjs, { input : "lib/client.js" })
const cjsM = Object.assign({}, cjs, { input : "lib/m.js" })

export const es = Object.assign({}, config, {
    input: ["lib/index.js", "lib/mini.js", "lib/dom.js", "lib/dom-mini.js", "lib/client.js", "lib/m.js","lib/projection.js"],
    output: {
        entryFileNames: "[name].mjs",
        format: "es",
        exports: "named",
        preserveModules: true,
        dir: "dist/es",
    },
    plugins: [resolve(), replaceSettings(), preserveDirectives()],
    external,
    onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
        }
        warn(warning)
    }
})

const typePlugins = [dts({compilerOptions: {...tsconfig, baseUrl:"types"}})]

function createTypes(input, file) {   
    return {
        input,
        output: {
            format: "es",
            file: file,
        },
        plugins: typePlugins,
    }
}


const types = createTypes("types/index.d.ts", "dist/index.d.ts")
const miniTypes = createTypes("types/mini.d.ts", "dist/mini.d.ts")
const animateTypes = createTypes("types/dom.d.ts", "dist/dom.d.ts")
const animateMiniTypes = createTypes("types/dom-mini.d.ts", "dist/dom-mini.d.ts")
const mTypes = createTypes("types/m.d.ts", "dist/m.d.ts")
const clientTypes = createTypes("types/client.d.ts", "dist/client.d.ts")
const threeTypes = createTypes("types/three.d.ts", "dist/three.d.ts")

// eslint-disable-next-line import/no-default-export
export default [
    umd,
    umdProd,
    umdMiniProd,
    umdDomProd,
    umdDomMiniProd,
    cjs,
    cjsMini,
    cjsDom,
    cjsDomMini,
    cjsClient,
    cjsM,
    es,
    types,
    mTypes,
    miniTypes,
    clientTypes,
    animateTypes,
    animateMiniTypes,
    threeTypes,
]
