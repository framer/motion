import * as React from "react"
import { createContext, useMemo, useState, useEffect } from "react"
import { MotionFeature } from "../features/types"
import { TransformPoint2D } from "../../types/geometry"
import { invariant } from "hey-listen"

export interface MotionConfigContext {
    transformPagePoint: TransformPoint2D
    features: MotionFeature[]
}

interface DefaultFeatureExport {
    default: MotionFeature[]
}

type FeatureImport = () => Promise<DefaultFeatureExport>

export interface MotionConfigProps {
    children?: React.ReactNode
    transformPagePoint: TransformPoint2D
    features: MotionFeature[] | FeatureImport
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
    const [loadedFeatures, setFeatures] = useState<MotionFeature[]>(
        Array.isArray(features) ? features : []
    )

    useEffect(() => {
        if (Array.isArray(features)) return

        features().then(res => {
            invariant(
                Array.isArray(res.default),
                "The default export of the imported file must be an array of MotionFeatures"
            )

            setFeatures(res.default)
        })
    }, [])

    const value = useMemo(
        () => ({
            ...props,
            features: loadedFeatures,
        }),
        [loadedFeatures]
    )

    return (
        <MotionConfigContext.Provider value={value}>
            {children}
        </MotionConfigContext.Provider>
    )
}
