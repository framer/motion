import { Easing } from "../../easing/types"
import { resolveElements } from "../../render/dom/utils/resolve-element"
import { defaultOffset } from "../../utils/offsets/default"
import { fillOffset } from "../../utils/offsets/fill"
import { progress } from "../../utils/progress"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { DynamicAnimationOptions } from "../animate"
import {
    AnimationScope,
    DOMKeyframesDefinition,
    UnresolvedValueKeyframe,
} from "../types"
import {
    AnimationSequence,
    At,
    ElementSequence,
    ResolvedAnimationDefinitions,
    SequenceOptions,
    ValueSequence,
} from "./types"
import { calcNextTime } from "./utils/calc-time"
import { addKeyframes } from "./utils/edit"
import { compareByTime } from "./utils/sort"

export function createAnimationsFromSequence(
    sequence: AnimationSequence,
    { defaultTransition = {}, ...sequenceTransition }: SequenceOptions = {},
    scope?: AnimationScope
): ResolvedAnimationDefinitions {
    const animationDefinitions: ResolvedAnimationDefinitions = new Map()
    const elementSequences = new Map<Element, ElementSequence>()
    const elementCache = {}
    const timeLabels = new Map<string, number>()

    let prevTime = 0
    let currentTime = 0
    let totalDuration = 0

    /**
     * Build the timeline by mapping over the sequence array and converting
     * the definitions into keyframes and offsets with absolute time values.
     * These will later get converted into relative offsets in a second pass.
     */
    for (let i = 0; i < sequence.length; i++) {
        const segment = sequence[i]

        /**
         * If this is a timeline label, mark it and skip the rest of this iteration.
         */
        if (typeof segment === "string") {
            timeLabels.set(segment, currentTime)
            continue
        } else if (!Array.isArray(segment)) {
            timeLabels.set(
                segment.name,
                calcNextTime(currentTime, segment.at, prevTime, timeLabels)
            )
            continue
        }

        let [subject, keyframes, transition = {}] = segment

        /**
         * If a relative or absolute time value has been specified we need to resolve
         * it in relation to the currentTime.
         */
        if (transition.at !== undefined) {
            currentTime = calcNextTime(
                currentTime,
                transition.at,
                prevTime,
                timeLabels
            )
        }

        /**
         * Keep track of the maximum duration in this definition. This will be
         * applied to currentTime once the definition has been parsed.
         */
        let maxDuration = 0

        if (isMotionValue(subject)) {
            // TODO: Implement in later release
        } else {
            /**
             * Find all the elements specified in the definition and parse value
             * keyframes from their timeline definitions.
             */
            const elements = resolveElements(subject, scope, elementCache)
            const numElements = elements.length

            /**
             * For every element in this segment, process the defined values.
             */
            for (
                let elementIndex = 0;
                elementIndex < numElements;
                elementIndex++
            ) {
                /**
                 * Cast necessary, but we know these are of this type
                 */
                keyframes = keyframes as DOMKeyframesDefinition
                transition = transition as DynamicAnimationOptions

                const element = elements[elementIndex]
                const elementSequence = getElementSequence(
                    element,
                    elementSequences
                )

                for (const key in keyframes) {
                    const valueSequence = getValueSequence(key, elementSequence)
                    const valueKeyframes = keyframesAsList(keyframes[key]!)
                    const valueTransition = getValueTransition(transition, key)

                    const {
                        duration = defaultTransition.duration || 0.3,
                        ease = defaultTransition.ease || "easeOut",
                    } = valueTransition

                    const delay =
                        typeof valueTransition.delay === "function"
                            ? valueTransition.delay(elementIndex, numElements)
                            : valueTransition.delay || 0

                    const startTime = currentTime + delay
                    const targetTime = startTime + duration

                    const { times = defaultOffset(valueKeyframes) } =
                        valueTransition

                    /**
                     * If there's only one time offset of 0, fill in a second with length 1
                     */
                    if (times.length === 1 && times[0] === 0) {
                        times[1] = 1
                    }

                    /**
                     * Fill out if offset if fewer offsets than keyframes
                     */
                    const remainder = times.length - valueKeyframes.length
                    remainder > 0 && fillOffset(times, remainder)

                    /**
                     * If only one value has been set, ie [1], push a null to the start of
                     * the keyframe array. This will let us mark a keyframe at this point
                     * that will later be hydrated with the previous value.
                     */
                    valueKeyframes.length === 1 && valueKeyframes.unshift(null)

                    /**
                     * Add keyframes, mapping offsets to absolute time.
                     */
                    addKeyframes(
                        valueSequence,
                        valueKeyframes,
                        ease as Easing | Easing[],
                        times,
                        startTime,
                        targetTime
                    )

                    maxDuration = Math.max(delay + duration, maxDuration)
                    totalDuration = Math.max(targetTime, totalDuration)
                }
            }

            prevTime = currentTime
            currentTime += maxDuration
        }
    }

    /**
     * For every element and value combination create a new animation.
     */
    elementSequences.forEach((valueSequences, element) => {
        for (const key in valueSequences) {
            const valueSequence = valueSequences[key]

            /**
             * Arrange all the keyframes in ascending time order.
             */
            valueSequence.sort(compareByTime)

            const keyframes: UnresolvedValueKeyframe[] = []
            const valueOffset: number[] = []
            const valueEasing: Easing[] = []

            /**
             * For each keyframe, translate absolute times into
             * relative offsets based on the total duration of the timeline.
             */
            for (let i = 0; i < valueSequence.length; i++) {
                const { at, value, easing } = valueSequence[i]
                keyframes.push(value)
                valueOffset.push(progress(0, totalDuration, at))
                valueEasing.push(easing || "easeOut")
            }

            /**
             * If the first keyframe doesn't land on offset: 0
             * provide one by duplicating the initial keyframe. This ensures
             * it snaps to the first keyframe when the animation starts.
             */
            if (valueOffset[0] !== 0) {
                valueOffset.unshift(0)
                keyframes.unshift(keyframes[0])
                valueEasing.unshift("linear")
            }

            /**
             * If the last keyframe doesn't land on offset: 1
             * provide one with a null wildcard value. This will ensure it
             * stays static until the end of the animation.
             */
            if (valueOffset[valueOffset.length - 1] !== 1) {
                valueOffset.push(1)
                keyframes.push(null)
            }

            if (!animationDefinitions.has(element)) {
                animationDefinitions.set(element, {
                    keyframes: {},
                    transition: {},
                })
            }

            const definition = animationDefinitions.get(element)!

            definition.keyframes[key] = keyframes
            definition.transition[key] = {
                ...defaultTransition,
                duration: totalDuration,
                ease: valueEasing,
                times: valueOffset,
                ...sequenceTransition,
            }
        }
    })

    return animationDefinitions
}

function getElementSequence(
    element: Element,
    sequences: Map<Element, ElementSequence>
): ElementSequence {
    !sequences.has(element) && sequences.set(element, {})
    return sequences.get(element)!
}

function getValueSequence(
    name: string,
    sequences: ElementSequence
): ValueSequence {
    if (!sequences[name]) sequences[name] = []
    return sequences[name]
}

function keyframesAsList(
    keyframes: UnresolvedValueKeyframe | UnresolvedValueKeyframe[]
): UnresolvedValueKeyframe[] {
    return Array.isArray(keyframes) ? keyframes : [keyframes]
}

/**
 * TODO: Consolidate with other implementations
 */
export function getValueTransition(
    transition: DynamicAnimationOptions & At,
    key: string
): DynamicAnimationOptions {
    return transition[key]
        ? { ...transition, ...transition[key] }
        : { ...transition }
}
