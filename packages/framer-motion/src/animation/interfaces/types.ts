import { AnimationType } from "../../render/utils/types"
import { VariantTransition } from "../types"

export type VisualElementAnimationOptions = {
    delay?: number
    transitionOverride?: VariantTransition
    custom?: any
    type?: AnimationType
}
