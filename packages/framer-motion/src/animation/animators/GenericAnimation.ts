import { time } from "../../frameloop/sync-time"
import { ResolvedKeyframes } from "../../render/utils/KeyframesResolver"
import { instantAnimationState } from "../../utils/use-instant-transition-state"
import { MotionValue } from "../../value"
import { AnimationPlaybackControls, ValueAnimationOptions } from "../types"
import { canAnimate } from "./utils/can-animate"

export abstract class GenericAnimation<T extends string | number>
    implements AnimationPlaybackControls
{
    value: MotionValue

    options: ValueAnimationOptions

    resolvedKeyframes: ResolvedKeyframes<T> | null = null

    resolveFinishedPromise: VoidFunction

    currentFinishedPromise: Promise<void>

    hasStopped = false

    constructor(value: MotionValue, options: ValueAnimationOptions) {
        this.value = value
        this.options = options
        this.updateFinishedPromise()
    }

    abstract initPlayback(
        keyframes: ResolvedKeyframes<T>,
        startTime: number
    ): void
    abstract play(): void
    abstract pause(): void
    abstract complete(): void
    abstract stop(): void
    abstract cancel(): void
    abstract get speed(): number
    abstract set speed(speed: number)
    abstract get time(): number
    abstract set time(time: number)
    abstract get duration(): number
    abstract set duration(duration: number)

    onKeyframesResolved(keyframes: ResolvedKeyframes<T>) {
        this.resolvedKeyframes = keyframes
        const { name, type, velocity, delay } = this.options

        /**
         * If we can't animate this value with the resolved keyframes
         * then we should complete it immediately.
         */
        if (!canAnimate(keyframes, name, type, velocity)) {
            // Finish immediately
            if (instantAnimationState.current || !delay) {
                this.complete()
                return
            }
            // Finish after a delay
            else {
                this.options.duration = 0
            }
        }

        this.initPlayback(keyframes, time.now())
    }

    then(resolve: VoidFunction, reject?: VoidFunction) {
        return this.currentFinishedPromise.then(resolve, reject)
    }

    private updateFinishedPromise() {
        this.currentFinishedPromise = new Promise((resolve) => {
            this.resolveFinishedPromise = () => {
                resolve()
                this.updateFinishedPromise()
            }
        })
    }
}
