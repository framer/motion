import { useEffect, useMemo } from "react"
import { AnimationGroupControls } from "./AnimationGroupControls"
import { AnimationControls } from "./AnimationControls"

/**
 * `useAnimationGroupSubscription` allows a component to subscribe to an
 * externally-created `AnimationGroupControls`, created by the `useAnimation` hook.
 *
 * @param animation
 * @param controls
 *
 * @internal
 */
export function useAnimationGroupSubscription(
    animation: AnimationGroupControls,
    controls: AnimationControls
) {
    const unsubscribe = useMemo(() => animation.subscribe(controls), [
        animation,
    ])
    useEffect(() => () => unsubscribe && unsubscribe(), [unsubscribe])
}
