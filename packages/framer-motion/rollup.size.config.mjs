import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import { visualizer } from "rollup-plugin-visualizer"
import { replaceSettings, es } from "./rollup.config.mjs"

const sizePlugins = [
    resolve(),
    replaceSettings("production"),
    terser({ output: { comments: false } }),
]

const external = ["react", "react-dom", "react/jsx-runtime"]

function createSizeBundle(input, output) {
    return Object.assign({}, es, {
        input,
        output: Object.assign({}, es.output, {
            file: output,
            preserveModules: false,
            dir: undefined,
        }),
        plugins: [...sizePlugins, visualizer()],
        external,
        onwarn(warning, warn) {
            if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
                return
            }
            warn(warning)
        },
    })
}

const motion = createSizeBundle(
    "lib/render/components/motion/size.js",
    "dist/size-rollup-motion.js"
)
const m = createSizeBundle(
    "lib/render/components/m/size.js",
    "dist/size-rollup-m.js"
)
const sizeAnimate = createSizeBundle(
    "lib/animation/animate.js",
    "dist/size-rollup-animate.js"
)
const sizeScroll = createSizeBundle(
    "lib/render/dom/scroll/index.js",
    "dist/size-rollup-scroll.js"
)
const sizeFeatherweightAnimate = createSizeBundle(
    "lib/animation/animators/waapi/animate-style.js",
    "dist/size-rollup-waapi-animate.js"
)
const sizeFeatherweightAnimateSequence = createSizeBundle(
    "lib/animation/animators/waapi/animate-sequence.js",
    "dist/size-rollup-waapi-animate-sequence.js"
)

const domAnimation = Object.assign({}, es, {
    input: {
        "size-rollup-dom-animation-m": "lib/render/components/m/size.js",
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
    external,
    onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
            return
        }
        warn(warning)
    },
})

const domMax = Object.assign({}, es, {
    input: {
        "size-rollup-dom-animation-m": "lib/render/components/m/size.js",
        "size-rollup-dom-max": "lib/render/dom/features-max.js",
    },
    output: {
        ...domAnimation.output,
        chunkFileNames: "size-rollup-dom-max-assets.js",
    },
    plugins: sizePlugins,
    external,
    onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
            return
        }
        warn(warning)
    },
})

// eslint-disable-next-line import/no-default-export
export default [
    motion,
    m,
    sizeAnimate,
    sizeScroll,
    sizeFeatherweightAnimate,
    sizeFeatherweightAnimateSequence,
    domAnimation,
    domMax,
]
