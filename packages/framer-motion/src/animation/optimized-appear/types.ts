import { Sync } from "../../frameloop/types"
import { MotionValue } from "../../value"

/**
 * The window global object acts as a bridge between our inline script
 * triggering the optimized appear animations, and Framer Motion.
 */
declare global {
    interface Window {
        HandoffAppearAnimations?: (
            storeId: string,
            valueName: string,
            value: MotionValue,
            sync: Sync
        ) => number
    }
}
