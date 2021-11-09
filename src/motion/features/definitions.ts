import { MotionProps } from "../types"
import { FeatureComponents, LoadedFeatures } from "./types"

const createDefinition = (propNames: string[]) => ({
    isEnabled: (props: MotionProps) => propNames.some((name) => !!props[name]),
})

export const featureDefinitions: LoadedFeatures = {
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
    inView: createDefinition([
        "whileInView",
        "onViewportEnter",
        "onViewportLeave",
    ]),
}

export function loadFeatures(features: FeatureComponents) {
    for (const key in features) {
        if (features[key] === null) continue

        if (key === "projectionNodeConstructor") {
            featureDefinitions.projectionNodeConstructor = features[key]
        } else {
            featureDefinitions[key].Component = features[key]
        }
    }
}
