import type { Batcher } from "../../frameloop/types"

export type HandoffFunction = (
    storeId: string,
    valueName: string,
    frame: Batcher
) => number | null

/**
 * The window global object acts as a bridge between our inline script
 * triggering the optimized appear animations, and Framer Motion.
 */
declare global {
    interface Window {
        MotionHandoffAnimation?: HandoffFunction
        MotionHandoffIsComplete?: boolean
        MotionHasOptimisedAnimation?: (
            elementId?: string,
            valueName?: string
        ) => boolean
        MotionCancelOptimisedAnimation?: (
            elementId?: string,
            valueName?: string
        ) => void
    }
}
