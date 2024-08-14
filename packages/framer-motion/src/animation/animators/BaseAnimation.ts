import { time } from "../../frameloop/sync-time"
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

/**
 * Maximum time allowed between an animation being created and it being
 * resolved for us to use the latter as the start time.
 *
 * This is to ensure that while we prefer to "start" an animation as soon
 * as it's triggered, we also want to avoid a visual jump if there's a big delay
 * between these two moments.
 */
const MAX_RESOLVE_DELAY = 40

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
    protected _resolved: Resolved & { keyframes: ResolvedKeyframes<T> }

    protected hasAttemptedResolve = false

    // Reference to the active keyframes resolver.
    protected resolver: KeyframeResolver<T>

    private createdAt: number

    private resolvedAt: number | undefined

    constructor({
        autoplay = true,
        delay = 0,
        type = "keyframes",
        repeat = 0,
        repeatDelay = 0,
        repeatType = "loop",
        ...options
    }: ValueAnimationOptions<T>) {
        this.createdAt = time.now()

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

    /**
     * This method uses the createdAt and resolvedAt to calculate the
     * animation startTime. *Ideally*, we would use the createdAt time as t=0
     * as the following frame would then be the first frame of the animation in
     * progress, which would feel snappier.
     *
     * However, if there's a delay (main thread work) between the creation of
     * the animation and the first commited frame, we prefer to use resolvedAt
     * to avoid a sudden jump into the animation.
     */
    calcStartTime() {
        if (!this.resolvedAt) return this.createdAt

        return this.resolvedAt - this.createdAt > MAX_RESOLVE_DELAY
            ? this.resolvedAt
            : this.createdAt
    }

    protected abstract initPlayback(
        keyframes: ResolvedKeyframes<T>,
        finalKeyframe?: T
    ): Resolved | false

    abstract play(): void
    abstract pause(): void
    abstract stop(): void
    abstract cancel(): void
    abstract complete(): void
    abstract get speed(): number
    abstract set speed(newSpeed: number)
    abstract get time(): number
    abstract set time(newTime: number)
    abstract get duration(): number
    abstract get state(): AnimationPlayState
    abstract get startTime(): number | null

    /**
     * A getter for resolved data. If keyframes are not yet resolved, accessing
     * this.resolved will synchronously flush all pending keyframe resolvers.
     * This is a deoptimisation, but at its worst still batches read/writes.
     */
    get resolved():
        | (Resolved & {
              keyframes: ResolvedKeyframes<T>
              finalKeyframe?: T
          })
        | undefined {
        if (!this._resolved && !this.hasAttemptedResolve) {
            flushKeyframeResolvers()
        }

        return this._resolved
    }

    /**
     * A method to be called when the keyframes resolver completes. This method
     * will check if its possible to run the animation and, if not, skip it.
     * Otherwise, it will call initPlayback on the implementing class.
     */
    protected onKeyframesResolved(
        keyframes: ResolvedKeyframes<T>,
        finalKeyframe?: T
    ) {
        this.resolvedAt = time.now()
        this.hasAttemptedResolve = true
        const {
            name,
            type,
            velocity,
            delay,
            onComplete,
            onUpdate,
            isGenerator,
        } = this.options

        /**
         * If we can't animate this value with the resolved keyframes
         * then we should complete it immediately.
         */
        if (!isGenerator && !canAnimate(keyframes, name, type, velocity)) {
            // Finish immediately
            if (instantAnimationState.current || !delay) {
                onUpdate?.(
                    getFinalKeyframe(keyframes, this.options, finalKeyframe)
                )
                onComplete?.()
                this.resolveFinishedPromise()

                return
            }
            // Finish after a delay
            else {
                this.options.duration = 0
            }
        }

        const resolvedAnimation = this.initPlayback(keyframes, finalKeyframe)

        if (resolvedAnimation === false) return

        this._resolved = {
            keyframes,
            finalKeyframe,
            ...resolvedAnimation,
        }

        this.onPostResolved()
    }

    onPostResolved() {}

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
            this.resolveFinishedPromise = resolve
        })
    }
}
