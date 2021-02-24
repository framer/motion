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
import { MotionFeature } from "../../motion/features/types"
import { warning } from "hey-listen"

/**
 * I'd rather the return type of `custom` to be implicit but this throws
 * incorrect relative paths in the exported types and API Extractor throws
 * a wobbly.
 */
export type CustomDomComponent<Props> = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<Props & MotionProps> &
        React.RefAttributes<SVGElement | HTMLElement>
>

export interface DomMotionComponentConfig {
    forwardMotionProps?: boolean
}

type MotionComponents = HTMLMotionComponents & SVGMotionComponents

const allMotionFeatures = [
    MeasureLayout,
    Animation,
    Drag,
    Gestures,
    Exit,
    AnimateLayout,
]

/**
 * Convert any React component into a `motion` component. The provided component
 * **must** use `React.forwardRef` to the underlying DOM component you want to animate.
 *
 * ```jsx
 * const Component = React.forwardRef((props, ref) => {
 *   return <div ref={ref} />
 * })
 *
 * const MotionComponent = motion(Component)
 * ```
 *
 * @public
 */
export function createMotionProxy(defaultFeatures: MotionFeature[]) {
    type DeprecatedCustomMotionComponent = {
        custom: typeof custom
    }

    type Motion = typeof custom &
        MotionComponents &
        DeprecatedCustomMotionComponent

    function custom<Props>(
        Component: string | React.ComponentType<Props>,
        { forwardMotionProps = false }: DomMotionComponentConfig = {}
    ): CustomDomComponent<Props> {
        const config: MotionComponentConfig<HTMLElement | SVGElement> = {
            defaultFeatures,
            createVisualElement: createDomVisualElement(Component),
            useRender: createUseRender(Component, forwardMotionProps),
        }

        return createMotionComponent<Props, HTMLElement | SVGElement>(config)
    }

    function deprecatedCustom<Props>(
        Component: string | React.ComponentType<Props>
    ) {
        warning(false, "motion.custom() is deprecated. Use motion() instead.")
        return custom(Component, { forwardMotionProps: true })
    }

    /**
     * A cache of generated `motion` components, e.g `motion.div`, `motion.input` etc.
     * Rather than generating them anew every render.
     */
    const componentCache = new Map<string, any>()

    return new Proxy(custom, {
        /**
         * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
         * The prop name is passed through as `key` and we can use that to generate a `motion`
         * DOM component with that name.
         */
        get: (_target, key: string) => {
            /**
             * Can be removed in 4.0
             */
            if (key === "custom") return deprecatedCustom

            /**
             * If this element doesn't exist in the component cache, create it and cache.
             */
            if (!componentCache.has(key)) {
                componentCache.set(key, custom(key))
            }

            return componentCache.get(key)!
        },
    }) as Motion
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
        createVisualElement: createDomVisualElement(key),
        useRender: createUseRender(key, false),
        defaultFeatures: allMotionFeatures,
    }
    return createMotionComponent(config) as MotionComponents[T]
}
