import { MotionValue, MotionValueEventCallbacks } from "../value"
import { useIsomorphicLayoutEffect } from "./use-isomorphic-effect"

export function useMotionValueEvent<
    V,
    EventName extends keyof MotionValueEventCallbacks<V>
>(
    value: MotionValue,
    event: EventName,
    callback: MotionValueEventCallbacks<V>[EventName]
) {
    useIsomorphicLayoutEffect(
        () => value.on(event, callback),
        [value, event, callback]
    )
}
