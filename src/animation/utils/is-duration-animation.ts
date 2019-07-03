import { PopmotionTransitionProps, Keyframes, Tween } from "../../types"

export const isDurationAnimation = (
    v: PopmotionTransitionProps
): v is Tween | Keyframes =>
    v.hasOwnProperty("duration") || v.hasOwnProperty("repeatDelay")
