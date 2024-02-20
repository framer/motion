import { animateMotionValue } from "./motion-value"
import { motionValue as createMotionValue, MotionValue } from "../../value"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { GenericKeyframesTarget } from "../../types"
import { AnimationPlaybackControls, ValueAnimationTransition } from "../types"

export function animateSingleValue<V extends string | number>(
    value: MotionValue<V> | V,
    keyframes: V | GenericKeyframesTarget<V>,
    options?: ValueAnimationTransition
): AnimationPlaybackControls {
    const motionValue = isMotionValue(value) ? value : createMotionValue(value)

    motionValue.start(animateMotionValue("", motionValue, keyframes, options))

    return motionValue.animation!
}
