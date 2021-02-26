import { MeasureLayout } from "../../motion/features/layout/Measure"
import { createMotionProxy } from "../../motion/proxy"
import { createDomVisualElement } from "./create-dom-visual-element"
import { createUseRender } from "./use-render"
import { DomMotionComponents } from "./types"

/**
 * @public
 */
export const m = /*@__PURE__*/ createMotionProxy<DomMotionComponents>(
    (Component, { forwardMotionProps }) => ({
        defaultFeatures: [MeasureLayout],
        createVisualElement: createDomVisualElement(Component),
        useRender: createUseRender(Component, forwardMotionProps),
    })
)
