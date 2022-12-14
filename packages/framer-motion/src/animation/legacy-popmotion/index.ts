import { Driver, DriverControls } from "./types"
import { keyframes as keyframeAnimation } from "./keyframes"
import { spring } from "./spring"
import { decay } from "./decay"
import { sync, cancelSync } from "../../frameloop"
import { interpolate } from "../../utils/interpolate"
import { FrameData } from "../../frameloop/types"
import { AnimationOptions } from "../types"

const types = {
    decay,
    keyframes: keyframeAnimation,
    tween: keyframeAnimation,
    spring,
}

export function loopElapsed(elapsed: number, duration: number, delay = 0) {
    return elapsed - duration - delay
}

export function reverseElapsed(
    elapsed: number,
    duration: number = 0,
    delay = 0,
    isForwardPlayback = true
) {
    return isForwardPlayback
        ? loopElapsed(duration + -elapsed, duration, delay)
        : duration - (elapsed - duration) + delay
}

export function hasRepeatDelayElapsed(
    elapsed: number,
    duration: number,
    delay: number,
    isForwardPlayback: boolean
) {
    return isForwardPlayback ? elapsed >= duration + delay : elapsed <= -delay
}

const framesync: Driver = (update) => {
    const passTimestamp = ({ delta }: FrameData) => update(delta)

    return {
        start: () => sync.update(passTimestamp, true),
        stop: () => cancelSync.update(passTimestamp),
    }
}

export function animate<V = number>({
    duration,
    driver = framesync,
    elapsed = 0,
    repeat: repeatMax = 0,
    repeatType = "loop",
    repeatDelay = 0,
    keyframes,
    autoplay = true,
    onPlay,
    onStop,
    onComplete,
    onRepeat,
    onUpdate,
    type = "keyframes",
    ...options
}: AnimationOptions<V>) {
    let driverControls: DriverControls
    let repeatCount = 0
    let computedDuration: number | undefined = duration
    let latest: V
    let isComplete = false
    let isForwardPlayback = true

    let interpolateFromNumber: (t: number) => V

    const animator = types[keyframes.length > 2 ? "keyframes" : type]

    const origin = keyframes[0]
    const target = keyframes[keyframes.length - 1]

    if ((animator as any).needsInterpolation?.(origin, target)) {
        interpolateFromNumber = interpolate([0, 100], [origin, target], {
            clamp: false,
        }) as (t: number) => V
        keyframes = [0, 100] as any
    }

    const animation = animator({
        ...options,
        duration,
        keyframes,
    } as any)

    function repeat() {
        repeatCount++

        if (repeatType === "reverse") {
            isForwardPlayback = repeatCount % 2 === 0
            elapsed = reverseElapsed(
                elapsed,
                computedDuration,
                repeatDelay,
                isForwardPlayback
            )
        } else {
            elapsed = loopElapsed(elapsed, computedDuration!, repeatDelay)
            if (repeatType === "mirror") animation.flipTarget()
        }

        isComplete = false
        onRepeat && onRepeat()
    }

    function complete() {
        driverControls.stop()
        onComplete && onComplete()
    }

    function update(delta: number) {
        if (!isForwardPlayback) delta = -delta

        elapsed += delta

        if (!isComplete) {
            const state = animation.next(Math.max(0, elapsed))
            latest = state.value as any

            if (interpolateFromNumber)
                latest = interpolateFromNumber(latest as any)

            isComplete = isForwardPlayback ? state.done : elapsed <= 0
        }

        onUpdate && onUpdate(latest)

        if (isComplete) {
            if (repeatCount === 0) {
                computedDuration =
                    computedDuration !== undefined ? computedDuration : elapsed
            }

            if (repeatCount < repeatMax) {
                hasRepeatDelayElapsed(
                    elapsed,
                    computedDuration!,
                    repeatDelay,
                    isForwardPlayback
                ) && repeat()
            } else {
                complete()
            }
        }
    }

    function play() {
        onPlay && onPlay()
        driverControls = driver(update)
        driverControls.start()
    }

    autoplay && play()

    return {
        stop: () => {
            onStop && onStop()
            driverControls.stop()
        },
        sample: (t: number) => {
            return animation.next(Math.max(0, t)).value
        },
    }
}
