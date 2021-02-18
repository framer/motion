import * as React from "react"
import { createContext, useContext, useMemo } from "react"
import { MotionFeature } from "../features/types"
import { TransformPoint2D } from "../../types/geometry"
import { Transition } from "../../types"

/**
 * @public
 */
export interface MotionConfigContext {
    /**
     * @internal
     */
    transformPagePoint: TransformPoint2D

    /**
     * An array of features to provide to children.
     *
     * @public
     */
    features: MotionFeature[]

    /**
     * Determines whether this is a static context ie the Framer canvas. If so,
     * it'll disable all dynamic functionality.
     *
     * @internal
     */
    isStatic: boolean

    /**
     * Defines a new default transition for the entire tree.
     *
     * @public
     */
    transition?: Transition
}

export interface MotionConfigProps extends Partial<MotionConfigContext> {
    children?: React.ReactNode
}

/**
 * @public
 */
export const MotionConfigContext = createContext<MotionConfigContext>({
    transformPagePoint: (p) => p,
    features: [],
    isStatic: false,
})

/**
 * MotionConfig can be used in combination with the `m` component to cut bundle size
 * and dynamically load only the features you use.
 *
 * ```jsx
 * import {
 *   m as motion,
 *   AnimationFeature,
 *   MotionConfig
 * } from "framer-motion"
 *
 * export function App() {
 *   return (
 *     <MotionConfig features={[AnimationFeature]}>
 *       <motion.div animate={{ x: 100 }} />
 *     </MotionConfig>
 *   )
 * }
 * ```
 *
 * @public
 */
export function MotionConfig({
    children,
    features = [],
    transition,
    ...props
}: MotionConfigProps) {
    const pluginContext = useContext(MotionConfigContext)
    const loadedFeatures = [
        ...new Set([...pluginContext.features, ...features]),
    ]

    // We do want to rerender children when the number of loaded features changes
    const value = useMemo(
        () => ({
            features: loadedFeatures,
            transition: transition || pluginContext.transition,
        }),
        [loadedFeatures.length, transition]
    ) as MotionConfigContext

    // Mutative to prevent triggering rerenders in all listening
    // components every time this component renders
    for (const key in props) {
        value[key] = props[key]
    }

    return (
        <MotionConfigContext.Provider value={value}>
            {children}
        </MotionConfigContext.Provider>
    )
}
