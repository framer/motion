import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import replace from "@rollup/plugin-replace"
import commonjs from "@rollup/plugin-commonjs"
import pkg from "./package.json"
import motionPkg from "../framer-motion/package.json"

const config = {
    input: "lib/index.js",
}

const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(motionPkg.dependencies || {}),
    ...Object.keys(motionPkg.peerDependencies || {}),
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
        commonjs(),
        resolve(),
        replace({
            preventAssignment: true,
            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
    ],
})

const umdProd = Object.assign({}, umd, {
    output: Object.assign({}, umd.output, {
        file: `dist/${pkg.name}.js`,
    }),
    plugins: [
        commonjs(),
        resolve(),
        replace({
            preventAssignment: true,
            "process.env.NODE_ENV": JSON.stringify("production"),
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
    plugins: [commonjs(), resolve()],
    external,
})

// eslint-disable-next-line import/no-default-export
export default [umd, umdProd, cjs, es]
