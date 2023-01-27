import type { Animation, AnimationState } from "../../legacy-popmotion/types"
import { findSpring } from "./find"
import { velocityPerSecond } from "../../../utils/velocity-per-second"
import { AnimationOptions, SpringOptions } from "../../types"
import {
    criticallyDampedSpring,
    overdampedSpring,
    underdampedSpring,
} from "./resolvers"

const durationKeys = ["duration", "bounce"]
const physicsKeys = ["stiffness", "damping", "mass"]

function isSpringType(options: SpringOptions, keys: string[]) {
    return keys.some((key) => (options as any)[key] !== undefined)
}

const velocitySampleDuration = 5

/**
 * This is based on the spring implementation of Wobble https://github.com/skevy/wobble
 */
export function spring({
    keyframes,
    ...options
}: AnimationOptions<number>): Animation<number> {
    let origin = keyframes[0]
    let target = keyframes[keyframes.length - 1]

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

    let resolveSpring = underdampedSpring
    let initialVelocity = velocity ? -(velocity / 1000) : 0.0
    let undampedAngularFreq = 0
    let initialDelta = 0
    const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass))

    function createSpring() {
        initialDelta = target - origin
        undampedAngularFreq = Math.sqrt(stiffness / mass) / 1000

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
            resolveSpring = underdampedSpring
        } else if (dampingRatio === 1) {
            resolveSpring = criticallyDampedSpring
        } else {
            resolveSpring = overdampedSpring
        }
    }

    createSpring()

    return {
        next: (t: number) => {
            const current = resolveSpring(
                target,
                initialDelta,
                initialVelocity,
                dampingRatio,
                undampedAngularFreq,
                t
            )

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
                            current -
                                resolveSpring(
                                    target,
                                    initialDelta,
                                    initialVelocity,
                                    dampingRatio,
                                    undampedAngularFreq,
                                    prevT
                                ),
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
