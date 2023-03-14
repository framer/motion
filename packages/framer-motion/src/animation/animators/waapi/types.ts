import { EasingDefinition } from "../../../easing/types"

export interface NativeAnimationOptions {
    delay?: number
    duration?: number
    ease?: EasingDefinition
    times?: number[]
    repeat?: number
    repeatType?: "loop" | "reverse" | "mirror"
}
