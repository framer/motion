import { createDomVisualElement } from "./create-dom-visual-element"
import { createUseRender } from "./use-render"
import { DOMMotionComponents } from "./types"
import { MotionComponentConfig, createMotionComponent } from "../../motion"
import { Drag } from "../../motion/features/drag"
import { Gestures } from "../../motion/features/gestures"
import { Exit } from "../../motion/features/exit"
import { Animation } from "../../motion/features/animation"
import { AnimateLayout } from "../../motion/features/layout/Animate"
import { MeasureLayout } from "../../motion/features/layout/Measure"
import { createMotionProxy } from "./motion-proxy"
import { scrapeMotionValuesFromProps as scrapeHTMLMotionValues } from "../html/utils/scrape-motion-values"

const allMotionFeatures = [
    MeasureLayout,
    Animation,
    Drag,
    Gestures,
    Exit,
    AnimateLayout,
]

/**
 * HTML & SVG components, optimised for use with gestures and animation. These can be used as
 * drop-in replacements for any HTML & SVG component, all CSS & SVG properties are supported.
 *
 * @public
 */
export const motion = /*@__PURE__*/ createMotionProxy(allMotionFeatures)

/**
 * Create a DOM `motion` component with the provided string. This is primarily intended
 * as a full alternative to `motion` for consumers who have to support environments that don't
 * support `Proxy`.
 *
 * ```javascript
 * import { createDomMotionComponent } from "framer-motion"
 *
 * const motion = {
 *   div: createDomMotionComponent('div')
 * }
 * ```
 *
 * @public
 */
export function createDomMotionComponent<T extends keyof DOMMotionComponents>(
    key: T
) {
    const config: MotionComponentConfig<HTMLElement | SVGElement> = {
        createVisualElement: createDomVisualElement(key),
        useRender: createUseRender(key, false),
        defaultFeatures: allMotionFeatures,
        scrapeMotionValuesFromProps: scrapeHTMLMotionValues,
    }
    return createMotionComponent(config) as DOMMotionComponents[T]
}
