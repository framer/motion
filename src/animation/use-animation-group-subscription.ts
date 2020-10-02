import { useEffect, useMemo } from "react"
import { VisualElement } from "../render/VisualElement"
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
    useEffect(
        () => () => {
            unsubscribe && unsubscribe()
        },
        [unsubscribe]
    )
}
