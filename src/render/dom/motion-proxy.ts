import { warning } from "hey-listen"
import { createMotionComponent, MotionProps } from "../../motion"
import { MotionFeature } from "../../motion/features/types"
import { DOMMotionComponents } from "./types"
import { createDomMotionConfig } from "./utils/create-config"
import { HTMLRenderState } from "../html/types"
import { SVGRenderState } from "../svg/types"

/**
 * I'd rather the return type of `custom` to be implicit but this throws
 * incorrect relative paths in the exported types and API Extractor throws
 * a wobbly.
 *
 * @internal
 */
export type CustomDomComponent<Props> = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<Props & MotionProps> &
        React.RefAttributes<SVGElement | HTMLElement>
>

export interface DomMotionComponentConfig {
    forwardMotionProps?: boolean
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
        DOMMotionComponents &
        DeprecatedCustomMotionComponent

    function custom<Props>(
        Component: string | React.ComponentType<Props>,
        { forwardMotionProps = false }: DomMotionComponentConfig = {}
    ): CustomDomComponent<Props> {
        return createMotionComponent<
            Props,
            HTMLElement | SVGElement,
            HTMLRenderState | SVGRenderState
        >(createDomMotionConfig(defaultFeatures, Component, forwardMotionProps))
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
