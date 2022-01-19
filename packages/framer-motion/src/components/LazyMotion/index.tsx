import * as React from "react"
import { useEffect, useRef, useState } from "react"
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
export function LazyMotion({ children, features, strict = false }: LazyProps) {
    const [, setIsLoaded] = useState(!isLazyBundle(features))
    const loadedRenderer = useRef<undefined | CreateVisualElement<any>>(
        undefined
    )

    /**
     * If this is a synchronous load, load features immediately
     */
    if (!isLazyBundle(features)) {
        const { renderer, ...loadedFeatures } = features
        loadedRenderer.current = renderer
        loadFeatures(loadedFeatures)
    }

    useEffect(() => {
        if (isLazyBundle(features)) {
            features().then(({ renderer, ...loadedFeatures }) => {
                loadFeatures(loadedFeatures)
                loadedRenderer.current = renderer
                setIsLoaded(true)
            })
        }
    }, [])

    return (
        <LazyContext.Provider
            value={{ renderer: loadedRenderer.current, strict }}
        >
            {children}
        </LazyContext.Provider>
    )
}

function isLazyBundle(
    features: FeatureBundle | LazyFeatureBundle
): features is LazyFeatureBundle {
    return typeof features === "function"
}
