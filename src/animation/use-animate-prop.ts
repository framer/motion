import { useRef, useEffect } from "react"
import { Target, Transition } from "../types"
import { MotionValue } from "../value"
import { AnimationControls } from "./AnimationControls"
import { MotionValuesMap } from "../motion/utils/use-motion-values"

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
 * @param onComplete
 * @internal
 */
export function useAnimateProp(
    target: Target,
    controls: AnimationControls,
    values: MotionValuesMap,
    transition?: Transition,
    onComplete?: () => void
) {
    const isInitialRender = useRef(true)
    const prevValues = useRef(target)

    useEffect(
        () => {
            const toAnimate: Target = Object.keys(prevValues.current).reduce(
                (acc, key) => {
                    const hasUpdated =
                        target[key] !== undefined &&
                        prevValues.current[key] !== target[key]

                    const animateOnMount =
                        isInitialRender.current &&
                        (!values.has(key) ||
                            (values.has(key) &&
                                (values.get(key) as MotionValue).get() !==
                                    target[key]))

                    if (hasUpdated || animateOnMount) {
                        acc[key] = target[key]
                    }
                    return acc
                },
                {}
            )

            isInitialRender.current = false
            prevValues.current = {
                ...prevValues.current,
                ...target,
            }

            if (Object.keys(toAnimate).length) {
                controls.start(toAnimate, transition).then(onComplete)
            }
        },
        [target]
    )
}
