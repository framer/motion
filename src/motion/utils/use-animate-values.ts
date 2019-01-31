import { useRef, useEffect } from "react"

import { Target, Transition } from "../../types"
import { MotionValue } from "../../value"

import { AnimationControls } from "./use-animation-controls"
import { MotionValuesMap } from "./use-motion-values"

export const useAnimateValues = (
    target: Target,
    controls: AnimationControls,
    values: MotionValuesMap,
    transition?: Transition,
    onComplete?: () => void
) => {
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
