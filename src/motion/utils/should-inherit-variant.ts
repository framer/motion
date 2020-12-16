import { MotionProps } from "../types"

export function checkShouldInheritVariant({
    animate,
    variants,
    inherit,
}: MotionProps): boolean {
    return inherit ?? (!!variants && !animate)
}
