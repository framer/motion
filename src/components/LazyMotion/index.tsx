import * as React from "react"
import { useEffect, useState } from "react"
import { LazyContext } from "../../context/LazyContext"
import { loadFeatures } from "../../motion/features/definitions"
import { FeatureBundle, LazyFeatureBundle } from "../../motion/features/types"
import { CreateVisualElement } from "../../render/types"
import { LazyProps } from "./types"

/**
 * Used in conjunction with the `m` component to reduce bundle size.
 *
 * `m` is a version of the `motion` component that only loads functionality
 * critical for the initial render.
 *
 * `LazyMotion` can then be used to either synchronously or asynchronously
 * load animation and gesture support.
 *
 * ```jsx
 * // Synchronous loading
 * import { LazyMotion, m, domAnimations } from "framer-motion"
 *
 * function App() {
 *   return (
 *     <LazyMotion features={domAnimations}>
 *       <m.div animate={{ scale: 2 }} />
 *     </LazyMotion>
 *   )
 * }
 *
 * // Asynchronous loading
 * import { LazyMotion, m } from "framer-motion"
 *
 * function App() {
 *   return (
 *     <LazyMotion features={() => import('./path/to/domAnimations')}>
 *       <m.div animate={{ scale: 2 }} />
 *     </LazyMotion>
 *   )
 * }
 * ```
 *
 * @public
 */
export function LazyMotion({ children, features }: LazyProps) {
    const [loadedRenderer, setRenderer] = useState<
        CreateVisualElement<any> | undefined
    >(
        !isLazyBundle(features)
            ? (features.renderer as CreateVisualElement<any>)
            : undefined
    )

    /**
     * If this is a synchronous load, load features immediately
     */
    if (!isLazyBundle(features)) {
        const { renderer, ...loadedFeatures } = features
        loadFeatures(loadedFeatures)
    }

    useEffect(() => {
        if (isLazyBundle(features)) {
            features().then(({ renderer, ...loadedFeatures }) => {
                loadFeatures(loadedFeatures)
                setRenderer(renderer)
            })
        }
    }, [])

    return (
        <LazyContext.Provider value={loadedRenderer}>
            {children}
        </LazyContext.Provider>
    )
}

function isLazyBundle(features: FeatureBundle): features is LazyFeatureBundle {
    return typeof features === "function" || features === null
}
