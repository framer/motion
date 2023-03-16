import { AnimationPlaybackControls } from "../../types"
import { keyframes as keyframesGeneratorFactory } from "../../generators/keyframes"
import { spring } from "../../generators/spring/index"
import { inertia } from "../../generators/inertia"
import { AnimationState, KeyframeGenerator } from "../../generators/types"
import { DriverControls } from "./types"
import { AnimationOptions } from "../../types"
import { frameloopDriver } from "./driver-frameloop"
import { interpolate } from "../../../utils/interpolate"
import { clamp } from "../../../utils/clamp"
import {
    millisecondsToSeconds,
    secondsToMilliseconds,
} from "../../../utils/time-conversion"

type GeneratorFactory = (
    options: AnimationOptions<any>
) => KeyframeGenerator<any>

const types: { [key: string]: GeneratorFactory } = {
    decay: inertia,
    inertia,
    tween: keyframesGeneratorFactory,
    keyframes: keyframesGeneratorFactory,
    spring,
}

/**
 * Implement a practical max duration for keyframe generation
 * to prevent infinite loops
 */
const maxDuration = 20_000
function calculateDuration(generator: KeyframeGenerator<unknown>) {
    let duration = 0
    const timeStep = 50
    let state = generator.next(duration)
    while (!state.done && duration < maxDuration) {
        duration += timeStep
        state = generator.next(duration)
    }
    return duration
}

export interface MainThreadAnimationControls<V>
    extends AnimationPlaybackControls {
    sample: (t: number) => AnimationState<V>
}

export function animateValue<V = number>({
    autoplay = true,
    delay = 0,
    driver = frameloopDriver,
    keyframes,
    type = "keyframes",
    repeat = 0,
    repeatDelay = 0,
    repeatType = "loop",
    onPlay,
    onStop,
    onComplete,
    onUpdate,
    ...options
}: AnimationOptions<V>): MainThreadAnimationControls<V> {
    let resolveFinishedPromise: VoidFunction
    let currentFinishedPromise: Promise<void>

    /**
     * Create a new finished Promise every time we enter the
     * finished state and resolve the old Promise. This is
     * WAAPI-compatible behaviour.
     */
    const updateFinishedPromise = () => {
        currentFinishedPromise = new Promise((resolve) => {
            resolveFinishedPromise = resolve
        })
    }

    // Create the first finished promise
    updateFinishedPromise()

    let animationDriver: DriverControls | undefined

    const generatorFactory = types[type] || keyframesGeneratorFactory

    /**
     * If this isn't the keyframes generator and we've been provided
     * strings as keyframes, we need to interpolate these.
     * TODO: Support velocity for units and complex value types/
     */
    let mapNumbersToKeyframes: undefined | ((t: number) => V)
    if (
        generatorFactory !== keyframesGeneratorFactory &&
        typeof keyframes[0] !== "number"
    ) {
        mapNumbersToKeyframes = interpolate([0, 100], keyframes, {
            clamp: false,
        })
        keyframes = [0, 100] as any
    }

    const generator = generatorFactory({ ...options, keyframes })

    let mirroredGenerator: KeyframeGenerator<unknown> | undefined
    if (repeatType === "mirror") {
        mirroredGenerator = generatorFactory({
            ...options,
            keyframes: [...keyframes].reverse(),
            velocity: -(options.velocity || 0),
        })
    }

    let playState: AnimationPlayState = "idle"
    let holdTime: number | null = null
    let startTime: number | null = null

    /**
     * If duration is undefined and we have repeat options,
     * we need to calculate a duration from the generator.
     *
     * We set it to the generator itself to cache the duration.
     * Any timeline resolver will need to have already precalculated
     * the duration by this step.
     */
    if (generator.calculatedDuration === null && repeat) {
        generator.calculatedDuration = calculateDuration(generator)
    }

    const { calculatedDuration } = generator

    let resolvedDuration = Infinity
    let totalDuration = Infinity

    if (calculatedDuration) {
        resolvedDuration = calculatedDuration + repeatDelay
        totalDuration = resolvedDuration * (repeat + 1) - repeatDelay
    }

    let time = 0
    const tick = (timestamp: number) => {
        if (startTime === null) return

        if (holdTime !== null) {
            time = holdTime
        } else {
            time = timestamp - startTime
        }

        // Rebase on delay
        time = Math.max(time - delay, 0)

        /**
         * If this animation has finished, set the current time
         * to the total duration.
         */
        if (playState === "finished" && holdTime === null) {
            time = totalDuration
        }

        let elapsed = time

        let frameGenerator = generator

        if (repeat) {
            /**
             * Get the current progress (0-1) of the animation. If t is >
             * than duration we'll get values like 2.5 (midway through the
             * third iteration)
             */
            const progress = time / resolvedDuration

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

            /**
             * Reverse progress if we're not running in "normal" direction
             */
            const iterationIsOdd = currentIteration % 2
            if (iterationIsOdd) {
                if (repeatType === "reverse") {
                    iterationProgress = 1 - iterationProgress
                    if (repeatDelay) {
                        iterationProgress -= repeatDelay / resolvedDuration
                    }
                } else if (repeatType === "mirror") {
                    frameGenerator = mirroredGenerator!
                }
            }

            const p =
                time >= totalDuration
                    ? repeatType === "reverse" && iterationIsOdd
                        ? 0
                        : 1
                    : clamp(0, 1, iterationProgress)

            elapsed = p * resolvedDuration
        }

        const state = frameGenerator.next(elapsed)
        let { value, done } = state
        console.log(value)
        if (onUpdate) {
            onUpdate(
                mapNumbersToKeyframes ? mapNumbersToKeyframes(value) : value
            )
        }

        if (calculatedDuration !== null) {
            done = time >= totalDuration
        }

        const isAnimationFinished =
            holdTime === null &&
            (playState === "finished" || (playState === "running" && done))

        if (isAnimationFinished) {
            finish()
        }

        return state
    }

    const finish = () => {
        animationDriver && animationDriver.stop()
        playState = "finished"
        onComplete && onComplete()
        resolveFinishedPromise()
        updateFinishedPromise()
    }

    const play = () => {
        if (!animationDriver) animationDriver = driver(tick)

        const now = animationDriver.now()

        onPlay && onPlay()

        playState = "running"

        if (holdTime !== null) {
            startTime = now - holdTime
        } else if (!startTime) {
            // TODO When implementing play/pause, check WAAPI
            // logic around finished animations
            startTime = now
        }

        holdTime = null

        animationDriver.start()
    }

    if (autoplay) {
        play()
    }

    const controls = {
        then(resolve: VoidFunction, reject?: VoidFunction) {
            return currentFinishedPromise.then(resolve, reject)
        },
        get time() {
            return millisecondsToSeconds(time)
        },
        set time(newTime: number) {
            newTime = secondsToMilliseconds(newTime)

            time = newTime
            if (holdTime !== null || !animationDriver) {
                holdTime = newTime
            } else {
                startTime = animationDriver.now() - newTime
            }
        },
        get state() {
            return playState
        },
        play,
        pause: () => {
            playState = "paused"
            holdTime = time
        },
        stop: () => {
            console.log("stpp[")
            if (playState === "idle") return
            playState = "idle"
            onStop && onStop()
            animationDriver && animationDriver.stop()
            animationDriver = undefined
        },
        sample: (elapsed: number) => {
            startTime = 0
            return tick(elapsed)!
        },
    }

    return controls
}
