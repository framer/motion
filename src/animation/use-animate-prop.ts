import { useRef, useEffect } from "react"
import { Target, Transition, TargetAndTransition } from "../types"
import { ValueAnimationControls } from "./ValueAnimationControls"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { shallowCompare } from "../utils/use-inline"

export const hasUpdated = (
    prev: string | number | any[],
    next: string | number | any[]
) => {
    return (
        next !== undefined &&
        (Array.isArray(prev) && Array.isArray(next)
            ? !shallowCompare(next, prev)
            : prev !== next)
    )
}

/**
 * Handle the `animate` prop when its an object of values, ie:
 *
 * ```jsx
 * <motion.div animate={{ opacity: 1 }} />
 * ```
 *
 * @internalremarks
 * It might be worth consolidating this with `use-variants`
 *
 * ```jsx
 * <motion.div animate="visible" />
 * ```
 *
 * @param target
 * @param controls
 * @param values
 * @param transition
 *
 * @internal
 */
export function useAnimateProp(
    target: TargetAndTransition,
    controls: ValueAnimationControls,
    values: MotionValuesMap,
    defaultTransition?: Transition
) {
    const isInitialRender = useRef(true)
    const prevValues = useRef(target)

    useEffect(
        () => {
            const animateTarget: Target = {}
            const { transition, transitionEnd } = target

            for (const key in prevValues.current) {
                const shouldAnimateOnMount =
                    isInitialRender.current &&
                    (!values.has(key) || values.get(key) !== target[key])

                if (
                    hasUpdated(prevValues.current[key], target[key]) ||
                    shouldAnimateOnMount
                ) {
                    animateTarget[key] = target[key]
                }
            }

            isInitialRender.current = false
            prevValues.current = {
                ...prevValues.current,
                ...target,
            }

            if (Object.keys(animateTarget).length) {
                controls.start({
                    ...animateTarget,
                    transition: transition || defaultTransition,
                    transitionEnd,
                })
            }
        },
        [target]
    )
}
