import { Easing, EasingFunction } from "../../../easing/types"

export interface NativeAnimationOptions {
    delay?: number
    duration?: number
    ease?: EasingFunction | Easing | Easing[]
    times?: number[]
    repeat?: number
    repeatType?: "loop" | "reverse" | "mirror"
}
