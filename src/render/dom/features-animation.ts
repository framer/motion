import { animations } from "../../motion/features/animations"
import { gestureAnimations } from "../../motion/features/gestures"
import { createDomVisualElement } from "./create-visual-element"

export const domAnimation = {
    renderer: createDomVisualElement,
    ...animations,
    ...gestureAnimations,
}
