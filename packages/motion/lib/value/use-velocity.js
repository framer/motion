import { useEffect } from "react";
import { useMotionValue } from "./use-motion-value";
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
export function useVelocity(value) {
    var velocity = useMotionValue(value.getVelocity());
    useEffect(function () {
        return value.velocityUpdateSubscribers.add(function (newVelocity) {
            velocity.set(newVelocity);
        });
    }, [value]);
    return velocity;
}
//# sourceMappingURL=use-velocity.js.map