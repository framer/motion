import { clamp } from "../utils/clamp"
import { EasingFunction } from "./types"

/**
 * Splits an animation into a discrete number of steps.
 *
 * ```jsx
 * const steppedEasing = Easing.steps(5)
 * ```
 *
 * @param steps - The number of steps in which to split the animation.
 * @param direction - When the snap to the next step. If `"start"`, immediately at the start of each step, or `"end"` for at the end of a step.
 *
 * @public
 */
export function steps(
    steps: number,
    direction: "start" | "end" = "end"
): EasingFunction {
    return p => {
        p = direction === "end" ? Math.min(p, 0.999) : Math.max(p, 0.001)

        const expanded = p * steps
        const rounded =
            direction === "end" ? Math.floor(expanded) : Math.ceil(expanded)

        return clamp(0, 1, rounded / steps)
    }
}
