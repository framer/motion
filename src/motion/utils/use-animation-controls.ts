import { VisualElementAnimationControls } from "../../animation/VisualElementAnimationControls"
import { VisualElement } from "../../render/VisualElement"

const controlsCache = new WeakMap<
    VisualElement,
    VisualElementAnimationControls
>()

export function useAnimationControls(
    visualElement: VisualElement
): VisualElementAnimationControls {
    if (!controlsCache.has(visualElement)) {
        const controls = new VisualElementAnimationControls(visualElement)
        controlsCache.set(visualElement, controls)

        /**
         * This is a temporary assignment to aid code-splitting until a further refactor
         * splits the layout projection code from HTMLVisualElement
         */
        ;(visualElement as any).animation = controls
    }

    return controlsCache.get(visualElement) as VisualElementAnimationControls
}
