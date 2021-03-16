import * as React from "react"
import { createContext, useContext, useMemo } from "react"
import { loadFeatures } from "../motion/features/definitions"
import { FeatureBundle } from "../motion/features/types"
import { CreateVisualElement } from "../render/types"
import { Transition } from "../types"
import { TransformPoint2D } from "../types/geometry"
import { useConstant } from "../utils/use-constant"

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
    features?: FeatureBundle

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

    /**
     * @public
     */
    renderer?: CreateVisualElement<any>
}

export interface MotionConfigProps extends Partial<MotionConfigContext> {
    children?: React.ReactNode
}

/**
 * @public
 */
export const MotionConfigContext = createContext<MotionConfigContext>({
    transformPagePoint: (p) => p,
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
    isStatic,
    ...config
}: MotionConfigProps) {
    const parentConfig = useContext(MotionConfigContext)

    /**
     * Don't allow isStatic to change between renders as it affects how many hooks
     * motion components fire.
     */
    isStatic = useConstant(() => isStatic)

    /**
     * Inherit and overwrite any parent MotionConfigs
     */
    config = { ...parentConfig, ...config }

    const allDefinedFeatures = {
        ...parentConfig.features,
        ...config.features,
    }
    const loadedFeatures = Object.keys(allDefinedFeatures).filter(
        (name) => allDefinedFeatures[name] !== null
    )
    const numLoadedFeatures = loadedFeatures.length

    /**
     * Creating a new config context object will re-render every `motion` component
     * every render. So we only create a new one when we *want* to rerender these
     * components, for instance when a new feature has loaded, or the renderer has loaded.
     */
    const context = useMemo(() => {
        // TODO We probably don't need to pass this through context
        config.features && loadFeatures(config.features)

        return {
            ...config,
            features: allDefinedFeatures,
            isStatic,
        }
    }, [numLoadedFeatures, config.renderer, config.transition])

    // Mutative to prevent triggering rerenders in all listening
    // components every time this component renders
    context.transformPagePoint = config.transformPagePoint

    return (
        <MotionConfigContext.Provider value={context as MotionConfigContext}>
            {children}
        </MotionConfigContext.Provider>
    )
}
