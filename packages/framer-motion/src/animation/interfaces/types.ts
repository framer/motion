import { AnimationType } from "../../render/utils/types"
import { Transition } from "../../types"
import { AnimationPlaybackControls } from "../types"

export type VisualElementAnimationOptions = {
    delay?: number
    transitionOverride?: Transition
    custom?: any
    type?: AnimationType
    sync?: boolean
}

export type PreparedAnimation = () => AnimationPlaybackControls[]
