import { AnimationPlaybackControls } from "../animate"
import { keyframes as keyframesGeneratorFactory } from "../generators/keyframes"
import { spring } from "../generators/spring/index"
import { inertia } from "../generators/inertia"
import { AnimationState, KeyframeGenerator } from "../generators/types"
import { DriverControls } from "./types"
import { AnimationOptions } from "../types"
import { frameloopDriver } from "./driver-frameloop"
import { interpolate } from "../../utils/interpolate"

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

export interface MainThreadAnimationControls<V>
    extends AnimationPlaybackControls {
    sample: (t: number) => AnimationState<V>
}

export function animateValue<V = number>({
    autoplay = true,
    duration = 0.3,
    delay = 0,
    driver = frameloopDriver,
    keyframes,
    type = "keyframes",
    repeat = 0,
    repeatDelay,
    repeatType,
    onPlay,
    onStop,
    onComplete,
    onUpdate,
    ...options
}: AnimationOptions<V>): MainThreadAnimationControls<V> {
    let animationDriver: DriverControls

    const generatorFactory = types[type] || keyframes

    let mapNumbersToKeyframes: undefined | ((t: number) => V)
    if (generatorFactory !== keyframesGeneratorFactory) {
        mapNumbersToKeyframes = interpolate([0, 100], keyframes, {
            clamp: false,
        })
        keyframes = [0, 100] as any
    }

    const generator = generatorFactory({ ...options, keyframes })

    // TODO: Flip initial velocity and keyframes
    // const mirroredGenerator =
    //     repeatType === "mirror"
    //         ? generatorFactory({
    //               ...options,
    //               keyframes: [...keyframes].reverse(),
    //           })
    //         : undefined

    let playState: AnimationPlayState = "idle"
    let pauseTime: number | null = null
    let startTime: number | null = null
    let t = 0

    const totalDuration = duration * (repeat + 1)

    const tick = (timestamp: number) => {
        if (startTime === null) return

        if (pauseTime !== null) {
            t = pauseTime
        } else {
            t = timestamp - startTime
        }

        // Convert to seconds
        t /= 1000

        // Rebase on delay
        t = Math.max(t - delay, 0)

        /**
         * If this animation has finished, set the current time
         * to the total duration.
         */
        if (playState === "finished" && pauseTime === null) {
            t = totalDuration
        }

        /**
         * Get the current progress (0-1) of the animation. If t is >
         * than duration we'll get values like 2.5 (midway through the
         * third iteration)
         */
        const progress = t / duration

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

        if (!iterationProgress && progress >= 1) {
            iterationProgress = 1
        }

        // TODO Repeat delay

        /**
         * If iteration progress is 1 we count that as the end
         * of the previous iteration.
         */
        iterationProgress === 1 && currentIteration--

        /**
         * Reverse progress if we're not running in "normal" direction
         */
        const iterationIsOdd = currentIteration % 2
        if (repeatType === "reverse" && iterationIsOdd) {
            iterationProgress = 1 - iterationProgress
        } else if (repeatType === "mirror") {
            // TODO Choose generator based on odd/even iteration
        }

        const p = t >= totalDuration ? 1 : Math.min(iterationProgress, 1)
        const latest = generator.next(p * duration).value

        if (onUpdate) {
            onUpdate(
                mapNumbersToKeyframes ? mapNumbersToKeyframes(latest) : latest
            )
        }

        const isAnimationFinished =
            pauseTime === null &&
            (playState === "finished" || t >= totalDuration)

        if (isAnimationFinished) {
            playState = "finished"
            // TODO Resolve promise
            animationDriver && animationDriver.stop()
        }
    }

    const play = () => {
        const now = performance.now()
        playState = "running"

        if (pauseTime !== null) {
            startTime = now - pauseTime
        } else if (!startTime) {
            startTime = now
        }

        pauseTime = null

        animationDriver = driver(tick)
        animationDriver.start()
    }

    if (autoplay) {
        play()
    }

    const controls = {
        stop: () => {},
        sample: () => ({ done: false, value: 0 } as any),
    }

    return controls
}
