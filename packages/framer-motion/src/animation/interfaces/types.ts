import { AnimationType } from "../../render/utils/types"
import { Transition } from "../../types"

export type VisualElementAnimationOptions = {
    delay?: number
    transitionOverride?: Transition
    custom?: any
    type?: AnimationType
}
