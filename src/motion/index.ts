import {
    ComponentType,
    ReactHTML,
    SVGAttributes,
    DetailedHTMLFactory,
} from "react"
import { elements, HTMLElements, SVGElements } from "./utils/supported-elements"
import { MotionProps } from "./types"
import { createMotionComponent } from "./component"
export { MotionContext } from "./context/MotionContext"
export { MotionValuesMap } from "./utils/use-motion-values"
export { useExternalRef } from "./utils/use-external-ref"
export { AnimationControls } from "../animation/AnimationControls"
export { createMotionComponent }
export { htmlElements, svgElements } from "./utils/supported-elements"

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
 * HTML & SVG components, optimised for use with gestures and animation.
 *
 * ```jsx
 * <motion.div animate={{ x: 100 }} />
 * ```
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
