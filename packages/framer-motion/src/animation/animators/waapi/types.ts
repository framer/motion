import { Easing } from "../../../easing/types"

export interface NativeAnimationOptions {
    delay?: number
    duration?: number
    ease?: Easing | Easing[]
    times?: number[]
    repeat?: number
    repeatType?: "loop" | "reverse" | "mirror"
}
