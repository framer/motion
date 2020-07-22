import * as React from "react"
import { createContext, useContext, useMemo } from "react"
import { MotionFeature } from "../features/types"
import { TransformPoint2D } from "../../types/geometry"

export interface MotionConfigContext {
    transformPagePoint: TransformPoint2D
    features: MotionFeature[]
}

export interface MotionConfigProps extends Partial<MotionConfigContext> {
    children?: React.ReactNode
}

/**
 * @internal
 */
export const MotionConfigContext = createContext<MotionConfigContext>({
    transformPagePoint: p => p,
    features: [],
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
    ...props
}: MotionConfigProps) {
    const pluginContext = useContext(MotionConfigContext)

    const value = useMemo(
        () => ({
            ...pluginContext,
            ...props,
            features: [...features, ...pluginContext.features],
        }),
        [features.length]
    )

    return (
        <MotionConfigContext.Provider value={value}>
            {children}
        </MotionConfigContext.Provider>
    )
}
