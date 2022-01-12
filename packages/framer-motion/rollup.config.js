import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import replace from "@rollup/plugin-replace"
import pkg from "./package.json"

const config = {
    input: "lib/index.js",
}

const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
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
    plugins: [
        resolve(),
        replace({
            "process.env.NODE_ENV": JSON.stringify("development"),
            preventAssignment: true,
        }),
    ],
})

const projection = Object.assign({}, config, {
    input: "lib/projection/index.js",
    output: {
        file: `dist/projection.dev.js`,
        format: "umd",
        name: "Projection",
        exports: "named",
    },
    plugins: [
        resolve(),
        replace({
            "process.env.NODE_ENV": JSON.stringify("development"),
            preventAssignment: true,
        }),
    ],
    external: ["react", "react-dom"],
})

const umdProd = Object.assign({}, umd, {
    output: Object.assign({}, umd.output, {
        file: `dist/${pkg.name}.js`,
    }),
    plugins: [
        resolve(),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
            preventAssignment: true,
        }),
        pureClass,
        terser({ output: { comments: false } }),
    ],
})

const cjs = Object.assign({}, config, {
    input: ["lib/index.js"],
    output: {
        entryFileNames: `[name].js`,
        dir: "dist/cjs",
        format: "cjs",
        exports: "named",
    },
    plugins: [resolve()],
    external,
})

const es = Object.assign({}, config, {
    input: ["lib/index.js"],
    output: {
        entryFileNames: "[name].mjs",
        format: "es",
        exports: "named",
        preserveModules: true,
        dir: "dist/es",
    },
    plugins: [resolve()],
    external,
})

const sizePlugins = [
    resolve(),
    replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
        preventAssignment: true,
    }),
    terser({ output: { comments: false } }),
]

const m = Object.assign({}, es, {
    input: "lib/render/dom/motion-minimal.js",
    output: Object.assign({}, es.output, {
        file: `dist/size-rollup-m.js`,
        preserveModules: false,
        dir: undefined,
    }),
    plugins: sizePlugins,
    external: ["react", "react-dom"],
})

const domAnimation = Object.assign({}, es, {
    input: {
        "size-rollup-dom-animation": "lib/render/dom/features-animation.js",
    },
    output: {
        format: "es",
        exports: "named",
        preserveModules: false,
        entryFileNames: "[name].js",
        chunkFileNames: "size-rollup-dom-animation-assets.js",
        dir: `dist`,
    },
    plugins: sizePlugins,
    external: ["react", "react-dom"],
})

const domMax = Object.assign({}, es, {
    input: {
        "size-rollup-dom-max": "lib/render/dom/features-max.js",
    },
    output: {
        ...domAnimation.output,
        chunkFileNames: "size-rollup-dom-max-assets.js",
    },
    plugins: sizePlugins,
    external: ["react", "react-dom"],
})

// eslint-disable-next-line import/no-default-export
export default [projection, umd, umdProd, cjs, es, m, domAnimation, domMax]
