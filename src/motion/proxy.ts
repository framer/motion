import { warning } from "hey-listen"
import { createMotionComponent, MotionComponentConfig } from "."

export interface MotionComponentOptions {
    forwardMotionProps?: boolean
}

type CreateConfig<Instance = any, Props = any> = (
    Component: string | React.ComponentType<Props>,
    options: MotionComponentOptions
) => MotionComponentConfig<Instance>

/**
 * Creates a `motion` component for a specific renderer, ie DOM, Three.js etc.
 * Returns a proxied function that can either be used as a function:
 *
 * ```
 * motion('div')
 * motion(Component)
 * ```
 *
 * Or directly as a React component:
 *
 * ```
 * <motion.div />
 * ```
 */
export function createMotionProxy<MotionComponents>(
    createConfig: CreateConfig
) {
    type Motion = typeof create &
        MotionComponents & { custom: typeof deprecatedCreate }

    const create = <Props>(
        Component: string | React.ComponentType<Props>,
        options: MotionComponentOptions = {}
    ) => createMotionComponent(createConfig(Component, options))

    /**
     * Currently accessed with the deprecated `motion.custom` which has
     * the old behaviour of forwarding all `MotionProps` to the generated component.
     */
    const deprecatedCreate = <Props>(
        Component: string | React.ComponentType<Props>
    ) => {
        warning(false, "motion.custom() is deprecated. Use motion() instead.")
        return create(Component, { forwardMotionProps: true })
    }

    /**
     * A cache of generated `motion` components, e.g `motion.div`, `motion.input` etc.
     * Rather than generating them anew every render.
     */
    const componentCache = new Map<string, any>()

    return new Proxy(create, {
        /**
         * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
         * The prop name is passed through as `key` and we can use that to generate a `motion`
         * DOM component with that name.
         */
        get: (_target, key: string) => {
            /**
             * Can be removed in 4.0
             */
            if (key === "custom") return deprecatedCreate

            /**
             * If this element doesn't exist in the component cache, create it and cache.
             */
            if (!componentCache.has(key)) componentCache.set(key, create(key))

            return componentCache.get(key)!
        },
    }) as Motion
}
