import { MotionProps } from "../types"
import { AnimationControls } from "../../animation/AnimationControls"

export const checkShouldInheritVariant = ({
    animate,
    inherit = true,
    variants,
    whileHover,
    whileTap,
}: MotionProps): boolean => {
    const isVariantChild =
        inherit && variants && !animate && !whileHover && !whileTap
    const isAnimationHookChild = inherit && animate instanceof AnimationControls

    if (isVariantChild || isAnimationHookChild) {
        return true
    } else {
        return false
    }
}
