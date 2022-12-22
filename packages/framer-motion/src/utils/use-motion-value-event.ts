import { useInsertionEffect } from "react"
import { MotionValue, MotionValueEventCallbacks } from "../value"

export function useMotionValueEvent<
    V,
    EventName extends keyof MotionValueEventCallbacks<V>
>(
    value: MotionValue<V>,
    event: EventName,
    callback: MotionValueEventCallbacks<V>[EventName]
) {
    useInsertionEffect(
        () => value.on(event, callback),
        [value, event, callback]
    )
}
