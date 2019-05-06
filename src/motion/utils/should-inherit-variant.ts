import { MotionProps } from "../types"
import { AnimationControls } from "../../animation/AnimationControls"

export const checkShouldInheritVariant = ({
    animate,
    inherit = true,
}: MotionProps): boolean => {
    return inherit && (!animate || animate instanceof AnimationControls)
}
