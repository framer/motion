import { animations } from "../../../motion/features/animations"
import { drag } from "../../../motion/features/drag"
import { gestureAnimations } from "../../../motion/features/gestures"
import { layout } from "../../../motion/features/layout"

export const featureBundle = /* @__PURE__ */ Object.assign(
    {},
    animations,
    gestureAnimations,
    drag,
    layout
)
