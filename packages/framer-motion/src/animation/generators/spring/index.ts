import { generateLinearEasing } from "../../animators/waapi/utils/linear"
import {
    millisecondsToSeconds,
    secondsToMilliseconds,
} from "../../../utils/time-conversion"
import { ValueAnimationOptions, SpringOptions } from "../../types"
import { AnimationState, KeyframeGenerator } from "../types"
import { calcGeneratorVelocity } from "../utils/velocity"
import { calcAngularFreq, findSpring } from "./find"
import { calcGeneratorDuration } from "../utils/calc-duration"
import { maxGeneratorDuration } from "../utils/calc-duration"
import { clamp } from "../../../utils/clamp"

const durationKeys = ["duration", "bounce"]
const physicsKeys = ["stiffness", "damping", "mass"]

function isSpringType(options: SpringOptions, keys: string[]) {
    return keys.some((key) => (options as any)[key] !== undefined)
}

function getSpringOptions(options: SpringOptions) {
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
        if (options.perceptual) {
            const perceptualDuration = options.duration!
            const omega_0 =
                (2 * Math.PI) / millisecondsToSeconds(perceptualDuration)
            const stiffness = omega_0 * omega_0
            const damping =
                2 * clamp(0.05, 1, 1 - options.bounce!) * Math.sqrt(stiffness)

            springOptions = {
                ...springOptions,
                mass: 1.0,
                stiffness,
                damping,
            }
        } else {
            const derived = findSpring(options)

            springOptions = {
                ...springOptions,
                ...derived,
                mass: 1.0,
            }
            springOptions.isResolvedFromDuration = true
        }
    }

    return springOptions
}

export function spring(
    optionsOrPerceptualDuration: ValueAnimationOptions<number> | number = 0.2,
    bounce = 0.2
): KeyframeGenerator<number> {
    const options =
        typeof optionsOrPerceptualDuration === "number"
            ? ({
                  perceptual: true,
                  duration: secondsToMilliseconds(optionsOrPerceptualDuration),
                  keyframes: [0, 100],
                  bounce,
              } as ValueAnimationOptions<number>)
            : optionsOrPerceptualDuration

    let { restSpeed, restDelta } = options

    const origin = options.keyframes[0]
    const target = options.keyframes[options.keyframes.length - 1]

    /**
     * This is the Iterator-spec return value. We ensure it's mutable rather than using a generator
     * to reduce GC during animation.
     */
    const state: AnimationState<number> = { done: false, value: origin }

    const {
        stiffness,
        damping,
        mass,
        duration,
        velocity,
        isResolvedFromDuration,
    } = getSpringOptions({
        ...options,
        velocity: -millisecondsToSeconds(options.velocity || 0),
    })

    const initialVelocity = velocity || 0.0
    const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass))

    const initialDelta = target - origin
    const undampedAngularFreq = millisecondsToSeconds(
        Math.sqrt(stiffness / mass)
    )

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

    let resolveSpring: (v: number) => number
    if (dampingRatio < 1) {
        const angularFreq = calcAngularFreq(undampedAngularFreq, dampingRatio)

        // Underdamped spring
        resolveSpring = (t: number) => {
            const envelope = Math.exp(-dampingRatio * undampedAngularFreq * t)

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
                    (initialVelocity + undampedAngularFreq * initialDelta) * t)
    } else {
        // Overdamped spring
        const dampedAngularFreq =
            undampedAngularFreq * Math.sqrt(dampingRatio * dampingRatio - 1)

        resolveSpring = (t: number) => {
            const envelope = Math.exp(-dampingRatio * undampedAngularFreq * t)

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

    const generator = {
        calculatedDuration: isResolvedFromDuration ? duration || null : null,
        next: (t: number) => {
            const current = resolveSpring(t)

            if (!isResolvedFromDuration) {
                let currentVelocity = 0.0

                /**
                 * We only need to calculate velocity for under-damped springs
                 * as over- and critically-damped springs can't overshoot, so
                 * checking only for displacement is enough.
                 */
                if (dampingRatio < 1) {
                    currentVelocity =
                        t === 0
                            ? secondsToMilliseconds(initialVelocity)
                            : calcGeneratorVelocity(resolveSpring, t, current)
                }

                const isBelowVelocityThreshold =
                    Math.abs(currentVelocity) <= restSpeed!
                const isBelowDisplacementThreshold =
                    Math.abs(target - current) <= restDelta!

                state.done =
                    isBelowVelocityThreshold && isBelowDisplacementThreshold
            } else {
                state.done = t >= duration!
            }

            state.value = state.done ? target : current

            return state
        },
        toString: () => {
            const calculatedDuration = Math.min(
                calcGeneratorDuration(generator),
                maxGeneratorDuration
            )

            const easing = generateLinearEasing(
                (progress: number) =>
                    generator.next(calculatedDuration * progress).value / 100,
                calculatedDuration
            )

            return calculatedDuration + "ms " + easing
        },
    }

    return generator
}
