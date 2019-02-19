import { useEffect, useMemo } from "react"
import { AnimationControls } from "./AnimationControls"
import { ComponentAnimationControls } from "./ComponentAnimationControls"

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
    animation: AnimationControls,
    controls: ComponentAnimationControls
) {
    const unsubscribe = useMemo(() => animation.subscribe(controls), [
        animation,
    ])
    useEffect(() => () => unsubscribe && unsubscribe(), [unsubscribe])
}
