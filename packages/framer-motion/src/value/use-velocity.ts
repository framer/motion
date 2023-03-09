import { MotionValue } from "."
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

    useMotionValueEvent(value, "velocityChange", (newVelocity) => {
        velocity.set(newVelocity)
    })

    return velocity
}
