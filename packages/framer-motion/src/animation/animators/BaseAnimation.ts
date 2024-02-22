import {
    KeyframeResolver,
    ResolvedKeyframes,
    flushKeyframeResolvers,
} from "../../render/utils/KeyframesResolver"
import { instantAnimationState } from "../../utils/use-instant-transition-state"
import {
    AnimationPlaybackControls,
    RepeatType,
    ValueAnimationOptions,
} from "../types"
import { canAnimate } from "./utils/can-animate"
import { getFinalKeyframe } from "./waapi/utils/get-final-keyframe"

export interface ValueAnimationOptionsWithDefaults<T extends string | number>
    extends ValueAnimationOptions<T> {
    autoplay: boolean
    delay: number
    repeat: number
    repeatDelay: number
    repeatType: RepeatType
}

export abstract class BaseAnimation<T extends string | number, Resolved>
    implements AnimationPlaybackControls
{
    // Persistent reference to the options used to create this animation
    protected options: ValueAnimationOptionsWithDefaults<T>

    // Resolve the current finished promise
    protected resolveFinishedPromise: VoidFunction

    // A promise that resolves when the animation is complete
    protected currentFinishedPromise: Promise<void>

    // Track whether the animation has been stopped. Stopped animations won't restart.
    protected isStopped = false

    // Internal reference to defered resolved keyframes and animation-specific data returned from initPlayback.
    private _resolved: Resolved & { keyframes: ResolvedKeyframes<T> }

    // Reference to the active keyframes resolver.
    protected resolver: KeyframeResolver<T>

    constructor({
        autoplay = true,
        delay = 0,
        type = "keyframes",
        repeat = 0,
        repeatDelay = 0,
        repeatType = "loop",
        ...options
    }: ValueAnimationOptions<T>) {
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

    protected abstract initPlayback(keyframes: ResolvedKeyframes<T>): Resolved

    abstract play(): void
    abstract pause(): void
    abstract stop(): void
    abstract cancel(): void
    abstract get speed(): number
    abstract set speed(newSpeed: number)
    abstract get time(): number
    abstract set time(newTime: number)
    abstract get duration(): number
    abstract get state(): AnimationPlayState

    /**
     * A getter for resolved data. If keyframes are not yet resolved, accessing
     * this.resolved will synchronously flush all pending keyframe resolvers.
     * This is a deoptimisation, but at its worst still batches read/writes.
     */
    get resolved(): Resolved & { keyframes: ResolvedKeyframes<T> } {
        // TODO Leave only for tests
        if (this.isInitialising)
            throw new Error("Cannot access `resolved` while initialising.")
        if (!this._resolved) flushKeyframeResolvers()

        return this._resolved
    }

    /**
     * A method to be called when the keyframes resolver completes. This method
     * will check if its possible to run the animation and, if not, skip it.
     * Otherwise, it will call initPlayback on the implementing class.
     */
    private isInitialising = false
    protected onKeyframesResolved(keyframes: ResolvedKeyframes<T>) {
        this.isInitialising = true
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

        this._resolved = {
            ...this.initPlayback(keyframes),
            keyframes,
        }

        this.isInitialising = false
    }

    complete() {
        const { onComplete, motionValue } = this.options
        onComplete && onComplete()

        if (motionValue) {
            motionValue.set(
                getFinalKeyframe(this.resolved.keyframes, this.options)
            )
        }
    }

    /**
     * Allows the returned animation to be awaited or promise-chained. Currently
     * resolves when the animation finishes at all but in a future update could/should
     * reject if its cancels.
     */
    then(resolve: VoidFunction, reject?: VoidFunction) {
        return this.currentFinishedPromise.then(resolve, reject)
    }

    protected updateFinishedPromise() {
        this.currentFinishedPromise = new Promise((resolve) => {
            this.resolveFinishedPromise = () => {
                resolve()
                this.updateFinishedPromise()
            }
        })
    }
}
