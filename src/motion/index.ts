import {
    ComponentType,
    ReactHTML,
    SVGAttributes,
    DetailedHTMLFactory,
} from "react"
import { elements, HTMLElements, SVGElements } from "./utils/supported-elements"
export { MotionContext } from "./context/MotionContext"
export { MotionValuesMap } from "./utils/use-motion-values"
export { AnimationControls } from "../animation/AnimationControls"
import { MotionProps } from "./types"
import { createMotionComponent } from "./component"

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type UnwrapFactory<F> = F extends DetailedHTMLFactory<infer P, any> ? P : never

export type HTMLMotionComponents = {
    [K in HTMLElements]: ComponentType<
        Omit<UnwrapFactory<ReactHTML[K]>, "style"> & MotionProps
    >
}
export type SVGMotionComponents = {
    [K in SVGElements]: ComponentType<
        Omit<SVGAttributes<SVGElement>, "style"> & MotionProps
    >
}
export type CustomMotionComponent = { custom: typeof createMotionComponent }

export type MotionComponents = CustomMotionComponent &
    HTMLMotionComponents &
    SVGMotionComponents

/**
 * Components optimised for use in gestures and animation.
 *
 * @internalremarks
 * We should look into allowing `dragMomentum` and/or other props to config the `inertia` animation props.
 *
 * @remarks
 * `motion` components offer a simple API for adding gestures and animation.
 *
 * They're optimized for motion to keep interfaces running at a smooth 60fps.
 *
 * ## Animation
 *
 * - TODO
 *
 * ## Gestures
 *
 * - TODO
 *
 * ## Supported elements
 *
 * All HTML and SVG elements are supported.
 *
 * ## Supported values
 *
 * All CSS and SVG properties are supported.
 *
 * ### Transforms
 *
 * Transform values can be animated as separate values:
 * - `x`, `y`, `z`,
 * - `rotate`, `rotateX`, `rotateY`, `rotateZ`,
 * - `scale`, `scaleX`, `scaleY`, `scaleZ`,
 * - `skewX`, `skewY`,
 * - `originX`, `originY`
 * - `perspective`
 *
 * ### Value conversion
 *
 * For HTML elements, `x`, `y`, `width`, `height`, `top`, `left`, `bottom` and `right` can be animated between different value types:
 *
 * ```jsx
 * const variants = {
 *   closed: { x: 0 },
 *   open: { x: 'calc(50vw - 50%)' }
 * }
 * ```
 *
 * ### Path drawing
 *
 * `motion.path` has support for three properties that make it easier to work with path drawing animations than `stroke-dashoffset` and `stroke-dasharray` directly:
 * - `pathLength`
 * - `pathSpacing`
 * - `pathOffset`
 *
 * These are all set as a percentage of the total path length, from `0` to `100`, which is automatically measured by Framer Motion.
 *
 * ```jsx
 * {
 *   empty: { pathLength: 0 },
 *   fill: { pathLength: 100 }
 * }
 * ```
 *
 * @param animate - Either properties to animate to, variant label, array of variant labels, or `AnimationController`
 * @param initial - Properties, variant label or array of variant labels to start in
 * @param variants - Object of variants
 * @param transition - Default transition
 * @param style - Supports `MotionValue`s and separate `transform` values.
 * @param hover - Properties or variant label to animate to while the hover gesture is recognised
 * @param press - Properties or variant label to animate to while the component is pressed
 * @param onAnimationComplete - Callback when animation to `animate` is complete
 * @param onUpdate - Callback with latest motion values, fired once per frame
 * @param onPanStart - Callback when the pan gesture begins on this element
 * @param onPan - Callback when the pan gesture is recognised on this element
 * @param onPanEnd - Callback when the pan gesture ends on this element
 * @param onTapStart - Callback when the tap gesture starts on this element
 * @param onTap - Callback when the tap gesture successfully ends on this element
 * @param onTapCancel - Callback when the tap gesture ends outside this element
 * @param dragEnabled - `true | 'x' | 'y' | 'lockDirection'` Sets which directions the component can be dragged in
 * @param dragConstraints - An object of optional `top`, `left`, `right`, `bottom` pixel values, beyond which dragging is constrained
 * @param dragElastic - The degree of movement allowed outside constraints. Set to `false` for no movement. Defaults to `0.5`
 * @param dragMomentum - Apply momentum from the pan gesture to the component when dragging finishes. Defaults to `true`
 * @param dragPropagation - Allows drag gesture propagation to child components. Defaults to `false`
 * @param render - Set to `false` to block rendering the latest motion values on the component - can be used to temporarily disable animations for performance reasons. Defaults to `true`
 *
 * @public
 */
export const motion = elements.reduce(
    (acc, element) => {
        acc[element] = createMotionComponent(element)
        return acc
    },
    {
        custom: createMotionComponent,
    }
) as MotionComponents
