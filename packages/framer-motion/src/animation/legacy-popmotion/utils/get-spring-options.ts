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
                ...findSpring(options),
                isResolvedFromDuration: true,
            }
        } else {
            /**
             * Otherwise, use bounce to override
             */
            springOptions.damping =
                (1 - bounce) *
                2 *
                Math.sqrt(springOptions.mass * springOptions.stiffness)
        }

        /**
         * Velocity
         */
        springOptions.velocity = 0.0
    }

    return springOptions
}
