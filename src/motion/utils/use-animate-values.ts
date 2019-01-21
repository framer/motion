import { AnimationControls } from "./use-animation-controls"
import { PoseDefinition, PoseTransition } from "types"
import { useRef, useEffect } from "react"
import { MotionValuesMap } from "./use-motion-values"
import { MotionValue } from "value"

export const useAnimateValues = (
    target: PoseDefinition,
    controls: AnimationControls,
    values: MotionValuesMap,
    transition?: PoseTransition,
    onComplete?: () => void
) => {
    const isInitialRender = useRef(true)
    const prevValues = useRef(target)

    useEffect(
        () => {
            const toAnimate: PoseDefinition = Object.keys(prevValues.current).reduce((acc, key) => {
                const hasUpdated = prevValues.current[key] !== target[key]
                const animateOnMount =
                    isInitialRender.current &&
                    (!values.has(key) || (values.has(key) && (values.get(key) as MotionValue).get() !== target[key]))

                if (hasUpdated || animateOnMount) {
                    acc[key] = target[key]
                }
                return acc
            }, {})

            isInitialRender.current = false
            prevValues.current = target

            if (Object.keys(toAnimate).length) {
                controls.start(toAnimate, transition).then(onComplete)
            }
        },
        [target]
    )
}
