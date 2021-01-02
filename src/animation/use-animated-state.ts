import { useEffect, useState } from "react"
import { VisualElement } from "../render/VisualElement"
import { useConstant } from "../utils/use-constant"
import { ResolvedValues } from "../render/VisualElement/types"
import {
    checkTargetForNewValues,
    getOrigin,
} from "../render/VisualElement/utils/setters"
import { TargetAndTransition } from "../types"
import { animateVisualElement } from "../render/VisualElement/utils/animation"

/**
 * This is just a very basic VisualElement, more of a hack to keep supporting useAnimatedState with
 * the latest APIs.
 */
class StateVisualElement extends VisualElement {
    initialState: ResolvedValues = {}

    updateLayoutDelta() {}

    build() {}

    clean() {}

    makeTargetAnimatable({
        transition,
        transitionEnd,
        ...target
    }: TargetAndTransition) {
        const origin = getOrigin(target as any, transition || {}, this)
        checkTargetForNewValues(this, target, origin as any)
        return { transition, transitionEnd, ...target }
    }

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
        onUpdate: (v) => setAnimationState({ ...v }),
    })

    visualElement.initialState = initialState

    useEffect(() => {
        ;(visualElement as any).mount({})
        return () => (visualElement as any).unmount()
    }, [])

    const startAnimation = useConstant(
        () => (animationDefinition: TargetAndTransition) => {
            return animateVisualElement(visualElement, animationDefinition)
        }
    )

    return [animationState, startAnimation]
}
