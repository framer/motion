import { MeasureLayout } from "../../motion/features/layout/Measure"
import { createMotionProxy } from "../../motion/proxy"
import { createDomVisualElement } from "./create-dom-visual-element"
import { createUseRender } from "./use-render"

/**
 * @public
 */
export const m = /*@__PURE__*/ createMotionProxy(
    (Component, { forwardMotionProps }) => ({
        defaultFeatures: [MeasureLayout],
        createVisualElement: createDomVisualElement(Component),
        useRender: createUseRender(Component, forwardMotionProps),
    })
)
