import { SpringOptions } from "../../types"
import { findSpring } from "./find-spring"

export function getSpringOptions(options: SpringOptions) {
    let springOptions = {
        velocity: 0.0,
        stiffness: 100,
        damping: 10,
        mass: 1.0,
        isResolvedFromDuration: false,
        ...options,
    }

    /**
     * If bounce is defined, resolve some or all spring options
     */
    const { duration, bounce } = options
    if (bounce !== undefined) {
        if (duration) {
            /**
             * If duration is defined, resolve both stiffness and damping.
             */
            springOptions = {
                ...springOptions,
                ...findSpring({
                    ...options,
                    velocity: -(options.velocity / 1000),
                }),
                isResolvedFromDuration: true,
            }
        } else {
            /**
             * Otherwise, use bounce to override just damping.
             */
            springOptions.damping =
                (1 - bounce) *
                2 *
                Math.sqrt(springOptions.mass * springOptions.stiffness)
        }

        /**
         * Velocity needs to be set as 0 when resolving from bounce. We resolve
         * dampingRatio from bounce and if this is critically damped (no bounce)
         * and initial velocity is non-zero, there will still be an unwanted bounce.
         */
        // springOptions.velocity = 0.0
    }

    return springOptions
}
