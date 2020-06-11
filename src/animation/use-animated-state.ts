import { useState } from "react"
import { VisualElement } from "../render/VisualElement"
import { useConstant } from "../utils/use-constant"
import { useVisualElementAnimation } from "./use-visual-element-animation"
import { AnimationDefinition } from "./VisualElementAnimationControls"

class StateVisualElement extends VisualElement {
    build() {}
    clean() {}

    getBoundingBox() {
        return { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } }
    }

    readNativeValue(key: string) {
        return this.element[key] || 0
    }

    render() {}
}

export function useAnimatedState(initialState: any) {
    const [animationState, setAnimationState] = useState(initialState)
    const visualElement = useConstant(() => new StateVisualElement())

    visualElement.updateConfig({
        onUpdate: v => setAnimationState(v),
    })

    const controls = useVisualElementAnimation(visualElement, {}, {})

    const startAnimation = useConstant(
        () => (animationDefinition: AnimationDefinition) => {
            return controls.start(animationDefinition)
        }
    )

    return [animationState, startAnimation]
}
