import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import replace from "@rollup/plugin-replace"
import dts from "rollup-plugin-dts"
import alias from "@rollup/plugin-alias"
import path from "node:path"
import { fileURLToPath } from 'url'
import pkg from "./package.json" with { type: "json"}
import tsconfig from "./tsconfig.json" with {type: "json"}

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
})

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
})

const umdDomProd = Object.assign({}, umd, {
    input: "lib/dom-entry.js",
    output: Object.assign({}, umd.output, {
        file: `dist/dom.js`,
    }),
    plugins: [
        resolve(),
        replaceSettings("production"),
        pureClass,
        shimReactJSXRuntimePlugin,
        terser({ output: { comments: false } }),
    ],
})

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
})


const cjsDom = Object.assign({}, cjs, { input : "lib/dom-entry.js" })

export const es = Object.assign({}, config, {
    input: ["lib/index.js", "lib/dom-entry.js", "lib/projection-entry.js"],
    output: {
        entryFileNames: "[name].mjs",
        format: "es",
        exports: "named",
        preserveModules: true,
        dir: "dist/es",
    },
    plugins: [resolve(), replaceSettings()],
    external,
})

const typePlugins = [dts({compilerOptions: {...tsconfig, baseUrl:"types"}})]

const types = {
    input: "types/index.d.ts",
    output: {
        format: "es",
        file: "dist/index.d.ts",
    },
    plugins: typePlugins,
}

const animateTypes = {
    input: "types/dom-entry.d.ts",
    output: {
        format: "es",
        file: "dist/dom-entry.d.ts",
    },
    plugins: typePlugins,
}

const threeTypes = {
    input: "types/three-entry.d.ts",
    output: {
        format: "es",
        file: "dist/three-entry.d.ts",
    },
    plugins: typePlugins,
}

// eslint-disable-next-line import/no-default-export
export default [
    umd,
    umdProd,
    umdDomProd,
    cjs,
    cjsDom,
    es,
    types,
    animateTypes,
    threeTypes,
]
