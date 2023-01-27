import type { Animation, AnimationState } from "./types"
import { velocityPerSecond } from "../../utils/velocity-per-second"
import { AnimationOptions, SpringOptions } from "../types"
import { clamp } from "../../utils/clamp"

const durationKeys = ["duration", "bounce"]
const physicsKeys = ["stiffness", "damping", "mass"]

function isSpringType(options: SpringOptions, keys: string[]) {
    return keys.some((key) => (options as any)[key] !== undefined)
}

function calcAngularFreq(undampedFreq: number, dampingRatio: number) {
    return undampedFreq * Math.sqrt(1 - dampingRatio * dampingRatio)
}

const precision = 0.05
const maxIterations = 40

// TODO Tidy getSpringOptions
// TODO Pass restSpeed and restDelta?
export function findSpring({
    duration = 800,
    bounce = 1,
    mass = 1,
    ...options
}: AnimationOptions<number>) {
    const dampingRatio = clamp(0.05, 1, 1 - bounce)

    let hasFoundUpperBound = false
    let lowerBound = 0.0
    let upperBound = 800.0
    let stiffness = 0.0
    let damping = 0.0
    let searchArea = 0.0
    let i = 0

    do {
        searchArea = upperBound - lowerBound
        stiffness = lowerBound + searchArea / 4
        damping = dampingRatio * 2 * Math.sqrt(mass * stiffness)

        const { done } = spring({
            stiffness,
            damping,
            mass,
            ...options,
        }).next(duration)
        console.log({
            searchArea,
            upperBound,
            lowerBound,
            hasFoundUpperBound,
            stiffness,
            i,
        })
        if (done) {
            upperBound = stiffness
            hasFoundUpperBound = true
        } else {
            lowerBound = stiffness

            if (!hasFoundUpperBound) upperBound *= 4
        }
    } while (Math.abs(searchArea) > precision && ++i < maxIterations)

    return { stiffness, damping, isResolvedFromDuration: true }
}

const velocitySampleDuration = 5

/**
 * This is based on the spring implementation of Wobble https://github.com/skevy/wobble
 */
export function spring(options: AnimationOptions<number>): Animation<number> {
    let [origin, target] = options.keyframes

    /**
     * This is the Iterator-spec return value. We ensure it's mutable rather than using a generator
     * to reduce GC during animation.
     */
    const state: AnimationState<number> = { done: false, value: origin }

    if (
        !isSpringType(options, physicsKeys) &&
        isSpringType(options, durationKeys)
    ) {
        options = { ...options, ...findSpring(options) }
    }

    let {
        stiffness = 100,
        damping = 10,
        mass = 1,
        velocity = 0,
        duration = 1,
        restDelta,
        restSpeed,
        isResolvedFromDuration = false,
    } = options as any

    let resolveSpring = zero
    let initialVelocity = velocity ? -(velocity / 1000) : 0.0
    const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass))

    function createSpring() {
        const initialDelta = target - origin
        const undampedAngularFreq = Math.sqrt(stiffness / mass) / 1000

        /**
         * If we're working on a granular scale, use smaller defaults for determining
         * when the spring is finished.
         *
         * These defaults have been selected emprically based on what strikes a good
         * ratio between feeling good and finishing as soon as changes are imperceptible.
         */
        const isGranularScale = Math.abs(initialDelta) < 5
        restSpeed ||= isGranularScale ? 0.01 : 2
        restDelta ||= isGranularScale ? 0.005 : 0.5

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
                    Math.abs(currentVelocity) <= restSpeed!
                const isBelowDisplacementThreshold =
                    Math.abs(target - current) <= restDelta!

                state.done =
                    isBelowVelocityThreshold && isBelowDisplacementThreshold
                state.done &&
                    console.log({
                        origin,
                        target,
                        currentVelocity,
                        current,
                        isBelowVelocityThreshold,
                        isBelowDisplacementThreshold,
                    })
            } else {
                console.log({ t, duration })
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
