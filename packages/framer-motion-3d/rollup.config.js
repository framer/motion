import resolve from "@rollup/plugin-node-resolve"
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
export default [cjs, es]
