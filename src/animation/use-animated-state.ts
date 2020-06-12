import { useEffect, useState } from "react"
import { VisualElement } from "../render/VisualElement"
import { useConstant } from "../utils/use-constant"
import { useVisualElementAnimation } from "./use-visual-element-animation"
import { AnimationDefinition } from "./VisualElementAnimationControls"
import { ResolvedValues } from "../render/types"

class StateVisualElement extends VisualElement {
    latestState: ResolvedValues = {}

    build() {}
    clean() {}

    getBoundingBox() {
        return { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } }
    }

    readNativeValue(key: string) {
        return this.latestState[key] || 0
    }

    render() {
        console.log("render", this.latest.foo)
    }
}

/**
 * This is not an officially supported API and may be removed
 * on any version.
 * @internal
 */
export function useAnimatedState(initialState: any) {
    const [animationState, setAnimationState] = useState(initialState)
    const visualElement = useConstant(() => new StateVisualElement())

    visualElement.updateConfig({
        onUpdate: v => setAnimationState({ ...v }),
    })

    visualElement.latestState = animationState

    const controls = useVisualElementAnimation(visualElement, {}, {})

    useEffect(() => {
        ;(visualElement as any).mount({})
        return () => (visualElement as any).unmount()
    }, [])

    const startAnimation = useConstant(
        () => (animationDefinition: AnimationDefinition) => {
            return controls.start(animationDefinition)
        }
    )

    return [animationState, startAnimation]
}
