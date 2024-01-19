import { MotionValue } from "."
import { frame } from "../frameloop"
import { useMotionValueEvent } from "../utils/use-motion-value-event"
import { useMotionValue } from "./use-motion-value"
/**
 * Creates a `MotionValue` that updates when the velocity of the provided `MotionValue` changes.
 *
 * ```javascript
 * const x = useMotionValue(0)
 * const xVelocity = useVelocity(x)
 * const xAcceleration = useVelocity(xVelocity)
 * ```
 *
 * @public
 */
export function useVelocity(value: MotionValue<number>): MotionValue<number> {
    const velocity = useMotionValue(value.getVelocity())

    const updateVelocity = () => {
        const latest = value.getVelocity()
        velocity.set(latest)

        if (latest) frame.update(updateVelocity)
    }

    useMotionValueEvent(value, "change", () => {
        // Schedule an update to this value at the end of the current frame.
        frame.update(updateVelocity, false, true)
    })

    return velocity
}
