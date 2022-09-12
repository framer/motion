import { HoverHandlers, TapHandlers } from "../../gestures/types"
import { ViewportProps } from "../../motion/features/viewport/types"
import { AnimationProps, VariantLabels } from "../../motion/types"

export interface AnimatedProps
    extends AnimationProps,
        TapHandlers,
        HoverHandlers,
        ViewportProps {
    as?: string | React.ComponentType
}

export interface VariantContext {
    initial?: VariantLabels
    animate?: VariantLabels
    whileInView?: VariantLabels
    whileHover?: VariantLabels
    whilePress?: VariantLabels
    exit?: VariantLabels
}
