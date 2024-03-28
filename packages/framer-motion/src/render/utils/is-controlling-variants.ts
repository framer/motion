import { isAnimationControls } from "../../animation/utils/is-animation-controls"
import { MotionProps } from "../../motion/types"
import { isVariantLabel } from "./is-variant-label"
import { variantProps } from "./variant-props"

export function isControllingVariants(props: MotionProps) {
    return (
        isAnimationControls(props.animate) ||
        variantProps.some((name) =>
            isVariantLabel(props[name as keyof typeof props])
        )
    )
}

export function isVariantNode(props: MotionProps) {
    return Boolean(isControllingVariants(props) || props.variants)
}
