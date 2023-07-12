import { mapEasingToNativeEasing } from "./easing"
import { NativeAnimationOptions } from "./types"

export function animateStyle(
    element: Element,
    valueName: string,
    keyframes: string[] | number[],
    {
        delay = 0,
        duration,
        repeat = 0,
        repeatType = "loop",
        ease,
        times,
    }: NativeAnimationOptions = {}
) {
    const keyframeOptions: PropertyIndexedKeyframes = { [valueName]: keyframes }
    if (times) keyframeOptions.offset = times

    const easing = mapEasingToNativeEasing(ease)

    /**
     * If this is an easing array, apply to keyframes, not animation as a whole
     */
    if (Array.isArray(easing)) keyframeOptions.easing = easing

    const animation = element.animate(keyframeOptions, {
        delay,
        duration,
        easing: !Array.isArray(easing) ? easing : "linear",
        fill: "both",
        iterations: repeat + 1,
        direction: repeatType === "reverse" ? "alternate" : "normal",
        timeline: new ScrollTimeline(),
    })

    animation.rangeStart = "10px"
    animation.rangeEnd = "75%"

    return animation
}
