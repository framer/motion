import { sync, cancelSync } from "../frameloop"
import { DependencyList, EffectCallback, useEffect } from "react"
import { recordFrameloopTasks } from "../frameloop/record"

/**
 * An effect that is guarenteed to fire after a paint.
 *
 * Normal useEffect callbacks can be flushed synchronously
 * before the initial paint if they're part of a render
 * where a subsequent render is triggered from within a
 * useLayoutEffect.
 * https://blog.thoughtspile.tech/2021/11/15/unintentional-layout-effect/
 *
 * This effect uses the render loop to batch jobs until after
 * the paint has been committed by the browser.
 */
export function usePaintEffect(
    callback: EffectCallback,
    dependencies?: DependencyList
) {
    useEffect(() => {
        let cleanFrameloop: VoidFunction | void
        let cleanEffect: VoidFunction | void

        const fireCallback = () => {
            cleanFrameloop = recordFrameloopTasks(() => {
                cleanEffect = callback()
            })
        }

        sync.read(fireCallback)

        return () => {
            if (cleanFrameloop) cleanFrameloop()
            if (cleanEffect) cleanEffect()
            cancelSync.read(fireCallback)
        }
    }, dependencies)
}
