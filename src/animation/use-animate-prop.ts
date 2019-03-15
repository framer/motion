import { useRef, useEffect } from "react"
import { Target, Transition } from "../types"
import { MotionValue } from "../value"
import { ComponentAnimationControls } from "./ComponentAnimationControls"
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
 *
 * @internal
 */
export function useAnimateProp(
    target: Target,
    controls: ComponentAnimationControls,
    values: MotionValuesMap,
    transition?: Transition
) {
    const isInitialRender = useRef(true)
    const prevValues = useRef(target)

    useEffect(
        () => {
            const toAnimate: Target = {}

            for (const key in prevValues.current) {
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
                    toAnimate[key] = target[key]
                }
            }

            isInitialRender.current = false
            prevValues.current = {
                ...prevValues.current,
                ...target,
            }

            if (Object.keys(toAnimate).length) {
                controls.start(toAnimate, transition)
            }
        },
        [target]
    )
}
