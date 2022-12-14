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
    return element.animate(
        { [valueName]: keyframes, offset: times },
        {
            delay,
            duration,
            easing: mapEasingToNativeEasing(ease),
            fill: "both",
            iterations: repeat + 1,
            direction: repeatType === "reverse" ? "alternate" : "normal",
        }
    )
}
