import { ComponentType } from "react"
import { Exit } from "../../motion/features/exit"
import { Animation } from "../../motion/features/animation"
import { createMotionProxy } from "../../motion/proxy"
import { createThreeUseRender } from "./create-use-render"
import { threeVisualElement } from "./three-visual-element"
import { ReactThreeFibreComponents } from "./types"
import { MotionProps } from "../../motion/types"

type ThreeMotionComponents = {
    [K in keyof ReactThreeFibreComponents]: ComponentType<
        ReactThreeFibreComponents[K] & MotionProps
    >
}

const threeFeatures = [Animation, Exit]

/**
 * Create `react-three-fiber` motion components.
 *
 * @public
 */
export const motion = /*@__PURE__*/ createMotionProxy<ThreeMotionComponents>(
    (Component, { forwardMotionProps }) => ({
        defaultFeatures: threeFeatures,
        createVisualElement: (_isStatic, options) =>
            threeVisualElement(options, {}),
        useRender: createThreeUseRender(Component, forwardMotionProps),
    })
)
