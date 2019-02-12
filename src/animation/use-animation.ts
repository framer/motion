import { AnimationGroupControls } from "./AnimationGroupControls"
import { useMemo, useEffect } from "react"
import { Transition, Variants } from "../types"

/**
 * Manually start, stop and sequence animations
 *
 * @remarks
 * `useAnimation` is used to manually start, stop and sequence animations.
 *
 * Create an animation controller with `useAnimation`:
 *
 * ```jsx
 * const animation = useAnimation()
 * ```
 *
 * Pass this to one or more components that you want to animate via the `animate` property:
 *
 * ```jsx
 * return <motion.div animate={animation} />
 * ```
 *
 * Now you can start animations with `animation.start`. It accepts the same properties as the `animate` prop:
 *
 * ```jsx
 * const animation = useAnimation()
 * const moveRight = () => animation.start({
 *  x: 100,
 *  transition: { duration: 1 }
 * })
 *
 * return <motion.div animate={animation} onClick={moveRight} />
 * ```
 *
 * `start` returns a `Promise`, so animations can be sequenced using `async` functions:
 *
 * ```jsx
 * const sequence = async () => {
 *  await animation.start({ opacity: 1 })
 *  return animation.start({ scale: 2 })
 * }
 * ```
 *
 * `useAnimation` can optionally accept `variants`:
 *
 * ```jsx
 * const animation = useAnimation({
 *  visible: { opacity: 1 },
 *  hidden: { opacity: 0 }
 * })
 * ```
 *
 * That can be later referenced by `start`:
 *
 * ```jsx
 * animation.start('visible')
 * ```
 *
 * @params variants - List of variants. Optional
 * @returns Animation controller with `start` and `stop` methods
 *
 * @public
 */
export function useAnimation(
    variants?: Variants,
    defaultTransition?: Transition
) {
    const animationManager = useMemo(() => new AnimationGroupControls(), [])

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
