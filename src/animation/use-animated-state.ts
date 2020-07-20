import { useEffect, useState } from "react"
import { VisualElement } from "../render/VisualElement"
import { useConstant } from "../utils/use-constant"
import { useVisualElementAnimation } from "./use-visual-element-animation"
import { AnimationDefinition } from "./VisualElementAnimationControls"
import { ResolvedValues } from "../render/types"

/**
 * This is just a very basic VisualElement, more of a hack to keep supporting useAnimatedState with
 * the latest APIs.
 */
class StateVisualElement extends VisualElement {
    initialState: ResolvedValues = {}

    updateLayoutDelta() {}

    build() {}

    clean() {}

    getBoundingBox() {
        return { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } }
    }

    readNativeValue(key: string) {
        return this.initialState[key] || 0
    }

    render() {
        this.build()
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

    visualElement.initialState = initialState

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
