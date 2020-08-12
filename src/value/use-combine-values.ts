import { MotionValue } from "."
import { useMotionValue } from "./use-motion-value"
import { useMultiOnChange } from "./use-on-change"
import sync from "framesync"

export function useCombineMotionValues<R>(
    values: MotionValue[],
    combineValues: () => R
) {
    /**
     * Initialise the returned motion value. This remains the same between renders.
     */
    const value = useMotionValue(combineValues())

    /**
     * Create a function that will update the template motion value with the latest values.
     * This is pre-bound so whenever a motion value updates it can schedule its
     * execution in Framesync. If it's already been scheduled it won't be fired twice
     * in a single frame.
     */
    const updateValue = () => value.set(combineValues())

    /**
     * Synchronously update the motion value with the latest values during the render.
     * This ensures that within a React render, the styles applied to the DOM are up-to-date.
     */
    updateValue()

    /**
     * Subscribe to all motion values found within the template. Whenever any of them change,
     * schedule an update.
     */
    useMultiOnChange(values, () => sync.update(updateValue, false, true))

    return value
}
