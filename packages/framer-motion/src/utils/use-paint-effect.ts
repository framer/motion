import { sync, cancelSync } from "../frameloop"
import { DependencyList, EffectCallback, useEffect } from "react"

/**
 * An effect that is guarenteed to fire after a paint.
 *
 * Normal useEffect callbacks can be flushed synchronously
 * before the initial paint if they're part of a render
 * where a subsequent render is triggered from within a
 * useLayoutEffect.
 *
 * This effect uses the render loop to batch jobs until after
 * the paint has been committed by the browser.
 */
export function usePaintEffect(
    callback: EffectCallback,
    dependencies?: DependencyList
) {
    useEffect(() => {
        let cleanupEffect: VoidFunction | void

        const fireCallback = () => {
            cleanupEffect = callback()
        }

        sync.read(fireCallback)

        return () => {
            if (cleanupEffect) {
                cleanupEffect()
            } else {
                cancelSync.read(fireCallback)
            }
        }
    }, dependencies)
}
