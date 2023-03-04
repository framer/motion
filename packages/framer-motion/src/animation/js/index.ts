import { AnimationPlaybackControls } from "../animate"
import { keyframes as keyframesGeneratorFactory } from "../generators/keyframes"
import { spring } from "../generators/spring/index"
import { inertia } from "../generators/inertia"
import { AnimationState, KeyframeGenerator } from "../generators/types"
import { DriverControls } from "./types"
import { AnimationOptions } from "../types"
import { frameloopDriver } from "./driver-frameloop"
import { interpolate } from "../../utils/interpolate"
import { clamp } from "../../utils/clamp"

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
 * TODO: Attempt to unify with other pregeneration functions
 */
function calculateDuration(generator: KeyframeGenerator<unknown>) {
    let duration = 0
    const timeStep = 50
    let state = generator.next(duration)
    while (!state.done && timeStep < 20000) {
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
    duration,
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
    let animationDriver: DriverControls

    const generatorFactory = types[type] || keyframes

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

    const generator = generatorFactory({ ...options, duration, keyframes })

    let mirroredGenerator: KeyframeGenerator<unknown> | undefined
    if (repeatType === "mirror") {
        mirroredGenerator = generatorFactory({
            ...options,
            duration,
            keyframes: [...keyframes].reverse(),
            velocity: -(options.velocity || 0),
        })
    }

    let playState: AnimationPlayState = "idle"
    let pauseTime: number | null = null
    let startTime: number | null = null
    let t = 0

    /**
     * If duration is undefined and we have repeat options,
     * we need to calculate a duration from the generator.
     */
    if (duration === undefined && repeat) {
        duration = calculateDuration(generator)
    }

    let resolvedDuration = Infinity
    let totalDuration = Infinity

    if (duration) {
        resolvedDuration = duration + repeatDelay
        totalDuration = resolvedDuration * (repeat + 1) - repeatDelay
    }

    const tick = (timestamp: number) => {
        if (startTime === null) return

        if (pauseTime !== null) {
            t = pauseTime
        } else {
            t = timestamp - startTime
        }

        // Rebase on delay
        t = Math.max(t - delay, 0)

        /**
         * If this animation has finished, set the current time
         * to the total duration.
         */
        if (playState === "finished" && pauseTime === null) {
            t = totalDuration
        }

        let calculatedElapsed = t

        let frameGenerator = generator

        if (repeat) {
            /**
             * Get the current progress (0-1) of the animation. If t is >
             * than duration we'll get values like 2.5 (midway through the
             * third iteration)
             */
            const progress = t / resolvedDuration

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
                t >= totalDuration
                    ? repeatType === "reverse" && iterationIsOdd
                        ? 0
                        : 1
                    : clamp(0, 1, iterationProgress)

            calculatedElapsed = p * resolvedDuration
        }

        let { value, done } = frameGenerator.next(calculatedElapsed)

        if (onUpdate) {
            onUpdate(
                mapNumbersToKeyframes ? mapNumbersToKeyframes(value) : value
            )
        }

        if (duration !== undefined) {
            done = t >= totalDuration
        }
        const isAnimationFinished =
            pauseTime === null && (playState === "finished" || done)

        if (isAnimationFinished) {
            playState = "finished"
            onComplete && onComplete()
            animationDriver && animationDriver.stop()
        }
    }

    const play = () => {
        animationDriver = driver(tick)
        const now = animationDriver.now()

        playState = "running"

        if (pauseTime !== null) {
            startTime = now - pauseTime
        } else if (!startTime) {
            startTime = now
        }

        pauseTime = null

        animationDriver.start()
    }

    if (autoplay) {
        play()
    }

    const controls = {
        stop: () => {
            animationDriver && animationDriver.start()
            onStop && onStop()
        },
        sample: () => ({ done: false, value: 0 } as any),
    }

    return controls
}
