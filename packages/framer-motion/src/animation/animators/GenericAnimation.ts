import { time } from "../../frameloop/sync-time"
import { ResolvedKeyframes } from "../../render/utils/KeyframesResolver"
import { instantAnimationState } from "../../utils/use-instant-transition-state"
import { MotionValue } from "../../value"
import { AnimationPlaybackControls, ValueAnimationOptions } from "../types"
import { canAnimate } from "./utils/can-animate"

export abstract class GenericAnimation<T extends string | number>
    implements AnimationPlaybackControls
{
    protected value: MotionValue

    protected options: ValueAnimationOptions

    protected resolvedKeyframes: ResolvedKeyframes<T> | null = null

    protected resolveFinishedPromise: VoidFunction

    protected currentFinishedPromise: Promise<void>

    protected hasStopped = false

    constructor(
        value: MotionValue,
        {
            autoplay = true,
            delay = 0,
            type = "keyframes",
            repeat = 0,
            repeatDelay = 0,
            repeatType = "loop",
            ...options
        }: ValueAnimationOptions
    ) {
        this.value = value
        this.options = {
            autoplay,
            delay,
            type,
            repeat,
            repeatDelay,
            repeatType,
            ...options,
        }
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
    abstract set speed(newSpeed: number)
    abstract get time(): number
    abstract set time(newTime: number)
    abstract get duration(): number
    abstract set duration(newDuration: number)
    abstract get state(): AnimationPlayState

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
