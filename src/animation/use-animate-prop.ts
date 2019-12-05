import { useRef, useEffect } from "react"
import { Target, Transition, TargetAndTransition } from "../types"
import { ValueAnimationControls } from "./ValueAnimationControls"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { shallowCompare } from "../utils/shallow-compare"

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

function targetWithoutTransition(
    { transition, transitionEnd, ...target }: TargetAndTransition,
    mergeTransitionEnd: boolean = false
): Target {
    return mergeTransitionEnd
        ? ({ ...target, ...transitionEnd } as any)
        : target
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
    targetAndTransition: TargetAndTransition,
    controls: ValueAnimationControls,
    values: MotionValuesMap,
    defaultTransition?: Transition
) {
    const isInitialRender = useRef(true)
    const prevValues = useRef<Target | null>(null)

    if (!prevValues.current) {
        prevValues.current = targetWithoutTransition(targetAndTransition, true)
    }

    useEffect(
        () => {
            const targetToAnimate: Target = {}
            // These are the values we're actually animating
            const animatingTarget = targetWithoutTransition(targetAndTransition)
            // This is the target as it'll be once transitionEnd values are applied
            const finalTarget = targetWithoutTransition(
                targetAndTransition,
                true
            )

            // Detect which values have changed between renders
            for (const key in animatingTarget) {
                // This value should animate on mount if this value doesn't already exist (wasn't
                // defined in `style` or `initial`) or if it does exist and it's already changed.
                const shouldAnimateOnMount =
                    isInitialRender.current &&
                    (!values.has(key) ||
                        values.get(key)!.get() !== finalTarget[key])

                // If this value has updated between renders or it's we're animating this value on mount,
                // add it to the animate target.
                const isValidValue = finalTarget[key] !== null
                const valueHasUpdated = hasUpdated(
                    prevValues.current![key],
                    finalTarget[key]
                )

                if (isValidValue && (valueHasUpdated || shouldAnimateOnMount)) {
                    targetToAnimate[key] = animatingTarget[key]
                }
            }

            isInitialRender.current = false
            prevValues.current = {
                ...prevValues.current,
                ...finalTarget,
            }

            if (Object.keys(targetToAnimate).length) {
                controls.start({
                    ...targetToAnimate,
                    transition:
                        targetAndTransition.transition || defaultTransition,
                    transitionEnd: targetAndTransition.transitionEnd,
                })
            }
        },
        [targetAndTransition]
    )
}
