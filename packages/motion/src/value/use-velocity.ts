import { useEffect } from "react"
import { MotionValue } from "."
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

    useEffect(() => {
        return value.velocityUpdateSubscribers.add((newVelocity) => {
            velocity.set(newVelocity)
        })
    }, [value])

    return velocity
}
