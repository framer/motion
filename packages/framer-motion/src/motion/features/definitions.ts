import { MotionProps } from "../types"
import { FeatureDefinitions } from "./types"

const featureProps = {
    animation: [
        "animate",
        "variants",
        "whileHover",
        "whileTap",
        "exit",
        "whileInView",
        "whileFocus",
        "whileDrag",
    ],
    exit: ["exit"],
    drag: ["drag", "dragControls"],
    focus: ["whileFocus"],
    hover: ["whileHover", "onHoverStart", "onHoverEnd"],
    tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
    pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
    inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
    layout: ["layout", "layoutId"],
}

export const featureDefinitions: Partial<FeatureDefinitions> = {}

for (const key in featureProps) {
    featureDefinitions[key as keyof typeof featureDefinitions] = {
        isEnabled: (props: MotionProps) =>
            featureProps[key as keyof typeof featureProps].some(
                (name: string) => !!props[name as keyof typeof props]
            ),
    }
}
