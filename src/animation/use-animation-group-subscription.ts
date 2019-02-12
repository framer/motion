import { useEffect, useMemo } from "react"
import { AnimationGroupControls } from "./AnimationGroupControls"
import { AnimationControls } from "./AnimationControls"

export const useAnimationGroupSubscription = (
    animation: AnimationGroupControls,
    controls: AnimationControls
) => {
    const unsubscribe = useMemo(() => animation.subscribe(controls), [
        animation,
    ])
    useEffect(() => () => unsubscribe && unsubscribe(), [unsubscribe])
}
