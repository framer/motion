import type {
    SpringOptions,
    PhysicsSpringOptions,
    Animation,
    AnimationState,
} from "./types"
import { calcAngularFreq, findSpring } from "./find-spring"
import { velocityPerSecond } from "../../utils/velocity-per-second"
import { AnimationOptions } from "../types"

const durationKeys = ["duration", "bounce"]
const physicsKeys = ["stiffness", "damping", "mass"]

function isSpringType(options: SpringOptions, keys: string[]) {
    return keys.some((key) => (options as any)[key] !== undefined)
}

function getSpringOptions(options: SpringOptions): PhysicsSpringOptions & {
    duration?: number
    isResolvedFromDuration: boolean
} {
    let springOptions = {
        velocity: 0.0,
        stiffness: 100,
        damping: 10,
        mass: 1.0,
        isResolvedFromDuration: false,
        ...options,
    }

    // stiffness/damping/mass overrides duration/bounce
    if (
        !isSpringType(options, physicsKeys) &&
        isSpringType(options, durationKeys)
    ) {
        const derived = findSpring(options)

        springOptions = {
            ...springOptions,
            ...derived,
            velocity: 0.0,
            mass: 1.0,
        }
        springOptions.isResolvedFromDuration = true
    }

    return springOptions
}

const velocitySampleDuration = 5

/**
 * This is based on the spring implementation of Wobble https://github.com/skevy/wobble
 */
export function spring({
    keyframes,
    restSpeed = 2,
    restDelta = 0.01,
    ...options
}: AnimationOptions<number>): Animation<number> {
    let origin = keyframes[0]
    let target = keyframes[keyframes.length - 1]

    /**
     * This is the Iterator-spec return value. We ensure it's mutable rather than using a generator
     * to reduce GC during animation.
     */
    const state: AnimationState<number> = { done: false, value: origin }

    const {
        stiffness,
        damping,
        mass,
        velocity,
        duration,
        isResolvedFromDuration,
    } = getSpringOptions(options)

    let resolveSpring = zero
    let initialVelocity = velocity ? -(velocity / 1000) : 0.0
    const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass))

    function createSpring() {
        const initialDelta = target - origin
        const undampedAngularFreq = Math.sqrt(stiffness / mass) / 1000

        /**
         * If we're working within what looks like a 0-1 range, change the default restDelta
         * to 0.01
         */
        if (restDelta === undefined) {
            restDelta = Math.min(Math.abs(target - origin) / 100, 0.4)
        }

        if (dampingRatio < 1) {
            const angularFreq = calcAngularFreq(
                undampedAngularFreq,
                dampingRatio
            )

            // Underdamped spring
            resolveSpring = (t: number) => {
                const envelope = Math.exp(
                    -dampingRatio * undampedAngularFreq * t
                )

                return (
                    target -
                    envelope *
                        (((initialVelocity +
                            dampingRatio * undampedAngularFreq * initialDelta) /
                            angularFreq) *
                            Math.sin(angularFreq * t) +
                            initialDelta * Math.cos(angularFreq * t))
                )
            }
        } else if (dampingRatio === 1) {
            // Critically damped spring
            resolveSpring = (t: number) =>
                target -
                Math.exp(-undampedAngularFreq * t) *
                    (initialDelta +
                        (initialVelocity + undampedAngularFreq * initialDelta) *
                            t)
        } else {
            // Overdamped spring
            const dampedAngularFreq =
                undampedAngularFreq * Math.sqrt(dampingRatio * dampingRatio - 1)

            resolveSpring = (t: number) => {
                const envelope = Math.exp(
                    -dampingRatio * undampedAngularFreq * t
                )

                // When performing sinh or cosh values can hit Infinity so we cap them here
                const freqForT = Math.min(dampedAngularFreq * t, 300)

                return (
                    target -
                    (envelope *
                        ((initialVelocity +
                            dampingRatio * undampedAngularFreq * initialDelta) *
                            Math.sinh(freqForT) +
                            dampedAngularFreq *
                                initialDelta *
                                Math.cosh(freqForT))) /
                        dampedAngularFreq
                )
            }
        }
    }

    createSpring()

    return {
        next: (t: number) => {
            const current = resolveSpring(t)

            if (!isResolvedFromDuration) {
                let currentVelocity = initialVelocity

                if (t !== 0) {
                    /**
                     * We only need to calculate velocity for under-damped springs
                     * as over- and critically-damped springs can't overshoot, so
                     * checking only for displacement is enough.
                     */
                    if (dampingRatio < 1) {
                        const prevT = Math.max(0, t - velocitySampleDuration)
                        currentVelocity = velocityPerSecond(
                            current - resolveSpring(prevT),
                            t - prevT
                        )
                    } else {
                        currentVelocity = 0
                    }
                }

                const isBelowVelocityThreshold =
                    Math.abs(currentVelocity) <= restSpeed
                const isBelowDisplacementThreshold =
                    Math.abs(target - current) <= restDelta
                state.done =
                    isBelowVelocityThreshold && isBelowDisplacementThreshold
            } else {
                state.done = t >= duration!
            }

            state.value = state.done ? target : current
            return state
        },
        flipTarget: () => {
            initialVelocity = -initialVelocity
            ;[origin, target] = [target, origin]
            createSpring()
        },
    }
}

spring.needsInterpolation = (a: any, b: any) =>
    typeof a === "string" || typeof b === "string"

const zero = (_t: number) => 0
