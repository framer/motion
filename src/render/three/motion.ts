import { Exit } from "../../motion/features/exit"
import { Animation } from "../../motion/features/animation"
import { createMotionProxy } from "../../motion/proxy"
import { createThreeUseRender } from "./create-use-render"
import { threeVisualElement } from "./three-visual-element"
import { ReactThreeFibreComponents } from "./types"

type ThreeMotionComponentNames = keyof ReactThreeFibreComponents

type ThreeMotionComponents = {
    [K in ThreeMotionComponentNames]: React.Component<
        ReactThreeFibreComponents[K]
    >
}

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
        createVisualElement: (_isStatic, options) =>
            threeVisualElement(options, {}),
        useRender: createThreeUseRender(Component, forwardMotionProps),
    })
)
