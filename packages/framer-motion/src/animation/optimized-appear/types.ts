import type { Batcher } from "../../frameloop/types"
import { MotionValue } from "../../value"
import { optimizedAppearDataAttribute } from "./data-id"

/**
 * Expose only the needed part of the VisualElement interface to
 * ensure React types don't end up in the generic DOM bundle.
 */
export interface WithAppearProps {
    props: {
        [optimizedAppearDataAttribute]?: string
        values?: {
            [key: string]: MotionValue<number> | MotionValue<string>
        }
    }
}

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
            valueName?: string,
            frame?: Batcher,
            canResume?: boolean
        ) => void
        MotionCheckAppearSync?: (
            visualElement: WithAppearProps,
            valueName: string,
            value: MotionValue
        ) => VoidFunction | void
    }
}
