import { useEffect } from "react"
import { MotionValue, Subscriber } from "./"
import { isMotionValue } from "./utils/is-motion-value"

export function useOnChange<T>(
    value: MotionValue<T> | number | string,
    callback: Subscriber<T>
) {
    useEffect(() =>
        isMotionValue(value) ? value.onChange(callback) : undefined
    )
}

export function useMultiOnChange(values: MotionValue[], handler: () => void) {
    useEffect(() => {
        const subscriptions = values.map((value) => value.onChange(handler))
        return () => subscriptions.forEach((unsubscribe) => unsubscribe())
    })
}
