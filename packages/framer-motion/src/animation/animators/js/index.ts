import { AnimationPlaybackControls } from "../../types"
import { keyframes as keyframesGeneratorFactory } from "../../generators/keyframes"
import { spring } from "../../generators/spring/index"
import { inertia } from "../../generators/inertia"
import { AnimationState, KeyframeGenerator } from "../../generators/types"
import { DriverControls } from "./types"
import { ValueAnimationOptions } from "../../types"
import { frameloopDriver } from "./driver-frameloop"
import { clamp } from "../../../utils/clamp"
import {
    millisecondsToSeconds,
    secondsToMilliseconds,
} from "../../../utils/time-conversion"
import { calcGeneratorDuration } from "../../generators/utils/calc-duration"
import { invariant } from "../../../utils/errors"
import { mix } from "../../../utils/mix"
import { pipe } from "../../../utils/pipe"
import {
    KeyframeResolver,
    ResolvedKeyframes,
} from "../../../render/utils/KeyframesResolver"
import { instantAnimationState } from "../../../utils/use-instant-transition-state"
import { getFinalKeyframe } from "../waapi/utils/get-final-keyframe"
import { canSkipAnimation } from "../utils/can-skip"

type GeneratorFactory = (
    options: ValueAnimationOptions<any>
) => KeyframeGenerator<any>

const types: { [key: string]: GeneratorFactory } = {
    decay: inertia,
    inertia,
    tween: keyframesGeneratorFactory,
    keyframes: keyframesGeneratorFactory,
    spring,
}

export interface MainThreadAnimationControls<V>
    extends AnimationPlaybackControls {
    sample: (t: number) => AnimationState<V>
}

const percentToProgress = (percent: number) => percent / 100

function defaultResolveKeyframes<V extends string | number>(
    keyframes: V[],
    onComplete: OnKeyframesResolved<V>,
    name?: string,
    motionValue?: any
) {
    return new KeyframeResolver(keyframes, onComplete, name, motionValue)
}

/**
 * Animate a single value on the main thread.
 *
 * This function is written, where functionality overlaps,
 * to be largely spec-compliant with WAAPI to allow fungibility
 * between the two.
 */
export function animateValue<V extends string | number = number>({
    keyframes: unresolvedKeyframes,
    name,
    element,
    motionValue,
    autoplay = true,
    delay = 0,
    driver = frameloopDriver,
    type = "keyframes",
    repeat = 0,
    repeatDelay = 0,
    repeatType = "loop",
    onPlay,
    onStop,
    onComplete,
    onUpdate,
    ...options
}: ValueAnimationOptions<V>): MainThreadAnimationControls<V> {
    let playState: AnimationPlayState = "idle"
    let holdTime: number | null = null
    let startTime: number | null = null
    let cancelTime: number | null = null
    let speed = 1
    let currentTime = 0
    let resolvedDuration = Infinity
    let calculatedDuration: number | null = null
    let totalDuration = Infinity
    let hasStopped = false
    let resolveFinishedPromise: VoidFunction
    let currentFinishedPromise: Promise<void>

    let generator: KeyframeGenerator<V> | undefined
    let mirroredGenerator: KeyframeGenerator<V> | undefined
    /**
     * If this isn't the keyframes generator and we've been provided
     * strings as keyframes, we need to interpolate these.
     * TODO: Support velocity for units and complex value types/
     */
    let mapNumbersToKeyframes: undefined | ((t: number) => V)

    /**
     * Resolve the current Promise every time we enter the
     * finished state. This is WAAPI-compatible behaviour.
     */
    const updateFinishedPromise = () => {
        currentFinishedPromise = new Promise((resolve) => {
            resolveFinishedPromise = resolve
        })
    }

    // Create the first finished promise
    updateFinishedPromise()

    const finish = () => {
        playState = "finished"
        onComplete && onComplete()
        stopAnimationDriver()
        resolveFinishedPromise()
    }

    let animationDriver: DriverControls | undefined

    const isInterruptingAnimation = Boolean(
        motionValue && motionValue.animation
    )

    let initialKeyframe: V
    const createGenerator = (keyframes: ResolvedKeyframes<any>) => {
        console.log("create generator")
        if (
            canSkipAnimation(
                keyframes,
                isInterruptingAnimation,
                name,
                type,
                options.isHandoff,
                options.velocity
            )
        ) {
            console.log("skipping", keyframes)
            if (instantAnimationState.current || !delay) {
                if (onUpdate) {
                    onUpdate(
                        getFinalKeyframe(keyframes, { repeat, repeatType })
                    )
                }
                finish()
                return
            } else {
                options.duration = 0
            }
        }

        initialKeyframe = keyframes[0]
        const generatorFactory = types[type] || keyframesGeneratorFactory

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

            mapNumbersToKeyframes = pipe(
                percentToProgress,
                mix(keyframes[0], keyframes[1])
            ) as (t: number) => V

            keyframes = [0, 100] as any
        }

        generator = generatorFactory({ ...options, keyframes })

        if (repeatType === "mirror") {
            mirroredGenerator = generatorFactory({
                ...options,
                keyframes: [...keyframes].reverse(),
                velocity: -(options.velocity || 0),
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
        if (generator.calculatedDuration === null && repeat) {
            generator.calculatedDuration = calcGeneratorDuration(generator)
        }

        calculatedDuration = generator.calculatedDuration

        if (calculatedDuration !== null) {
            resolvedDuration = calculatedDuration + repeatDelay
            totalDuration = resolvedDuration * (repeat + 1) - repeatDelay
        }

        autoplay && play()
    }

    const tick = (timestamp: number) => {
        console.log({ startTime, hasGenerator: !!generator })
        if (startTime === null || !generator) return

        /**
         * requestAnimationFrame timestamps can come through as lower than
         * the startTime as set by performance.now(). Here we prevent this,
         * though in the future it could be possible to make setting startTime
         * a pending operation that gets resolved here.
         */
        if (speed > 0) startTime = Math.min(startTime, timestamp)
        if (speed < 0)
            startTime = Math.min(timestamp - totalDuration / speed, startTime)

        if (holdTime !== null) {
            currentTime = holdTime
        } else {
            // Rounding the time because floating point arithmetic is not always accurate, e.g. 3000.367 - 1000.367 =
            // 2000.0000000000002. This is a problem when we are comparing the currentTime with the duration, for
            // example.
            currentTime = Math.round(timestamp - startTime) * speed
        }

        // Rebase on delay
        const timeWithoutDelay = currentTime - delay * (speed >= 0 ? 1 : -1)
        const isInDelayPhase =
            speed >= 0 ? timeWithoutDelay < 0 : timeWithoutDelay > totalDuration
        currentTime = Math.max(timeWithoutDelay, 0)

        /**
         * If this animation has finished, set the current time
         * to the total duration.
         */
        if (playState === "finished" && holdTime === null) {
            currentTime = totalDuration
        }

        let elapsed = currentTime

        let frameGenerator = generator

        if (repeat) {
            /**
             * Get the current progress (0-1) of the animation. If t is >
             * than duration we'll get values like 2.5 (midway through the
             * third iteration)
             */
            const progress =
                Math.min(currentTime, totalDuration) / resolvedDuration

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
            ? { done: false, value: initialKeyframe }
            : frameGenerator.next(elapsed)

        if (mapNumbersToKeyframes) {
            state.value = mapNumbersToKeyframes(state.value as number)
        }

        let { done } = state

        if (!isInDelayPhase && calculatedDuration !== null) {
            done = speed >= 0 ? currentTime >= totalDuration : currentTime <= 0
        }

        const isAnimationFinished =
            holdTime === null &&
            (playState === "finished" || (playState === "running" && done))
        console.log("Updating with", state.value)
        if (onUpdate) {
            onUpdate(state.value)
        }

        if (isAnimationFinished) {
            finish()
        }

        return state
    }

    const stopAnimationDriver = () => {
        animationDriver && animationDriver.stop()
        animationDriver = undefined
    }

    const cancel = () => {
        playState = "idle"
        stopAnimationDriver()
        resolveFinishedPromise()
        updateFinishedPromise()
        startTime = cancelTime = null
        keyframeResolver.cancel()
    }

    const play = () => {
        // TODO allow async
        if (hasStopped) return

        if (!animationDriver) animationDriver = driver(tick)

        // TODO Create microtask to set a time for this event stack
        const now = animationDriver.now()

        onPlay && onPlay()

        if (holdTime !== null) {
            startTime = now - holdTime
        } else if (!startTime || playState === "finished") {
            startTime = now
        }

        if (playState === "finished") {
            updateFinishedPromise()
        }

        cancelTime = startTime
        holdTime = null

        /**
         * Set playState to running only after we've used it in
         * the previous logic.
         */
        playState = "running"

        animationDriver.start()
    }

    const keyframeResolver =
        element && name && motionValue
            ? element.resolveKeyframes(
                  unresolvedKeyframes,
                  createGenerator,
                  name,
                  motionValue
              )
            : new KeyframeResolver(
                  unresolvedKeyframes,
                  createGenerator,
                  name,
                  motionValue,
                  element
              )

    const controls = {
        then(resolve: VoidFunction, reject?: VoidFunction) {
            return currentFinishedPromise.then(resolve, reject)
        },
        get time() {
            return millisecondsToSeconds(currentTime)
        },
        set time(newTime: number) {
            newTime = secondsToMilliseconds(newTime)

            currentTime = newTime
            if (holdTime !== null || !animationDriver || speed === 0) {
                holdTime = newTime
            } else {
                startTime = animationDriver.now() - newTime / speed
            }
        },
        get duration() {
            // TODO: If no generator, flush pending keyframes
            if (!generator) {
                return 0
            }

            const duration =
                generator.calculatedDuration === null
                    ? calcGeneratorDuration(generator)
                    : generator.calculatedDuration

            return millisecondsToSeconds(duration)
        },
        get speed() {
            return speed
        },
        set speed(newSpeed: number) {
            if (newSpeed === speed || !animationDriver) return
            speed = newSpeed
            controls.time = millisecondsToSeconds(currentTime)
        },
        get state() {
            return playState
        },
        play,
        pause: () => {
            playState = "paused"
            holdTime = currentTime
        },
        stop: () => {
            hasStopped = true
            if (playState === "idle") return
            playState = "idle"
            onStop && onStop()
            cancel()
        },
        cancel: () => {
            if (cancelTime !== null) tick(cancelTime)
            cancel()
        },
        complete: () => {
            playState = "finished"
            holdTime === null
        },
        sample: (elapsed: number) => {
            startTime = 0
            console.log("sample")
            return tick(elapsed)!
        },
    }

    return controls
}
