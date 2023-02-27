import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import replace from "@rollup/plugin-replace"
import dts from "rollup-plugin-dts"
import pkg from "./package.json"

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
]

const pureClass = {
    transform(code) {
        // Replace TS emitted @class function annotations with PURE so terser
        // can remove them
        return code.replace(/\/\*\* @class \*\//g, "/*@__PURE__*/")
    },
}

const umd = Object.assign({}, config, {
    output: {
        file: `dist/${pkg.name}.dev.js`,
        format: "umd",
        name: "Motion",
        exports: "named",
        globals: { react: "React" },
    },
    external: ["react", "react-dom"],
    plugins: [resolve(), replaceSettings("development")],
})

const projection = Object.assign({}, config, {
    input: "lib/projection/index.js",
    output: {
        file: `dist/projection.dev.js`,
        format: "umd",
        name: "Projection",
        exports: "named",
        globals: {
            react: "React",
            "react-dom": "ReactDOM",
        },
    },
    plugins: [resolve(), replaceSettings("development")],
    external: ["react", "react-dom"],
})

const umdProd = Object.assign({}, umd, {
    output: Object.assign({}, umd.output, {
        file: `dist/${pkg.name}.js`,
    }),
    plugins: [
        resolve(),
        replaceSettings("production"),
        pureClass,
        terser({ output: { comments: false } }),
    ],
})

const cjs = Object.assign({}, config, {
    input: ["lib/index.js", "lib/dom-entry.js"],
    output: {
        entryFileNames: `[name].js`,
        dir: "dist/cjs",
        format: "cjs",
        exports: "named",
    },
    plugins: [resolve(), replaceSettings()],
    external,
})

export const es = Object.assign({}, config, {
    input: ["lib/index.js", "lib/dom-entry.js"],
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

const types = {
    input: "types/index.d.ts",
    output: {
        format: "es",
        file: "dist/index.d.ts",
    },
    plugins: [dts()],
}

const animateTypes = {
    input: "types/dom-entry.d.ts",
    output: {
        format: "es",
        file: "dist/dom-entry.d.ts",
    },
    plugins: [dts()],
}

const threeTypes = {
    input: "types/three-entry.d.ts",
    output: {
        format: "es",
        file: "dist/three-entry.d.ts",
    },
    plugins: [dts()],
}

// eslint-disable-next-line import/no-default-export
export default [
    projection,
    umd,
    umdProd,
    cjs,
    es,
    types,
    animateTypes,
    threeTypes,
]
