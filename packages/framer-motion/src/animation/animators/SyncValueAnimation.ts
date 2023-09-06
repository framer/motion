import { ValueAnimation } from "./ValueAnimation"
import { ValueAnimationOptions } from "../types"
import { MotionValue } from "../../value"

export interface SyncValueAnimationOptions extends ValueAnimationOptions {}

export class SyncValueAnimation extends ValueAnimation {
    constructor(value: MotionValue, options: SyncValueAnimationOptions) {
        super(value, options)
        /**
         * 1. Make animatable
         *    - If this is changing value types, or reading CSS values
         *      we need to read those
         */
    }
}
