import { AnimationControls } from "./AnimationControls"
import { useMemo, useEffect } from "react"
import { Transition, Variants } from "../types"

/**
 * The `useAnimation` hook returns `AnimationControls`, which can be used to manually start, stop and sequence animations on one or more Frames.
 *
 * The returned `AnimationControls` should be passed as the `animate` property of the `Frame`. It can be passed to any number of Frames. These Frames can be animated with the `start` method. It accepts the same properties as the `animate` property.
 *
 * ```jsx
 *
 * import * as React from "react"
 * import { Frame, useAnimation } from "framer"
 *
 * export function MyComponent(props) {
 *    const animation = useAnimation()
 *
 *    animation.start({
 *        x: 100,
 *        transition: { duration: 0.5 },
 *    })
 *
 *    return <Frame animate={animation} />
 * }
 *
 * ```
 *
 * @param variants - An optional named map of variants.
 * @param defaultTransition - An optional default transition to use when a variant doesn’t have an explicit `transition` property set.
 * @returns Animation controller with `start` and `stop` methods
 *
 * @public
 */
export function useAnimation(
    variants?: Variants,
    defaultTransition?: Transition
) {
    const animationManager = useMemo(() => new AnimationControls(), [])

    if (variants) {
        animationManager.setVariants(variants)
    }

    if (defaultTransition) {
        animationManager.setDefaultTransition(defaultTransition)
    }

    useEffect(() => {
        animationManager.mount()
        return () => animationManager.unmount()
    }, [])

    return animationManager
}
