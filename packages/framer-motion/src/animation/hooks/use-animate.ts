import { useConstant } from "../../utils/use-constant"
import { useUnmountEffect } from "../../utils/use-unmount-effect"
import { createScopedAnimate } from "../animate"
import { AnimationScope } from "../types"

export function useAnimate<T extends Element = any>() {
    const scope: AnimationScope<T> = useConstant(() => ({
        current: null!, // Will be hydrated by React
        animations: [],
    }))

    const animate = useConstant(() => createScopedAnimate(scope))

    useUnmountEffect(() => {
        scope.animations.forEach((animation) => {
            if (animation.state !== "finished") {
                animation.stop()
            }
        })
    })

    return [scope, animate] as [AnimationScope<T>, typeof animate]
}
