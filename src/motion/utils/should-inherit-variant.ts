import { MotionProps } from "../types"
import { AnimationControls } from "../../animation/AnimationControls"

export const checkShouldInheritVariant = ({
    animate,
    variants,
    inherit = true,
}: MotionProps): boolean => {
    return (
        inherit &&
        !!variants &&
        (!animate || animate instanceof AnimationControls)
    )
}
