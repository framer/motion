import { AnimationType } from "./types"

export const variantPriorityOrder = [
    AnimationType.Animate,
    AnimationType.InView,
    AnimationType.Focus,
    AnimationType.Hover,
    AnimationType.Tap,
    AnimationType.Drag,
    AnimationType.Exit,
]

export const variantProps = ["initial", ...variantPriorityOrder]
