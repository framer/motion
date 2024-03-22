import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import { visualizer } from "rollup-plugin-visualizer"
import { replaceSettings, es } from "./rollup.config"

const sizePlugins = [
    resolve(),
    replaceSettings("production"),
    terser({ output: { comments: false } }),
]

const motion = Object.assign({}, es, {
    input: "lib/render/dom/motion.js",
    output: Object.assign({}, es.output, {
        file: `dist/size-rollup-motion.js`,
        preserveModules: false,
        dir: undefined,
    }),
    plugins: [...sizePlugins],
    external: ["react", "react-dom"],
})

const m = Object.assign({}, es, {
    input: "lib/render/dom/motion-minimal.js",
    output: Object.assign({}, es.output, {
        file: `dist/size-rollup-m.js`,
        preserveModules: false,
        dir: undefined,
    }),
    plugins: [...sizePlugins, visualizer()],
    external: ["react", "react-dom"],
})

const sizeAnimate = Object.assign({}, es, {
    input: "lib/animation/animate.js",
    output: Object.assign({}, es.output, {
        file: `dist/size-rollup-animate.js`,
        preserveModules: false,
        dir: undefined,
    }),
    plugins: [...sizePlugins],
    external: ["react", "react-dom"],
})

const domAnimation = Object.assign({}, es, {
    input: {
        "size-rollup-dom-animation-m": "lib/render/dom/motion-minimal.js",
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
    plugins: [...sizePlugins],
    external: ["react", "react-dom"],
})

const domMax = Object.assign({}, es, {
    input: {
        "size-rollup-dom-animation-m": "lib/render/dom/motion-minimal.js",
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
export default [motion, m, domAnimation, domMax, sizeAnimate]
