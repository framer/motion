import { MotionProps } from "../types"
import { FeatureDefinitions, Features } from "./types"

const createDefinition = (propNames: string[]) => ({
    isEnabled: (props: MotionProps) => propNames.some((name) => !!props[name]),
})

export const featureDefinitions: FeatureDefinitions = {
    measureLayout: createDefinition(["layout", "layoutId", "drag"]),
    animation: createDefinition([
        "animate",
        "exit",
        "variants",
        "whileHover",
        "whileTap",
        "whileFocus",
        "whileDrag",
    ]),
    exit: createDefinition(["exit"]),
    drag: createDefinition(["drag", "dragControls"]),
    focus: createDefinition(["whileFocus"]),
    hover: createDefinition(["whileHover", "onHoverStart", "onHoverEnd"]),
    tap: createDefinition(["whileTap", "onTap", "onTapStart", "onTapCancel"]),
    pan: createDefinition([
        "onPan",
        "onPanStart",
        "onPanSessionStart",
        "onPanEnd",
    ]),
    layoutAnimation: createDefinition(["layout", "layoutId"]),
}

export function loadFeatures(features: Partial<Features>) {
    for (const key in features) {
        const Component = features[key]
        if (Component !== null) featureDefinitions[key].Component = Component
    }
}
