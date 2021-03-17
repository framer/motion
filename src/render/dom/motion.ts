import { DOMMotionComponents } from "./types"
import { createMotionComponent } from "../../motion"
import { createMotionProxy } from "./motion-proxy"
import { createDomMotionConfig } from "./utils/create-config"
import { gestureAnimations } from "../../motion/features/gestures"
import { animations } from "../../motion/features/animations"
import { drag } from "../../motion/features/drag"
import { layoutAnimations } from "../../motion/features/layout"
import { FeatureComponents } from "../../motion/features/types"
import { createDomVisualElement } from "./create-visual-element"

const featureBundle: FeatureComponents = {
    ...animations,
    ...gestureAnimations,
    ...drag,
    ...layoutAnimations,
}

/**
 * HTML & SVG components, optimised for use with gestures and animation. These can be used as
 * drop-in replacements for any HTML & SVG component, all CSS & SVG properties are supported.
 *
 * @public
 */
export const motion = /*@__PURE__*/ createMotionProxy(
    (Component, config) =>
        createDomMotionConfig(
            Component,
            config,
            featureBundle,
            createDomVisualElement
        ) as any
)

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
    return createMotionComponent(
        createDomMotionConfig(
            key,
            { forwardMotionProps: false },
            featureBundle,
            createDomVisualElement
        ) as any
    ) as DOMMotionComponents[T]
}
