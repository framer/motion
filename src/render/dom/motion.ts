import * as React from "react"
import { createDomVisualElement } from "./create-dom-visual-element"
import { createUseRender } from "./use-render"
import { HTMLMotionComponents, SVGMotionComponents } from "./types"
import {
    MotionComponentConfig,
    MotionProps,
    createMotionComponent,
} from "../../motion"
import { Drag } from "../../motion/features/drag"
import { Gestures } from "../../motion/features/gestures"
import { Exit } from "../../motion/features/exit"
import { Animation } from "../../motion/features/animation"
import { AnimateLayout } from "../../motion/features/layout/Animate"
import { MeasureLayout } from "../../motion/features/layout/Measure"
import { createMotionProxy } from "../../motion/proxy"

/**
 * I'd rather the return type of `custom` to be implicit but this throws
 * incorrect relative paths in the exported types and API Extractor throws
 * a wobbly.
 */
export type CustomDomComponent<Props> = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<Props & MotionProps> &
        React.RefAttributes<SVGElement | HTMLElement>
>

type DomMotionComponents = HTMLMotionComponents & SVGMotionComponents

const domMotionFeatures = [
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
export const motion = /*@__PURE__*/ createMotionProxy<DomMotionComponents>(
    (Component, { forwardMotionProps }) => ({
        defaultFeatures: domMotionFeatures,
        createVisualElement: createDomVisualElement(Component),
        useRender: createUseRender(Component, forwardMotionProps),
    })
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
export function createDomMotionComponent<T extends keyof DomMotionComponents>(
    key: T
) {
    const config: MotionComponentConfig<HTMLElement | SVGElement> = {
        createVisualElement: createDomVisualElement(key),
        useRender: createUseRender(key, false),
        defaultFeatures: domMotionFeatures,
    }
    return createMotionComponent(config) as DomMotionComponents[T]
}
