import { createBackIn } from "./back"
import { EasingFunction } from "./types"

const createAnticipate = (power?: number): EasingFunction => {
    const backEasing = createBackIn(power)
    return (p) =>
        (p *= 2) < 1
            ? 0.5 * backEasing(p)
            : 0.5 * (2 - Math.pow(2, -10 * (p - 1)))
}

export const anticipate = createAnticipate()
