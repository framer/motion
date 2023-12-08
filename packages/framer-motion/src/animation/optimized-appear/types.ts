import type { Batcher } from "../../frameloop/types"
import type { MotionValue } from "../../value"

export type HandoffFunction = (
    storeId: string,
    valueName: string,
    /**
     * Legacy arguments. This function is inlined as part of SSG so it can be there's
     * a version mismatch between the main included Motion and the inlined script.
     *
     * Remove in early 2024.
     */
    _value: MotionValue,
    _frame: Batcher
) => null | number

/**
 * The window global object acts as a bridge between our inline script
 * triggering the optimized appear animations, and Framer Motion.
 */
declare global {
    interface Window {
        HandoffAppearAnimations?: HandoffFunction
        HandoffComplete?: boolean
    }
}
