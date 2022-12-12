import { cubicBezierAsString } from "./easing"
import { NativeAnimationOptions } from "./types"

export function animateStyle(
    element: Element,
    valueName: string,
    keyframes: string[] | number[],
    { delay = 0, duration, ease }: NativeAnimationOptions = {}
) {
    return element.animate(
        { [valueName]: keyframes },
        {
            delay,
            duration,
            easing: Array.isArray(ease) ? cubicBezierAsString(ease) : ease,
            fill: "both",
        }
    )
}
