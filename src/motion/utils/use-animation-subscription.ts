import { useEffect, useMemo } from "react"
import { AnimationManager } from "../../animation"
import { AnimationControls } from "./use-animation-controls"

export const useAnimationSubscription = (animation: AnimationManager, controls: AnimationControls) => {
    const unsubscribe = useMemo(() => animation.subscribe(controls), [animation])
    useEffect(() => () => unsubscribe && unsubscribe(), [unsubscribe])
}
