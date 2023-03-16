import { animateMotionValue } from "./motion-value"
import { motionValue as createMotionValue, MotionValue } from "../../value"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { GenericKeyframesTarget } from "../../types"
import { AnimateOptions, AnimationPlaybackControls } from "../types"

export function animateSingleValue<V>(
    value: MotionValue<V> | V,
    keyframes: V | GenericKeyframesTarget<V>,
    options: AnimateOptions<V>
): AnimationPlaybackControls {
    const motionValue = isMotionValue(value) ? value : createMotionValue(value)

    motionValue.start(
        animateMotionValue("", motionValue, keyframes as any, options)
    )

    return motionValue.animation!
}
