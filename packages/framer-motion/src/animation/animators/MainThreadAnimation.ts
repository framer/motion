import {
    KeyframeResolver,
    ResolvedKeyframes,
} from "../../render/utils/KeyframesResolver"
import { spring } from "../generators/spring/index"
import { inertia } from "../generators/inertia"
import { keyframes as keyframesGeneratorFactory } from "../generators/keyframes"
import { ValueAnimationOptions } from "../types"
import { BaseAnimation } from "./BaseAnimation"
import { AnimationState, KeyframeGenerator } from "../generators/types"
import { pipe } from "../../utils/pipe"
import { mix } from "../../utils/mix"
import { calcGeneratorDuration } from "../generators/utils/calc-duration"
import { DriverControls } from "./js/types"
import { frameloopDriver } from "./js/driver-frameloop"
import {
    millisecondsToSeconds,
    secondsToMilliseconds,
} from "../../utils/time-conversion"
import { clamp } from "../../utils/clamp"
import { invariant } from "../../utils/errors"

type GeneratorFactory = (
    options: ValueAnimationOptions<any>
) => KeyframeGenerator<any>

const generators: { [key: string]: GeneratorFactory } = {
    decay: inertia,
    inertia,
    tween: keyframesGeneratorFactory,
    keyframes: keyframesGeneratorFactory,
    spring,
}

const percentToProgress = (percent: number) => percent / 100

interface ResolvedData<T extends string | number> {
    generator: KeyframeGenerator<T>
    mirroredGenerator: KeyframeGenerator<T> | undefined
    mapPercentToKeyframes: ((v: number) => T) | undefined
    calculatedDuration: number
    resolvedDuration: number
    totalDuration: number
}

export class MainThreadAnimation<
    T extends string | number
> extends BaseAnimation<T, ResolvedData<T>> {
    private driver?: DriverControls

    private holdTime: number | null = null

    private startTime: number | null = null

    private cancelTime: number | null = null

    private currentTime: number = 0

    private playbackSpeed = 1

    protected initKeyframeResolver() {
        const { name, motionValue, keyframes } = this.options
        const onResolved = (resolvedKeyframes: ResolvedKeyframes<T>) =>
            this.onKeyframesResolved(resolvedKeyframes)

        if (name && motionValue && motionValue.owner) {
            return (motionValue.owner as any).resolveKeyframes(
                keyframes,
                onResolved,
                name,
                motionValue
            )
        } else {
            return new KeyframeResolver(
                keyframes,
                onResolved,
                name,
                motionValue
            )
        }
    }

    protected initPlayback(keyframes: ResolvedKeyframes<T>) {
        const {
            autoplay = true,
            type = "keyframes",
            repeat = 0,
            repeatDelay = 0,
            repeatType,
            velocity = 0,
        } = this.options

        const generatorFactory = generators[type] || keyframesGeneratorFactory

        let mapPercentToKeyframes: ((v: number) => T) | undefined
        let mirroredGenerator: KeyframeGenerator<T> | undefined

        if (
            generatorFactory !== keyframesGeneratorFactory &&
            typeof keyframes[0] !== "number"
        ) {
            if (process.env.NODE_ENV !== "production") {
                invariant(
                    keyframes.length === 2,
                    `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${keyframes}`
                )
            }

            mapPercentToKeyframes = pipe(
                percentToProgress,
                mix(keyframes[0], keyframes[1])
            ) as (t: number) => T

            keyframes = [0 as T, 100 as T]
        }

        const generator = generatorFactory({ ...this.options, keyframes })

        if (repeatType === "mirror") {
            mirroredGenerator = generatorFactory({
                ...this.options,
                keyframes: [...keyframes].reverse(),
                velocity: -velocity,
            })
        }

        /**
         * If duration is undefined and we have repeat options,
         * we need to calculate a duration from the generator.
         *
         * We set it to the generator itself to cache the duration.
         * Any timeline resolver will need to have already precalculated
         * the duration by this step.
         */
        if (generator.calculatedDuration === null) {
            generator.calculatedDuration = calcGeneratorDuration(generator)
        }

        const { calculatedDuration } = generator
        const resolvedDuration = calculatedDuration + repeatDelay
        const totalDuration = resolvedDuration * (repeat + 1) - repeatDelay

        autoplay && this.play()

        return {
            generator,
            mirroredGenerator,
            mapPercentToKeyframes,
            calculatedDuration,
            resolvedDuration,
            totalDuration,
        }
    }

    tick(timestamp: number) {
        const {
            generator,
            mirroredGenerator,
            mapPercentToKeyframes,
            keyframes,
            calculatedDuration,
            totalDuration,
            resolvedDuration,
        } = this.resolved

        if (this.startTime === null) return generator.next(0)

        const { delay, repeat, repeatType, repeatDelay, onUpdate } =
            this.options

        /**
         * requestAnimationFrame timestamps can come through as lower than
         * the startTime as set by performance.now(). Here we prevent this,
         * though in the future it could be possible to make setting startTime
         * a pending operation that gets resolved here.
         */
        if (this.speed > 0) {
            this.startTime = Math.min(this.startTime, timestamp)
        } else if (this.speed < 0) {
            this.startTime = Math.min(
                timestamp - totalDuration / this.speed,
                this.startTime
            )
        }

        // Update currentTime
        if (this.holdTime !== null) {
            this.currentTime = this.holdTime
        } else {
            // Rounding the time because floating point arithmetic is not always accurate, e.g. 3000.367 - 1000.367 =
            // 2000.0000000000002. This is a problem when we are comparing the currentTime with the duration, for
            // example.
            this.currentTime =
                Math.round(timestamp - this.startTime) * this.speed
        }

        // Rebase on delay
        const timeWithoutDelay =
            this.currentTime - delay * (this.speed >= 0 ? 1 : -1)
        const isInDelayPhase =
            this.speed >= 0
                ? timeWithoutDelay < 0
                : timeWithoutDelay > totalDuration
        this.currentTime = Math.max(timeWithoutDelay, 0)

        // If this animation has finished, set the current time  to the total duration.
        if (this.state === "finished" && this.holdTime === null) {
            this.currentTime = totalDuration
        }

        let elapsed = this.currentTime

        let frameGenerator = generator

        if (repeat) {
            /**
             * Get the current progress (0-1) of the animation. If t is >
             * than duration we'll get values like 2.5 (midway through the
             * third iteration)
             */
            const progress =
                Math.min(this.currentTime, totalDuration) / resolvedDuration

            /**
             * Get the current iteration (0 indexed). For instance the floor of
             * 2.5 is 2.
             */
            let currentIteration = Math.floor(progress)

            /**
             * Get the current progress of the iteration by taking the remainder
             * so 2.5 is 0.5 through iteration 2
             */
            let iterationProgress = progress % 1.0

            /**
             * If iteration progress is 1 we count that as the end
             * of the previous iteration.
             */
            if (!iterationProgress && progress >= 1) {
                iterationProgress = 1
            }

            iterationProgress === 1 && currentIteration--

            currentIteration = Math.min(currentIteration, repeat + 1)

            /**
             * Reverse progress if we're not running in "normal" direction
             */

            const isOddIteration = Boolean(currentIteration % 2)
            if (isOddIteration) {
                if (repeatType === "reverse") {
                    iterationProgress = 1 - iterationProgress
                    if (repeatDelay) {
                        iterationProgress -= repeatDelay / resolvedDuration
                    }
                } else if (repeatType === "mirror") {
                    frameGenerator = mirroredGenerator!
                }
            }

            elapsed = clamp(0, 1, iterationProgress) * resolvedDuration
        }

        /**
         * If we're in negative time, set state as the initial keyframe.
         * This prevents delay: x, duration: 0 animations from finishing
         * instantly.
         */
        const state = isInDelayPhase
            ? { done: false, value: keyframes[0] }
            : frameGenerator.next(elapsed)

        if (mapPercentToKeyframes) {
            state.value = mapPercentToKeyframes(state.value as number)
        }

        let { done } = state

        if (!isInDelayPhase && calculatedDuration !== null) {
            done =
                this.speed >= 0
                    ? this.currentTime >= totalDuration
                    : this.currentTime <= 0
        }

        const isAnimationFinished =
            this.holdTime === null &&
            (this.state === "finished" || (this.state === "running" && done))

        if (onUpdate) {
            onUpdate(state.value)
        }

        if (isAnimationFinished) {
            this.finish()
        }

        return state
    }

    state: AnimationPlayState = "idle"

    get duration() {
        return millisecondsToSeconds(this.resolved.calculatedDuration)
    }

    get time() {
        return millisecondsToSeconds(this.currentTime)
    }

    set time(newTime: number) {
        newTime = secondsToMilliseconds(newTime)
        this.currentTime = newTime

        if (this.holdTime !== null || !this.driver || this.speed === 0) {
            this.holdTime = newTime
        } else {
            this.startTime = this.driver.now() - newTime / this.speed
        }
    }

    get speed() {
        return this.playbackSpeed
    }

    set speed(newSpeed: number) {
        const hasChanged = this.playbackSpeed !== newSpeed
        this.playbackSpeed = newSpeed
        if (hasChanged) {
            this.time = millisecondsToSeconds(this.currentTime)
        }
    }

    play() {
        if (this.isStopped) return

        const { driver = frameloopDriver, onPlay } = this.options

        if (!this.driver) {
            this.driver = driver((timestamp) => this.tick(timestamp))
        }

        onPlay && onPlay()

        const now = this.driver.now()

        if (this.holdTime !== null) {
            this.startTime = now - this.holdTime
        } else if (!this.startTime || this.state === "finished") {
            this.startTime = now
        }

        if (this.state === "finished") {
            this.updateFinishedPromise()
        }

        this.cancelTime = this.startTime
        this.holdTime = null
        this.state = "running"

        this.driver.start()
    }

    pause() {
        this.state = "paused"
        this.holdTime = this.currentTime
    }

    stop() {
        this.isStopped = true
        if (this.state === "idle") return

        this.state = "idle"
        const { onStop } = this.options
        onStop && onStop()
        this.teardown()
    }

    complete() {
        this.state = "finished"
        this.holdTime = null
    }

    finish() {
        this.state = "finished"
        const { onComplete } = this.options
        onComplete && onComplete()
        this.resolveFinishedPromise()
        this.updateFinishedPromise()
        this.stopDriver()
    }

    cancel() {
        if (this.cancelTime !== null) {
            this.tick(this.cancelTime)
        }
        this.teardown()
    }

    private teardown() {
        this.state = "idle"
        this.stopDriver()
        this.resolveFinishedPromise()
        this.updateFinishedPromise()
        this.startTime = this.cancelTime = null
        this.resolver.cancel() // TODO Add test with play after this
    }

    private stopDriver() {
        if (!this.driver) return
        this.driver.stop()
        this.driver = undefined
    }

    sample(time: number): AnimationState<T> {
        this.startTime = 0
        return this.tick(time)
    }
}
