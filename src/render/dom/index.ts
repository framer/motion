import { MotionComponentConfig } from "../../motion/component"
import { useVisualElement } from "./use-dom-visual-element"
import { render } from "./render"
import { parseDomVariant } from "../../dom/parse-dom-variant"

export const domConfig: MotionComponentConfig = {
    useVisualElement,
    render,
    animationControlsConfig: {
        makeTargetAnimatable: parseDomVariant,
    },
}
