import { useMemo } from "react"
import { VisualElement } from "../render/VisualElement"
import { useUnmountEffect } from "../utils/use-unmount-effect"
import { AnimationControls } from "./AnimationControls"

/**
 * `useAnimationGroupSubscription` allows a component to subscribe to an
 * externally-created `AnimationControls`, created by the `useAnimation` hook.
 *
 * @param animation
 * @param controls
 *
 * @internal
 */
export function useAnimationGroupSubscription(
    visualElement: VisualElement,
    animation: AnimationControls
) {
    const unsubscribe = useMemo(() => animation.subscribe(visualElement), [
        animation,
    ])

    useUnmountEffect(() => unsubscribe?.())
}
