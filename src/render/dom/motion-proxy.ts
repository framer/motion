import * as React from "react"
import { DOMMotionComponents } from "./types"
import { HTMLRenderState } from "../html/types"
import { SVGRenderState } from "../svg/types"
import { MotionProps } from "../../motion/types"
import { createMotionComponent, MotionComponentConfig } from "../../motion"

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

export interface CustomMotionComponentConfig {
    forwardMotionProps?: boolean
}

export type CreateConfig = <Instance, RenderState, Props>(
    Component: string | React.ComponentType<Props>,
    config: CustomMotionComponentConfig
) => MotionComponentConfig<Instance, RenderState>

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
export function createMotionProxy(createConfig: CreateConfig) {
    function custom<Props>(
        Component: string | React.ComponentType<Props>,
        customMotionComponentConfig: CustomMotionComponentConfig = {}
    ): CustomDomComponent<Props> {
        return createMotionComponent<
            Props,
            HTMLElement | SVGElement,
            HTMLRenderState | SVGRenderState
        >(createConfig(Component, customMotionComponentConfig))
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
             * If this element doesn't exist in the component cache, create it and cache.
             */
            if (!componentCache.has(key)) {
                componentCache.set(key, custom(key))
            }

            return componentCache.get(key)!
        },
    }) as typeof custom & DOMMotionComponents
}
