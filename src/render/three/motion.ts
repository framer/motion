import { Exit } from "../../motion/features/exit"
import { Animation } from "../../motion/features/animation"
import { createMotionProxy } from "../../motion/proxy"
import { createThreeVisualElement } from "./create-visual-element"
import { createThreeUseRender } from "./create-use-render"

interface ThreeMotionComponents {}

const threeFeatures = [
    Animation,
    // Drag,
    // Gestures,
    Exit,
]

/**
 * Components to be used with
 *
 * @public
 */
export const motion = /*@__PURE__*/ createMotionProxy<ThreeMotionComponents>(
    (Component, { forwardMotionProps }) => ({
        defaultFeatures: threeFeatures,
        createVisualElement: createThreeVisualElement(Component),
        useRender: createThreeUseRender(Component, forwardMotionProps),
    })
)
