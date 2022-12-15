import { useIsomorphicLayoutEffect } from "../three-entry"
import { MotionValue, Subscriber } from "./"
import { isMotionValue } from "./utils/is-motion-value"

export function useOnChange<T>(
    value: MotionValue<T> | number | string,
    callback: Subscriber<T>
) {
    useIsomorphicLayoutEffect(() => {
        if (isMotionValue(value)) {
            callback(value.get())
            return value.on("change", callback)
        }
    }, [value, callback])
}

export function useMultiOnChange(
    values: MotionValue[],
    handler: () => void,
    cleanup: () => void
) {
    useIsomorphicLayoutEffect(() => {
        const subscriptions = values.map((value) => value.on("change", handler))

        return () => {
            subscriptions.forEach((unsubscribe) => unsubscribe())
            cleanup()
        }
    })
}
