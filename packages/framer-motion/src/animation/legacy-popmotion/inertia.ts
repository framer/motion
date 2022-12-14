import { PlaybackControls } from "./types"
import { animate } from "."
import { velocityPerSecond } from "../../utils/velocity-per-second"
import { frameData } from "../../frameloop/data"
import { AnimationOptions } from "../types"

export function inertia({
    keyframes,
    velocity = 0,
    min,
    max,
    power = 0.8,
    timeConstant = 750,
    bounceStiffness = 500,
    bounceDamping = 10,
    restDelta = 1,
    modifyTarget,
    driver,
    onUpdate,
    onComplete,
    onStop,
}: AnimationOptions) {
    const origin = keyframes[0]
    let currentAnimation: PlaybackControls

    function isOutOfBounds(v: number) {
        return (min !== undefined && v < min) || (max !== undefined && v > max)
    }

    function findNearestBoundary(v: number) {
        if (min === undefined) return max
        if (max === undefined) return min

        return Math.abs(min - v) < Math.abs(max - v) ? min : max
    }

    function startAnimation(options: Partial<AnimationOptions<number>>) {
        currentAnimation?.stop()

        currentAnimation = animate({
            keyframes: [0, 1],
            velocity: 0,
            ...options,
            driver,
            onUpdate: (v: number) => {
                onUpdate?.(v)
                options.onUpdate?.(v)
            },
            onComplete,
            onStop,
        })
    }

    function startSpring(options: { velocity: number; keyframes: any }) {
        startAnimation({
            type: "spring",
            stiffness: bounceStiffness,
            damping: bounceDamping,
            restDelta,
            ...options,
        })
    }

    if (isOutOfBounds(origin)) {
        // Start the animation with spring if outside the defined boundaries
        startSpring({
            velocity,
            keyframes: [origin, findNearestBoundary(origin)],
        })
    } else {
        /**
         * Or if the value is out of bounds, simulate the inertia movement
         * with the decay animation.
         *
         * Pre-calculate the target so we can detect if it's out-of-bounds.
         * If it is, we want to check per frame when to switch to a spring
         * animation
         */
        let target = power * velocity + origin
        if (typeof modifyTarget !== "undefined") target = modifyTarget(target)
        const boundary = findNearestBoundary(target)
        const heading = boundary === min ? -1 : 1
        let prev: number
        let current: number

        const checkBoundary = (v: number) => {
            prev = current
            current = v
            velocity = velocityPerSecond(v - prev, frameData.delta)

            if (
                (heading === 1 && v > boundary!) ||
                (heading === -1 && v < boundary!)
            ) {
                startSpring({ keyframes: [v, boundary], velocity })
            }
        }

        startAnimation({
            type: "decay",
            keyframes: [origin, 0],
            velocity,
            timeConstant,
            power,
            restDelta,
            modifyTarget,
            onUpdate: isOutOfBounds(target) ? checkBoundary : undefined,
        })
    }

    return {
        stop: () => currentAnimation?.stop(),
    }
}
