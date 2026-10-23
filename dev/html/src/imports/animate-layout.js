import {
    LayoutAnimationBuilder,
    animateLayout,
    createGPULayout,
    frame,
    animate,
    quadLayout,
    setLayoutEngine,
} from "framer-motion/dom"

/**
 * ?engine=gpu runs the page with the WebGPU layout engine.
 */
const engine =
    new URLSearchParams(location.search).get("engine") === "gpu"
        ? createGPULayout()
        : undefined
engine && setLayoutEngine(engine)

window.AnimateLayout = {
    animateLayout,
    LayoutAnimationBuilder,
    frame,
    animate,
    engine,
    quadLayout,
    setLayoutEngine,
}
