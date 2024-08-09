import type { Batcher } from "../../frameloop/types"

export interface HandoffInfo {
    elapsed: number
    startTime: number
}

export type HandoffFunction = (
    storeId: string,
    valueName: string,
    frame: Batcher
) => null | HandoffInfo

/**
 * The window global object acts as a bridge between our inline script
 * triggering the optimized appear animations, and Framer Motion.
 */
declare global {
    interface Window {
        MotionHandoffAnimation?: HandoffFunction
        MotionHandoffIsComplete?: boolean
        MotionCancelOptimisedTransform?: (id?: string) => void
        MotionHasOptimisedAnimation?: (id?: string) => boolean
    }
}
