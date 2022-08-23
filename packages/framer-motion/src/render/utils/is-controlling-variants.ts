import { isAnimationControls } from "../../animation/utils/is-animation-controls"
import { MotionProps } from "../../motion/types"
import { isVariantLabel } from "./is-variant-label"

const variantProps = [
    "initial",
    "animate",
    "exit",
    "whileHover",
    "whileDrag",
    "whileTap",
    "whileFocus",
    "whileInView",
]

export function isControllingVariants(props: MotionProps) {
    return (
        isAnimationControls(props.animate) ||
        variantProps.some((name) => isVariantLabel(props[name]))
    )
}

export function isVariantNode(props: MotionProps) {
    return Boolean(isControllingVariants(props) || props.variants)
}
