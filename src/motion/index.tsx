import * as React from "react"
import { createMotionComponent } from "./component"
import { createDomMotionConfig } from "./features/dom"
import { HTMLMotionComponents, SVGMotionComponents } from "./types"

/**
 * These re-exports are to
 */
export { MotionContext } from "./context/MotionContext"
export { MotionValuesMap } from "./utils/use-motion-values"
export { useExternalRef } from "./utils/use-external-ref"
export { ValueAnimationControls } from "../animation/ValueAnimationControls"
export { createMotionComponent }

type Motion = HTMLMotionComponents & SVGMotionComponents

/**
 * Convert any React component into a `motion` component. The provided component
 * **must** use `React.forwardRef` to the underlying DOM component you want to animate.
 *
 * ```jsx
 * const Component = React.forwardRef((props, ref) => {
 *   return <div ref={ref} />
 * })
 *
 * const MotionComponent = motion.custom(Component)
 * ```
 *
 * @public
 */
function custom<Props>(Component: string | React.ComponentType<Props>) {
    return createMotionComponent<Props>(createDomMotionConfig(Component))
}

const componentCache = new Map<string, any>()

/**
 * HTML & SVG components, optimised for use with gestures and animation. These can be used as
 * drop-in replacements for any HTML & SVG component, all CSS & SVG properties are supported.
 *
 * @internalremarks
 *
 * I'd like to make it possible for these to be loaded "on demand" - to reduce bundle size by only
 * including HTML/SVG stylers, animation and/or gesture support when necessary.
 *
 * ```jsx
 * <motion.div animate={{ x: 100 }} />
 *
 * <motion.p animate={{ height: 200 }} />
 *
 * <svg><motion.circle r={10} animate={{ r: 20 }} /></svg>
 * ```
 *
 * @public
 */
export const motion = new Proxy(
    { custom },
    {
        get: (target: any, key: string) => {
            if (key === "custom") return target.custom

            if (!componentCache.has(key)) {
                componentCache.set(
                    key,
                    createMotionComponent(createDomMotionConfig(key))
                )
            }

            return componentCache.get(key)
        },
    }
) as Motion
