import * as React from "react"
import { MotionComponentConfig, MotionProps } from "../../motion"
import { useDomVisualElement } from "./use-dom-visual-element"
import { useRender } from "./use-render"
import { createMotionComponent } from "../../motion"
import { HTMLMotionComponents, SVGMotionComponents } from "./types"
import { Drag } from "../../motion/features/drag"
import { Gestures } from "../../motion/features/gestures"
import { Exit } from "../../motion/features/exit"
import { Animation } from "../../motion/features/animation"
import { AnimateLayout } from "../../motion/features/layout/Animate"
import { MeasureLayout } from "../../motion/features/layout/Measure"
import { MotionFeature } from "../../motion/features/types"

/**
 * I'd rather the return type of `custom` to be implicit but this throws
 * incorrect relative paths in the exported types and API Extractor throws
 * a wobbly.
 */
export type CustomDomComponent<Props> = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<Props & MotionProps> &
        React.RefAttributes<SVGElement | HTMLElement>
>

type MotionComponents = HTMLMotionComponents & SVGMotionComponents

const allMotionFeatures = [
    MeasureLayout,
    Animation,
    Drag,
    Gestures,
    Exit,
    AnimateLayout,
]

const domBaseConfig = {
    useVisualElement: useDomVisualElement as any,
    useRender,
}

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
export function createMotionProxy(defaultFeatures: MotionFeature[]) {
    type CustomMotionComponent = {
        custom: typeof custom
    }
    type Motion = MotionComponents & CustomMotionComponent

    const config: MotionComponentConfig<HTMLElement | SVGElement> = {
        ...domBaseConfig,
        defaultFeatures,
    }

    function custom<Props>(
        Component: string | React.ComponentType<Props>
    ): CustomDomComponent<Props> {
        return createMotionComponent(Component, config)
    }

    const componentCache = new Map<string, any>()
    function get(target: CustomMotionComponent, key: string) {
        if (key === "custom") return target.custom

        if (!componentCache.has(key)) {
            componentCache.set(key, createMotionComponent(key, config))
        }

        return componentCache.get(key)
    }

    return new Proxy({ custom }, { get }) as Motion
}

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
export function createDomMotionComponent<T extends keyof MotionComponents>(
    key: T
) {
    const config: MotionComponentConfig<HTMLElement | SVGElement> = {
        ...domBaseConfig,
        defaultFeatures: allMotionFeatures,
    }
    return createMotionComponent(key, config) as MotionComponents[T]
}
