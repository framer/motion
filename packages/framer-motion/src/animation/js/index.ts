import { AnimationOptions, AnimationPlaybackControls } from "../animate"
import { keyframes } from "../generators/keyframes"
import { spring } from "../generators/spring"
import { inertia } from "../generators/inertia"
import { KeyframeGenerator } from "../generators/types"
import { cancelSync } from "../../frameloop"
import { DriverControls } from "./types"

const types: { [key: string]: () => KeyframeGenerator<any> } = {
    decay: inertia,
    inertia,
    tween: keyframes,
    keyframes,
    spring,
}

export function animateValue<V = number>({
    autoplay = true,
    duration,
    delay = 0,
    driver = frameloopDriver,
    keyframes,
    type = "keyframes",
    repeat,
    repeatDelay,
    repeatType,
    onPlay,
    onStop,
    onComplete,
    onUpdate,
    ...options
}: AnimationOptions<V>): AnimationPlaybackControls {
    let animationDriver: DriverControls
    const generator = types[type](options)
    const mirroredGenerator =
        repeatType === "mirror" ? types[type](options) : undefined

    let playState: AnimationPlayState = "idle"
    let pauseTime: number | null = null
    let startTime: number | null = null
    let t = 0

    let totalDuration = 0

    const tick = (timestamp: number) => {
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
        const latest = interpolate(p)

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

    return {
        stop: () => {},
    }
}
